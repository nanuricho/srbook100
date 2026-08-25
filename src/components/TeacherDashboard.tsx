import React, { useState, useMemo } from 'react';
import { Book, Student, ReadingRecord } from '../types';
import {
  parseBatchStudentInput,
  createStudentId,
  exportStudentsRosterCSV,
  generateStudentTemplateCSV,
  getCompletedCount,
  getInProgressCount,
  getStudentProgressPercent,
  SAMPLE_STUDENTS,
} from '../utils/studentStorage';
import { getCurrentBadge, BADGES } from '../utils/badges';
import {
  Users,
  Upload,
  UserPlus,
  Download,
  Search,
  Filter,
  Award,
  BookOpen,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Eye,
  Star,
  Quote,
  X,
  PlusCircle,
  AlertTriangle,
  CheckSquare,
  Square,
  FileDown,
  RotateCcw,
  UploadCloud,
} from 'lucide-react';

interface TeacherDashboardProps {
  books: Book[];
  students: Student[];
  onUpdateStudents: (newStudents: Student[]) => void;
  onSelectStudentForReading: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
  currentStudentId: string | null;
}

type DeleteActionType =
  | { type: 'SINGLE'; student: Student }
  | { type: 'MULTIPLE'; studentIds: string[]; count: number }
  | { type: 'FILTERED'; grade: string; className: string; count: number; studentIds: string[] }
  | { type: 'ALL'; count: number };

export function TeacherDashboard({
  books,
  students,
  onUpdateStudents,
  onSelectStudentForReading,
  onOpenCertificate,
  currentStudentId,
}: TeacherDashboardProps) {
  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ROSTER' | 'BATCH_UPLOAD'>('OVERVIEW');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'READ_DESC' | 'NUM_ASC' | 'NAME_ASC' | 'DATE_DESC'>('READ_DESC');

  // Multi-Selection State for Batch Deletion
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Deletion Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteActionType | null>(null);

  // Inspected student for detailed portfolio modal
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);

  // Batch Upload States
  const [batchText, setBatchText] = useState<string>('');
  const [batchDefaultGrade, setBatchDefaultGrade] = useState<string>('3학년');
  const [batchDefaultClass, setBatchDefaultClass] = useState<string>('1반');
  const [batchImportMode, setBatchImportMode] = useState<'APPEND' | 'REPLACE'>('APPEND');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Single Add Inline Drawer State
  const [isSingleAddOpen, setIsSingleAddOpen] = useState<boolean>(false);
  const [singleGrade, setSingleGrade] = useState<string>('3학년');
  const [singleClass, setSingleClass] = useState<string>('1반');
  const [singleNumber, setSingleNumber] = useState<string>('1번');
  const [singleName, setSingleName] = useState<string>('');

  // Extract all distinct grades and classes
  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    students.forEach((s) => s.grade && grades.add(s.grade));
    return Array.from(grades).sort();
  }, [students]);

  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    students.forEach((s) => {
      if (selectedGradeFilter === 'ALL' || s.grade === selectedGradeFilter) {
        if (s.className) classes.add(s.className);
      }
    });
    return Array.from(classes).sort();
  }, [students, selectedGradeFilter]);

  // Filtered & Sorted Student Roster
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return students
      .filter((s) => {
        // Grade filter
        if (selectedGradeFilter !== 'ALL' && s.grade !== selectedGradeFilter) return false;
        // Class filter
        if (selectedClassFilter !== 'ALL' && s.className !== selectedClassFilter) return false;
        // Query search (name or number)
        if (q) {
          const matchName = s.name.toLowerCase().includes(q);
          const matchNum = s.studentNumber ? s.studentNumber.toLowerCase().includes(q) : false;
          return matchName || matchNum;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'READ_DESC') {
          return getCompletedCount(b) - getCompletedCount(a);
        }
        if (sortOption === 'NUM_ASC') {
          const numA = parseInt(a.studentNumber?.replace(/[^0-9]/g, '') || '0', 10);
          const numB = parseInt(b.studentNumber?.replace(/[^0-9]/g, '') || '0', 10);
          if (numA !== numB) return numA - numB;
          return a.name.localeCompare(b.name, 'ko');
        }
        if (sortOption === 'NAME_ASC') {
          return a.name.localeCompare(b.name, 'ko');
        }
        if (sortOption === 'DATE_DESC') {
          return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        }
        return 0;
      });
  }, [students, selectedGradeFilter, selectedClassFilter, searchQuery, sortOption]);

  // Overall Statistics
  const overallStats = useMemo(() => {
    const totalStudents = students.length;
    let totalCompleted = 0;
    let totalReviews = 0;
    let masterCount = 0; // Students with >= 100 books

    students.forEach((s) => {
      const c = getCompletedCount(s);
      totalCompleted += c;
      if (c >= 100) masterCount++;

      if (s.records) {
        Object.values(s.records).forEach((r) => {
          if (r.review && r.review.trim()) totalReviews++;
        });
      }
    });

    const avgCompleted = totalStudents > 0 ? (totalCompleted / totalStudents).toFixed(1) : '0';

    return {
      totalStudents,
      totalCompleted,
      totalReviews,
      masterCount,
      avgCompleted,
    };
  }, [students]);

  // Top Readers Ranking
  const topReaders = useMemo(() => {
    return [...students]
      .map((s) => ({
        student: s,
        count: getCompletedCount(s),
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [students]);

  // Batch Parser Live Preview
  const parsedPreview = useMemo(() => {
    if (!batchText.trim()) return [];
    return parseBatchStudentInput(batchText, batchDefaultGrade, batchDefaultClass);
  }, [batchText, batchDefaultGrade, batchDefaultClass]);

  // Execute Batch Import
  const handleExecuteBatchImport = () => {
    if (parsedPreview.length === 0) return;

    const newStudentObjects: Student[] = parsedPreview.map((row, idx) => {
      const uniqueId = createStudentId(row.grade, row.className, row.studentNumber || `${idx + 1}번`, row.name);
      return {
        id: uniqueId,
        grade: row.grade,
        className: row.className,
        studentNumber: row.studentNumber || `${idx + 1}번`,
        name: row.name,
        records: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    let updatedList: Student[];
    if (batchImportMode === 'REPLACE') {
      updatedList = newStudentObjects;
    } else {
      // Append without duplicate IDs
      const existingKeySet = new Set(
        students.map((s) => `${s.grade}_${s.className}_${s.studentNumber}_${s.name}`)
      );
      const toAdd = newStudentObjects.filter(
        (s) => !existingKeySet.has(`${s.grade}_${s.className}_${s.studentNumber}_${s.name}`)
      );
      updatedList = [...students, ...toAdd];
    }

    onUpdateStudents(updatedList);
    setUploadSuccessMessage(
      `총 ${newStudentObjects.length}명의 학생 명단이 성공적으로 ${
        batchImportMode === 'REPLACE' ? '새로 교체 등록' : '추가 등록'
      }되었습니다!`
    );
    setBatchText('');
    setSelectedStudentIds([]);
    setTimeout(() => {
      setUploadSuccessMessage(null);
      setActiveTab('ROSTER');
    }, 1200);
  };

  // Load Sample Preset Roster
  const handleLoadSampleRoster = () => {
    const sampleText = SAMPLE_STUDENTS.map(
      (s) => `${s.grade} ${s.className} ${s.studentNumber || '1번'} ${s.name}`
    ).join('\n');
    setBatchText(sampleText);
  };

  // Single Student Add
  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) return;

    const newStudent: Student = {
      id: createStudentId(singleGrade, singleClass, singleNumber, singleName),
      grade: singleGrade,
      className: singleClass,
      studentNumber: singleNumber,
      name: singleName.trim(),
      records: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateStudents([...students, newStudent]);
    setIsSingleAddOpen(false);
    setSingleName('');
  };

  // Handle Multi-Selection Checkbox toggles
  const handleToggleSelectAll = () => {
    const currentFilteredIds = filteredStudents.map((s) => s.id);
    const allSelected = currentFilteredIds.every((id) => selectedStudentIds.includes(id));

    if (allSelected) {
      // Deselect all filtered
      setSelectedStudentIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Execute Confirmed Deletions
  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;

    let updated: Student[] = [];

    switch (deleteConfirmation.type) {
      case 'SINGLE': {
        const targetId = deleteConfirmation.student.id;
        updated = students.filter((s) => s.id !== targetId);
        if (inspectedStudent?.id === targetId) {
          setInspectedStudent(null);
        }
        setSelectedStudentIds((prev) => prev.filter((id) => id !== targetId));
        break;
      }
      case 'MULTIPLE': {
        const toDeleteSet = new Set(deleteConfirmation.studentIds);
        updated = students.filter((s) => !toDeleteSet.has(s.id));
        if (inspectedStudent && toDeleteSet.has(inspectedStudent.id)) {
          setInspectedStudent(null);
        }
        setSelectedStudentIds([]);
        break;
      }
      case 'FILTERED': {
        const toDeleteSet = new Set(deleteConfirmation.studentIds);
        updated = students.filter((s) => !toDeleteSet.has(s.id));
        if (inspectedStudent && toDeleteSet.has(inspectedStudent.id)) {
          setInspectedStudent(null);
        }
        setSelectedStudentIds((prev) => prev.filter((id) => !toDeleteSet.has(id)));
        break;
      }
      case 'ALL': {
        updated = [];
        setInspectedStudent(null);
        setSelectedStudentIds([]);
        break;
      }
    }

    onUpdateStudents(updated);
    setDeleteConfirmation(null);
  };

  // Restore Default Sample Students
  const handleRestoreSampleStudents = () => {
    if (confirm('기본 예시 학생 6명의 데이터로 복원하시겠습니까?')) {
      onUpdateStudents(SAMPLE_STUDENTS);
      setSelectedStudentIds([]);
      setInspectedStudent(null);
    }
  };

  // Export CSV Report
  const handleDownloadCSV = () => {
    const csvContent = exportStudentsRosterCSV(filteredStudents, books.length || 100);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `서룡초_학급독서현황_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Sample Template CSV for teachers
  const handleDownloadTemplateCSV = () => {
    const csvContent = generateStudentTemplateCSV();
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `서룡초_학생명단_업로드양식.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // File drop / picker handler for text or csv
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBatchText(content);
        setActiveTab('BATCH_UPLOAD');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="space-y-6 notranslate" translate="no">
      {/* Top Banner / Navigation for Teacher */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-6 md:p-8 shadow-vibrant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-indigo-200 backdrop-blur-md mb-2 border border-white/10">
              <Users className="w-3.5 h-3.5" /> 교사용 관리 대시보드
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              서룡초 독서 지도 & 학생 명단 관리
            </h2>
            <p className="text-sm text-indigo-200 mt-1 max-w-xl">
              학생 명단 일괄 업로드 · 개별/다중 명단 삭제 · 100선 완독 진도 및 감상평 점검
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('BATCH_UPLOAD')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeTab === 'BATCH_UPLOAD'
                  ? 'bg-white text-indigo-900 font-black'
                  : 'bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-500/40'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>명단 일괄 업로드</span>
            </button>

            <button
              onClick={handleDownloadTemplateCSV}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-800/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-600/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="엑셀에서 열어 바로 작성 가능한 명단 양식 다운로드"
            >
              <FileDown className="w-4 h-4" />
              <span>양식 CSV 다운로드</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              disabled={students.length === 0}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>현황 CSV 다운로드</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-indigo-700/50 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'bg-white text-indigo-900 shadow-xs font-black'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            📊 전체 통계 & 랭킹
          </button>
          <button
            onClick={() => setActiveTab('ROSTER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ROSTER'
                ? 'bg-white text-indigo-900 shadow-xs font-black'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            📋 학생별 독서 현황 및 명단 관리 ({students.length}명)
          </button>
          <button
            onClick={() => setActiveTab('BATCH_UPLOAD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'BATCH_UPLOAD'
                ? 'bg-white text-indigo-900 shadow-xs font-black'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            📥 명단 일괄 업로드
          </button>
        </div>
      </div>

      {/* VIEW 1: BATCH UPLOAD TAB */}
      {activeTab === 'BATCH_UPLOAD' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                학생 명단 일괄 업로드 (CSV / 엑셀 복사-붙여넣기)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                엑셀이나 한글에서 복사하여 붙여넣거나 CSV/TXT 파일을 드래그하여 간편하게 등록하세요.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadTemplateCSV}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-500" />
                양식 CSV 받기
              </button>

              <button
                type="button"
                onClick={handleLoadSampleRoster}
                className="px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer border border-indigo-100 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                예시 명단 불러오기
              </button>
            </div>
          </div>

          {uploadSuccessMessage && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-2xl font-bold text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{uploadSuccessMessage}</span>
            </div>
          )}

          {/* Quick Upload Options: Default Grade / Class Fallbacks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                기본 학년 (생략 시 자동 적용)
              </label>
              <select
                value={batchDefaultGrade}
                onChange={(e) => setBatchDefaultGrade(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              >
                {['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                기본 반 (생략 시 자동 적용)
              </label>
              <select
                value={batchDefaultClass}
                onChange={(e) => setBatchDefaultClass(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              >
                {['1반', '2반', '3반', '4반', '5반', '6반', '7반'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">
                업로드 방식 선택
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBatchImportMode('APPEND')}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    batchImportMode === 'APPEND'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  기존 명단에 추가
                </button>
                <button
                  type="button"
                  onClick={() => setBatchImportMode('REPLACE')}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    batchImportMode === 'REPLACE'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  새 명단으로 교체
                </button>
              </div>
            </div>
          </div>

          {/* File Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragOver
                ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-black text-slate-800">
              CSV 파일이나 텍스트(.txt/.csv) 파일을 이곳에 드래그하거나 선택하세요
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              엑셀에서 '다른 이름으로 저장' → CSV(쉼표로 분리)로 저장된 파일 지원
            </p>
            <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-700 border-2 border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all cursor-pointer shadow-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>내 컴퓨터에서 파일 찾아보기</span>
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Text Area Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700">
                직접 텍스트 붙여넣기 (한 줄에 1명씩 또는 쉼표/공백 구분)
              </label>
              {batchText && (
                <button
                  type="button"
                  onClick={() => setBatchText('')}
                  className="text-xs text-rose-500 hover:underline font-bold"
                >
                  지우기
                </button>
              )}
            </div>

            <textarea
              rows={6}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`다양한 형식을 모두 자동 파싱합니다:\n1) 3학년 1반 1번 김민준\n2) 3-1 2 이서아\n3) 3,1,3,박도윤\n4) 엑셀에서 복사한 이름 목록:\n김민준\n이서아\n박도윤\n최지우`}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all leading-relaxed"
            />
          </div>

          {/* Live Parsing Preview */}
          {parsedPreview.length > 0 ? (
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    파싱된 학생 명단 미리보기: 총 {parsedPreview.length}명
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    아래 명단이 등록됩니다. 확인 후 업로드 완료 버튼을 눌러주세요.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteBatchImport}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-indigo-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>총 {parsedPreview.length}명 업로드 완료하기</span>
                </button>
              </div>

              {/* Preview Table */}
              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-2.5">번호</th>
                      <th className="p-2.5">학년</th>
                      <th className="p-2.5">반</th>
                      <th className="p-2.5">출석번호</th>
                      <th className="p-2.5">학생 이름</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-indigo-700">{item.grade}</td>
                        <td className="p-2.5 text-slate-700">{item.className}</td>
                        <td className="p-2.5 text-slate-500">{item.studentNumber || `${idx + 1}번`}</td>
                        <td className="p-2.5 font-black text-slate-900">{item.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : batchText.trim() ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>학생 이름을 인식하지 못했습니다. 형식을 확인해주세요. (예: 3학년 1반 1번 홍길동)</span>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW 2: OVERVIEW & TOP RANKINGS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">총 등록 학생</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                {overallStats.totalStudents}명
              </p>
              <p className="text-[11px] text-slate-400 mt-1">서룡초 전자 기록장</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">누적 완독 권수</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-emerald-600 mt-2">
                {overallStats.totalCompleted}권
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                1인 평균 {overallStats.avgCompleted}권
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">작성된 감상평</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Quote className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-amber-600 mt-2">
                {overallStats.totalReviews}편
              </p>
              <p className="text-[11px] text-slate-400 mt-1">생각 & 인용구 기록</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">100선 완독 달성</span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-purple-600 mt-2">
                {overallStats.masterCount}명
              </p>
              <p className="text-[11px] text-slate-400 mt-1">명예의 전당 마스터</p>
            </div>
          </div>

          {/* Top Readers Podium / Leaderboard */}
          <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  서룡 다독왕 랭킹 (Top 5)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  100선 필독도서를 가장 활발하게 읽고 있는 학생들입니다.
                </p>
              </div>
            </div>

            {topReaders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                아직 완독 기록이 등록된 학생이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {topReaders.map((item, index) => {
                  const s = item.student;
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎖️';
                  const badge = getCurrentBadge(item.count);

                  return (
                    <div
                      key={s.id}
                      onClick={() => setInspectedStudent(s)}
                      className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer text-center group"
                    >
                      <div className="text-2xl mb-1">{medal}</div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {s.grade} {s.className}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">{s.name}</h4>
                      <p className="text-xs font-extrabold text-indigo-600 mt-1">
                        완독 {item.count}권
                        <span className="text-slate-400 font-normal text-[11px]"> / 100권</span>
                      </p>
                      {badge && (
                        <div className="mt-2.5 text-[10px] font-bold text-slate-600 bg-white/80 py-1 px-2 rounded-lg border border-slate-200/60 flex items-center justify-center gap-1">
                          <span>{badge.icon}</span>
                          <span className="truncate">{badge.title}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: ROSTER TABLE TAB & MANAGEMENT */}
      {(activeTab === 'ROSTER' || activeTab === 'OVERVIEW') && (
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-100 shadow-card space-y-5">
          {/* Header & Action row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                학급 학생 명단 관리 & 독서 진도표
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                총 {students.length}명의 학생 중 {filteredStudents.length}명 표시 중 · 학생 개별 및 일괄 삭제 가능
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsSingleAddOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer border border-indigo-100 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>학생 개별 등록</span>
              </button>

              <button
                onClick={() => setActiveTab('BATCH_UPLOAD')}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all cursor-pointer border-2 border-slate-200 flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>일괄 업로드</span>
              </button>
            </div>
          </div>

          {/* Single Student Add Drawer */}
          {isSingleAddOpen && (
            <div className="p-4 sm:p-5 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl animate-fadeIn space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  학생 개별 등록
                </h4>
                <button
                  type="button"
                  onClick={() => setIsSingleAddOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSingleStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">학년</label>
                  <select
                    value={singleGrade}
                    onChange={(e) => setSingleGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">반</label>
                  <input
                    type="text"
                    value={singleClass}
                    onChange={(e) => setSingleClass(e.target.value)}
                    placeholder="1반"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">출석번호</label>
                  <input
                    type="text"
                    value={singleNumber}
                    onChange={(e) => setSingleNumber(e.target.value)}
                    placeholder="15번"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1">이름 *</label>
                  <input
                    type="text"
                    required
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    placeholder="김민준"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-4 flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSingleAddOpen(false)}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 shadow-xs"
                  >
                    등록 완료
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Bar: Grade & Class Pills + Search */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="학생 이름이나 번호로 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {/* Grade Filter */}
              <select
                value={selectedGradeFilter}
                onChange={(e) => {
                  setSelectedGradeFilter(e.target.value);
                  setSelectedClassFilter('ALL');
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
              >
                <option value="ALL">전체 학년</option>
                {availableGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              {/* Class Filter */}
              {availableClasses.length > 0 && (
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                >
                  <option value="ALL">전체 반</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort Selector */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
              >
                <option value="READ_DESC">완독 많은 순</option>
                <option value="NUM_ASC">번호 순</option>
                <option value="NAME_ASC">이름 순</option>
                <option value="DATE_DESC">최근 활동 순</option>
              </select>
            </div>
          </div>

          {/* Sticky Multi-Select Action Bar */}
          {selectedStudentIds.length > 0 && (
            <div className="p-3.5 bg-indigo-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-300" />
                <span className="text-xs font-black">
                  선택된 학생: <strong className="text-amber-300">{selectedStudentIds.length}명</strong>
                </span>
                <span className="text-[11px] text-indigo-300">
                  (전체 {students.length}명 중)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="px-3 py-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 rounded-xl transition-all cursor-pointer"
                >
                  선택 해제
                </button>

                <button
                  onClick={() =>
                    setDeleteConfirmation({
                      type: 'MULTIPLE',
                      studentIds: selectedStudentIds,
                      count: selectedStudentIds.length,
                    })
                  }
                  className="px-4 py-1.5 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>선택한 {selectedStudentIds.length}명 일괄 삭제</span>
                </button>
              </div>
            </div>
          )}

          {/* Student Roster Table */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">해당 조건의 학생이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">
                상단의 '명단 일괄 업로드' 버튼을 눌러 학생들을 추가해보세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="p-3.5 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        title="현재 목록 전체 선택"
                        className="text-slate-600 hover:text-indigo-600 cursor-pointer"
                      >
                        {filteredStudents.length > 0 &&
                        filteredStudents.every((s) => selectedStudentIds.includes(s.id)) ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5">학급 / 번호</th>
                    <th className="p-3.5">학생 이름</th>
                    <th className="p-3.5">완독 진도 (100선)</th>
                    <th className="p-3.5 text-center">완독</th>
                    <th className="p-3.5 text-center">읽는 중</th>
                    <th className="p-3.5">칭호</th>
                    <th className="p-3.5 text-right">관리 & 삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const completed = getCompletedCount(s);
                    const inProgress = getInProgressCount(s);
                    const percent = getStudentProgressPercent(s, books.length || 100);
                    const badge = getCurrentBadge(completed);
                    const isCurrent = currentStudentId === s.id;
                    const isChecked = selectedStudentIds.includes(s.id);

                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-indigo-50/40 transition-colors ${
                          isChecked ? 'bg-indigo-50/80 font-medium' : isCurrent ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectStudent(s.id)}
                            className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="p-3.5 text-slate-600 font-medium whitespace-nowrap">
                          <span className="font-bold text-indigo-700">{s.grade} {s.className}</span>
                          {s.studentNumber && (
                            <span className="text-slate-400 ml-1.5">{s.studentNumber}</span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{s.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
                                접속중
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 w-48">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  percent >= 100
                                    ? 'bg-gradient-to-r from-purple-500 to-amber-500'
                                    : percent >= 50
                                    ? 'bg-emerald-500'
                                    : 'bg-indigo-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-700 w-9 text-right">{percent}%</span>
                          </div>
                        </td>

                        <td className="p-3.5 text-center font-black text-emerald-600 text-sm whitespace-nowrap">
                          {completed}권
                        </td>

                        <td className="p-3.5 text-center font-bold text-amber-600 whitespace-nowrap">
                          {inProgress}권
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {badge ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white bg-gradient-to-r ${badge.color}`}
                            >
                              {badge.icon} {badge.title}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">독서 시작</span>
                          )}
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectedStudent(s)}
                              title="독서 상세 기록 보기"
                              className="p-1.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenCertificate(s)}
                              disabled={completed === 0}
                              title="완독 인증서 출력"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Award className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onSelectStudentForReading(s)}
                              title="이 학생으로 독서 기록하기"
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>기록</span>
                            </button>

                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'SINGLE',
                                  student: s,
                                })
                              }
                              title="학생 및 독서기록 삭제"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Roster Management & Danger Zone */}
          <div className="mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>명단 관리 액션:</span>
              <button
                type="button"
                onClick={handleRestoreSampleStudents}
                className="text-slate-600 hover:text-indigo-600 font-bold underline cursor-pointer"
              >
                예시 명단으로 복원
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedGradeFilter !== 'ALL' && filteredStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirmation({
                      type: 'FILTERED',
                      grade: selectedGradeFilter,
                      className: selectedClassFilter,
                      count: filteredStudents.length,
                      studentIds: filteredStudents.map((s) => s.id),
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {selectedGradeFilter} {selectedClassFilter !== 'ALL' ? selectedClassFilter : ''} (
                    {filteredStudents.length}명) 전체 삭제
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmation({
                    type: 'ALL',
                    count: students.length,
                  })
                }
                disabled={students.length === 0}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>전체 학생 명단 일괄 삭제 (초기화)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAILED PORTFOLIO MODAL (INSPECT) */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-200">
                  {inspectedStudent.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {inspectedStudent.grade} {inspectedStudent.className} {inspectedStudent.studentNumber}
                    </span>
                    {getCurrentBadge(getCompletedCount(inspectedStudent)) && (
                      <span className="text-xs font-bold text-slate-500">
                        {getCurrentBadge(getCompletedCount(inspectedStudent))?.icon}{' '}
                        {getCurrentBadge(getCompletedCount(inspectedStudent))?.title}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {inspectedStudent.name} 학생의 독서 포트폴리오
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setInspectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl text-center border border-slate-200/80">
              <div>
                <p className="text-[11px] font-bold text-slate-400">완독 도서</p>
                <p className="text-lg font-black text-indigo-600">
                  {getCompletedCount(inspectedStudent)}권
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">완독 달성률</p>
                <p className="text-lg font-black text-emerald-600">
                  {getStudentProgressPercent(inspectedStudent, books.length || 100)}%
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400">읽는 중</p>
                <p className="text-lg font-black text-amber-600">
                  {getInProgressCount(inspectedStudent)}권
                </p>
              </div>
            </div>

            {/* Completed Books & Reviews List */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                기록된 독서 감상문 목록
              </h4>

              {Object.keys(inspectedStudent.records || {}).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl">
                  아직 기록된 도서가 없습니다.
                </div>
              ) : (
                (Object.values(inspectedStudent.records) as ReadingRecord[]).map((record) => {
                  const book = books.find((b) => b.num === record.num);
                  return (
                    <div
                      key={record.num}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-indigo-600">No.{record.num}</span>
                          <span className="font-black text-slate-900">{book?.title || `도서 #${record.num}`}</span>
                          <span className="text-[10px] text-slate-400">{book?.grade}</span>
                        </div>
                        {record.completedDate && (
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {record.completedDate} 완독
                          </span>
                        )}
                      </div>

                      {record.rating && (
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= (record.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {record.review && (
                        <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                          <strong className="text-indigo-600 block text-[10px] mb-0.5">✍️ 한 줄 소감</strong>
                          {record.review}
                        </p>
                      )}

                      {record.quote && (
                        <p className="text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 flex items-start gap-1.5">
                          <Quote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>"{record.quote}"</span>
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmation({
                    type: 'SINGLE',
                    student: inspectedStudent,
                  });
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>이 학생 삭제</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenCertificate(inspectedStudent);
                  }}
                  disabled={getCompletedCount(inspectedStudent) === 0}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>완독 인증서 출력</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectStudentForReading(inspectedStudent);
                    setInspectedStudent(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-200"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>이 학생으로 책 기록</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETION SAFETY CONFIRMATION MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {deleteConfirmation.type === 'SINGLE' && `'${deleteConfirmation.student.name}' 학생 삭제`}
                {deleteConfirmation.type === 'MULTIPLE' &&
                  `선택한 ${deleteConfirmation.count}명의 학생 일괄 삭제`}
                {deleteConfirmation.type === 'FILTERED' &&
                  `${deleteConfirmation.grade} ${deleteConfirmation.className} 학생 (${deleteConfirmation.count}명) 전체 삭제`}
                {deleteConfirmation.type === 'ALL' && '전체 학생 명단 일괄 삭제 (초기화)'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {deleteConfirmation.type === 'SINGLE' &&
                  `${deleteConfirmation.student.grade} ${deleteConfirmation.student.className} ${deleteConfirmation.student.name} 학생의 명단 및 완독 도서, 독서록 기록이 모두 삭제됩니다.`}
                {deleteConfirmation.type === 'MULTIPLE' &&
                  `선택된 ${deleteConfirmation.count}명의 학생 명단과 해당 학생들의 독서 기록이 모두 영구 삭제됩니다.`}
                {deleteConfirmation.type === 'FILTERED' &&
                  `해당 학급의 학생 ${deleteConfirmation.count}명과 독서 기록이 모두 삭제됩니다.`}
                {deleteConfirmation.type === 'ALL' &&
                  `등록된 모든 학생 (${deleteConfirmation.count}명)의 명단 및 독서록 데이터가 완전히 삭제됩니다.`}
              </p>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl text-[11px] text-rose-700 font-bold text-center border border-rose-200">
              ⚠️ 이 작업은 되돌릴 수 없습니다. 계속 진행하시겠습니까?
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-rose-200"
              >
                삭제 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
