import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Book, ReadingRecord, GradeFilter, StatusFilter, SortOption, ViewLayout, Student, AppTab } from './types';
import { DEFAULT_BOOKS } from './data/defaultBooks';
import { parseCSV } from './utils/csvParser';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterControls } from './components/FilterControls';
import { BookCard } from './components/BookCard';
import { BookListItem } from './components/BookListItem';
import { BookDetailModal } from './components/BookDetailModal';
import { CertificateModal } from './components/CertificateModal';
import { SettingsModal } from './components/SettingsModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentLookupView } from './components/StudentLookupView';
import { QuickRecordHero } from './components/QuickRecordHero';
import {
  loadStudentsFromStorage,
  saveStudentsToStorage,
  getCompletedCount,
  STORAGE_KEY_CURRENT_STUDENT_ID,
} from './utils/studentStorage';
import { BookOpen, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/12RkOA0v9V4UHuLtVHy_qkzUlRMNMGXT0CjGeinpz25U/export?format=csv';

const STORAGE_KEY_SHEET_URL = 'seoryong_sheet_url';

export default function App() {
  const [books, setBooks] = useState<Book[]>(DEFAULT_BOOKS);
  const [sheetUrl, setSheetUrl] = useState<string>(DEFAULT_SHEET_URL);

  // Multi-student roster state
  const [students, setStudents] = useState<Student[]>(() => loadStudentsFromStorage());
  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_CURRENT_STUDENT_ID);
    const initialStudents = loadStudentsFromStorage();
    if (savedId && initialStudents.some((s) => s.id === savedId)) {
      return savedId;
    }
    return initialStudents[0]?.id || '';
  });

  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<AppTab>('BOOKS');

  // Filters & Views for Books tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<GradeFilter>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [selectedSort, setSelectedSort] = useState<SortOption>('NUM_ASC');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('GRID');

  // Modals & Status
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [certificateStudent, setCertificateStudent] = useState<Student | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Active student object
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === currentStudentId) || students[0] || null;
  }, [students, currentStudentId]);

  // Current active records from activeStudent
  const records = useMemo(() => {
    return activeStudent?.records || {};
  }, [activeStudent]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Load Saved Sheet URL
  useEffect(() => {
    try {
      const savedSheetUrl = localStorage.getItem(STORAGE_KEY_SHEET_URL);
      if (savedSheetUrl) setSheetUrl(savedSheetUrl);
    } catch (e) {
      console.error('Failed to parse sheet config', e);
    }
  }, []);

  // Save Students to Storage whenever students change
  const handleUpdateStudentsList = useCallback((newStudents: Student[]) => {
    setStudents(newStudents);
    saveStudentsToStorage(newStudents);
  }, []);

  // Switch Active Student
  const handleSelectStudent = (student: Student) => {
    setCurrentStudentId(student.id);
    localStorage.setItem(STORAGE_KEY_CURRENT_STUDENT_ID, student.id);
    showToast(`'${student.name}' 학생으로 전환되었습니다! 📚`, 'success');
  };

  // Add a newly registered student and switch to them
  const handleRegisterNewStudent = (newStudent: Student) => {
    const updated = [newStudent, ...students];
    handleUpdateStudentsList(updated);
    handleSelectStudent(newStudent);
  };

  // Delete a single student
  const handleDeleteSingleStudent = (studentId: string, studentName: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    handleUpdateStudentsList(updated);

    if (currentStudentId === studentId) {
      const nextStudent = updated[0];
      if (nextStudent) {
        setCurrentStudentId(nextStudent.id);
        localStorage.setItem(STORAGE_KEY_CURRENT_STUDENT_ID, nextStudent.id);
      } else {
        setCurrentStudentId('');
        localStorage.removeItem(STORAGE_KEY_CURRENT_STUDENT_ID);
      }
    }

    showToast(`'${studentName}' 학생이 삭제되었습니다.`, 'info');
  };

  // Fetch CSV from Google Sheets
  const fetchBooksFromCSV = useCallback(
    async (urlToFetch: string) => {
      if (!urlToFetch) return;
      setIsSyncing(true);

      try {
        let response: Response;
        try {
          response = await fetch(urlToFetch, { cache: 'no-cache' });
        } catch {
          const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlToFetch)}`;
          response = await fetch(corsProxyUrl);
        }

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const csvText = await response.text();
        const parsedBooks = parseCSV(csvText);

        if (parsedBooks && parsedBooks.length > 0) {
          setBooks(parsedBooks);
          showToast(`구글 시트에서 총 ${parsedBooks.length}권의 도서 목록을 동기화했습니다!`, 'success');
        } else {
          showToast('구글 시트 파싱 결과가 없습니다. 기본 목록을 유지합니다.', 'info');
        }
      } catch (err) {
        console.warn('Google Sheets CSV fetch failed, using fallback list', err);
        showToast('구글 시트 연동에 실패하여 기본 도서 목록을 사용합니다.', 'info');
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Initial CSV fetch
  useEffect(() => {
    fetchBooksFromCSV(sheetUrl);
  }, [fetchBooksFromCSV, sheetUrl]);

  // Update records for active student
  const updateActiveStudentRecords = (updatedRecords: Record<string, ReadingRecord>) => {
    if (!activeStudent) return;

    const updatedStudents = students.map((s) => {
      if (s.id === activeStudent.id) {
        return {
          ...s,
          records: updatedRecords,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    handleUpdateStudentsList(updatedStudents);
  };

  // Toggle quick complete for active student
  const handleToggleComplete = (num: string) => {
    if (!activeStudent) {
      showToast('독서를 기록할 학생을 먼저 선택해주세요.', 'error');
      setActiveTab('STUDENT_LOOKUP');
      return;
    }

    const currentRecords = activeStudent.records || {};
    const existing = currentRecords[num];
    const currentStatus = existing?.status || 'UNREAD';
    const nextStatus = currentStatus === 'COMPLETED' ? 'UNREAD' : 'COMPLETED';

    const updatedRecords: Record<string, ReadingRecord> = {
      ...currentRecords,
      [num]: {
        ...existing,
        num,
        status: nextStatus,
        completedDate: nextStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined,
        updatedAt: new Date().toISOString(),
      },
    };

    updateActiveStudentRecords(updatedRecords);
    showToast(
      nextStatus === 'COMPLETED'
        ? `[${activeStudent.name}] No.${num} 도서를 완독 처리했습니다! 🎉`
        : `[${activeStudent.name}] No.${num} 도서를 미독으로 변경했습니다.`,
      nextStatus === 'COMPLETED' ? 'success' : 'info'
    );
  };

  // Save detail record for specific student (e.g. from hero component)
  const handleSaveRecordForStudent = (studentId: string, record: ReadingRecord) => {
    const targetStudent = students.find((s) => s.id === studentId);
    const targetName = targetStudent ? targetStudent.name : '학생';

    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        const currentRecords = s.records || {};
        return {
          ...s,
          records: {
            ...currentRecords,
            [record.num]: record,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    handleUpdateStudentsList(updatedStudents);
    showToast(`'${targetName}' 학생의 No.${record.num} 도서 감상 기록이 저장되었습니다! 📝`, 'success');
  };

  // Save detail record from modal
  const handleSaveRecord = (record: ReadingRecord) => {
    if (!activeStudent) return;

    const currentRecords = activeStudent.records || {};
    const updatedRecords: Record<string, ReadingRecord> = {
      ...currentRecords,
      [record.num]: record,
    };

    updateActiveStudentRecords(updatedRecords);
    showToast(`[${activeStudent.name}] No.${record.num} 도서 기록이 저장되었습니다!`, 'success');
  };

  // Delete record
  const handleDeleteRecord = (num: string) => {
    if (!activeStudent) return;

    const currentRecords = { ...(activeStudent.records || {}) };
    delete currentRecords[num];

    updateActiveStudentRecords(currentRecords);
    showToast(`No.${num} 도서 기록을 초기화했습니다.`, 'info');
  };

  // Save Settings
  const handleSaveSettings = (newUrl: string, name: string, gradeClass: string) => {
    setSheetUrl(newUrl);
    localStorage.setItem(STORAGE_KEY_SHEET_URL, newUrl);

    // If active student exists, update their name and grade/class
    if (activeStudent) {
      const parts = gradeClass.split(' ');
      const grade = parts[0] || activeStudent.grade;
      const className = parts[1] || activeStudent.className;

      const updated = students.map((s) =>
        s.id === activeStudent.id ? { ...s, name, grade, className, updatedAt: new Date().toISOString() } : s
      );
      handleUpdateStudentsList(updated);
    }

    showToast('설정이 저장되었습니다.', 'success');
    if (newUrl !== sheetUrl) {
      fetchBooksFromCSV(newUrl);
    }
  };

  // Backup Data Export (JSON)
  const handleExportData = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      students,
      currentStudentId,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `서룡초_전체학생_독서데이터_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('전체 학생 독서 데이터 백업 파일이 다운로드되었습니다.', 'success');
  };

  // Backup Data Import (JSON)
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported.students)) {
          handleUpdateStudentsList(imported.students);
          if (imported.currentStudentId) {
            setCurrentStudentId(imported.currentStudentId);
          }
          showToast('성공적으로 전체 학생 독서 데이터를 복원했습니다!', 'success');
        } else if (imported.records) {
          // Backward compatibility for single student backup
          if (activeStudent) {
            updateActiveStudentRecords(imported.records);
            showToast('현재 학생의 독서 기록을 복원했습니다!', 'success');
          }
        } else {
          showToast('올바르지 않은 백업 파일 형식입니다.', 'error');
        }
      } catch {
        showToast('파일을 읽는 도중 오류가 발생했습니다.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset All Records for Active Student
  const handleResetData = () => {
    if (confirm(`'${activeStudent?.name}' 학생의 모든 완독 및 독서록 기록을 초기화하시겠습니까?`)) {
      updateActiveStudentRecords({});
      showToast('독서 기록이 초기화되었습니다.', 'info');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGrade('ALL');
    setSelectedStatus('ALL');
    setSelectedSort('NUM_ASC');
  };

  // Filtered & Sorted books calculation
  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return books
      .filter((book) => {
        // Search filter
        const matchesSearch =
          !query ||
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.publisher.toLowerCase().includes(query) ||
          book.num.includes(query);

        // Grade filter
        let matchesGrade = true;
        if (selectedGrade !== 'ALL') {
          if (selectedGrade === '공통/기타') {
            matchesGrade =
              book.grade.includes('공통') ||
              book.grade.includes('전학년') ||
              (!book.grade.includes('1') &&
                !book.grade.includes('2') &&
                !book.grade.includes('3') &&
                !book.grade.includes('4') &&
                !book.grade.includes('5') &&
                !book.grade.includes('6'));
          } else {
            matchesGrade = book.grade.includes(selectedGrade);
          }
        }

        // Status filter
        let matchesStatus = true;
        const status = records[book.num]?.status || 'UNREAD';
        if (selectedStatus !== 'ALL') {
          matchesStatus = status === selectedStatus;
        }

        return matchesSearch && matchesGrade && matchesStatus;
      })
      .sort((a, b) => {
        if (selectedSort === 'NUM_ASC') {
          return (parseInt(a.num, 10) || 0) - (parseInt(b.num, 10) || 0);
        }
        if (selectedSort === 'NUM_DESC') {
          return (parseInt(b.num, 10) || 0) - (parseInt(a.num, 10) || 0);
        }
        if (selectedSort === 'TITLE_ASC') {
          return a.title.localeCompare(b.title, 'ko');
        }
        if (selectedSort === 'GRADE_ASC') {
          return a.grade.localeCompare(b.grade, 'ko');
        }
        if (selectedSort === 'RATING_DESC') {
          const ratingA = records[a.num]?.rating || 0;
          const ratingB = records[b.num]?.rating || 0;
          return ratingB - ratingA;
        }
        if (selectedSort === 'DATE_DESC') {
          const dateA = records[a.num]?.completedDate || '';
          const dateB = records[b.num]?.completedDate || '';
          return dateB.localeCompare(dateA);
        }
        return 0;
      });
  }, [books, records, searchQuery, selectedGrade, selectedStatus, selectedSort]);

  const completedCount = useMemo(() => {
    return books.filter((b) => records[b.num]?.status === 'COMPLETED').length;
  }, [books, records]);

  // Open certificate modal for a specific student or active student
  const handleOpenCertificateModal = (targetStudent?: Student) => {
    const target = targetStudent || activeStudent;
    setCertificateStudent(target);
    setIsCertificateOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 sm:p-6 md:p-8 notranslate" translate="no">
      {/* Toast Notification Floating */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toastMessage.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-200" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Header
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          activeStudent={activeStudent}
          completedCount={completedCount}
          totalCount={books.length}
          isLoading={isLoading}
          isSyncing={isSyncing}
          onRefreshData={() => fetchBooksFromCSV(sheetUrl)}
          onOpenCertificate={() => handleOpenCertificateModal()}
          onOpenSettings={() => setIsSettingsOpen(true)}
          totalStudentsCount={students.length}
        />

        {/* TAB 1: 100 BOOKS EXPLORATION & RECORDING */}
        {activeTab === 'BOOKS' && (
          <main className="space-y-6">
            {/* Real-time Student Quick Review & Star Rating Form Hero */}
            <QuickRecordHero
              books={books}
              students={students}
              activeStudent={activeStudent}
              onSelectStudent={handleSelectStudent}
              onRegisterStudent={handleRegisterNewStudent}
              onSaveRecord={handleSaveRecordForStudent}
            />

            {/* Reading Statistics Overview */}
            <StatsOverview books={books} records={records} />

            {/* Filter Controls */}
            <FilterControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              viewLayout={viewLayout}
              onViewLayoutChange={setViewLayout}
              filteredCount={filteredBooks.length}
              totalCount={books.length}
              onResetFilters={handleResetFilters}
            />

            {/* Book Grid / List Display */}
            {filteredBooks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-card my-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">검색 조건에 맞는 도서가 없습니다.</h3>
                <p className="text-xs text-slate-400 mt-1">검색어나 학년 필터를 변경해보세요.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  전체 도서 보기
                </button>
              </div>
            ) : viewLayout === 'GRID' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.num}
                    book={book}
                    record={records[book.num]}
                    onToggleComplete={handleToggleComplete}
                    onOpenDetail={(b) => setSelectedBookForDetail(b)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredBooks.map((book) => (
                  <BookListItem
                    key={book.num}
                    book={book}
                    record={records[book.num]}
                    onToggleComplete={handleToggleComplete}
                    onOpenDetail={(b) => setSelectedBookForDetail(b)}
                  />
                ))}
              </div>
            )}
          </main>
        )}

        {/* TAB 2: STUDENT LOOKUP & MY READING STATUS */}
        {activeTab === 'STUDENT_LOOKUP' && (
          <StudentLookupView
            books={books}
            students={students}
            currentStudent={activeStudent}
            onSelectStudent={handleSelectStudent}
            onOpenCertificate={(st) => handleOpenCertificateModal(st)}
            onGoToBooks={() => setActiveTab('BOOKS')}
            onRegisterStudent={handleRegisterNewStudent}
            onDeleteStudent={handleDeleteSingleStudent}
          />
        )}

        {/* TAB 3: TEACHER DASHBOARD */}
        {activeTab === 'TEACHER_DASHBOARD' && (
          <TeacherDashboard
            books={books}
            students={students}
            onUpdateStudents={handleUpdateStudentsList}
            onSelectStudentForReading={(st) => {
              handleSelectStudent(st);
              setActiveTab('BOOKS');
            }}
            onOpenCertificate={(st) => handleOpenCertificateModal(st)}
            currentStudentId={currentStudentId}
          />
        )}

        {/* Footer info */}
        <footer className="mt-12 text-center text-xs text-slate-400 py-6 border-t border-slate-200/60">
          <p>© 서룡초등학교 필독도서 100선 전자 독서 기록장</p>
          <p className="mt-1">교사용 명단 일괄 업로드 · 학생 독서 현황 조회 · 구글 시트 실시간 연동</p>
        </footer>
      </div>

      {/* Modals */}
      {selectedBookForDetail && (
        <BookDetailModal
          book={selectedBookForDetail}
          record={records[selectedBookForDetail.num]}
          onClose={() => setSelectedBookForDetail(null)}
          onSaveRecord={handleSaveRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      )}

      {isCertificateOpen && (
        <CertificateModal
          studentName={certificateStudent?.name || activeStudent?.name || '서룡 어린이'}
          studentGradeClass={`${certificateStudent?.grade || activeStudent?.grade || '3학년'} ${
            certificateStudent?.className || activeStudent?.className || '1반'
          }`}
          completedCount={
            certificateStudent
              ? getCompletedCount(certificateStudent)
              : completedCount
          }
          totalCount={books.length}
          onClose={() => {
            setIsCertificateOpen(false);
            setCertificateStudent(null);
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          sheetUrl={sheetUrl}
          studentName={activeStudent?.name || '서룡 어린이'}
          studentGradeClass={`${activeStudent?.grade || '3학년'} ${activeStudent?.className || '1반'}`}
          onSaveSettings={handleSaveSettings}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onResetData={handleResetData}
          onClose={() => setIsSettingsOpen(false)}
          defaultUrl={DEFAULT_SHEET_URL}
        />
      )}
    </div>
  );
}
