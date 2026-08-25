import React, { useState, useMemo } from 'react';
import { Book, Student, ReadingRecord } from '../types';
import {
  getCompletedCount,
  getInProgressCount,
  getStudentProgressPercent,
  createStudentId,
} from '../utils/studentStorage';
import { getCurrentBadge, getNextBadge } from '../utils/badges';
import {
  Search,
  BookOpen,
  Award,
  Star,
  CheckCircle2,
  Clock,
  UserCheck,
  UserPlus,
  Sparkles,
  ChevronRight,
  Quote,
  Flame,
  Trophy,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface StudentLookupViewProps {
  books: Book[];
  students: Student[];
  currentStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
  onGoToBooks: () => void;
  onRegisterStudent: (newStudent: Student) => void;
  onDeleteStudent?: (studentId: string, name: string) => void;
}

export function StudentLookupView({
  books,
  students,
  currentStudent,
  onSelectStudent,
  onOpenCertificate,
  onGoToBooks,
  onRegisterStudent,
  onDeleteStudent,
}: StudentLookupViewProps) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudent ? currentStudent.id : students[0]?.id || ''
  );

  // New Student Registration Drawer/Inline
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [newGrade, setNewGrade] = useState<string>('3학년');
  const [newClass, setNewClass] = useState<string>('1반');
  const [newNumber, setNewNumber] = useState<string>('1번');
  const [newName, setNewName] = useState<string>('');

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return students.slice(0, 10);

    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.studentNumber && s.studentNumber.includes(q)) ||
        s.grade.includes(q) ||
        s.className.includes(q)
    );
  }, [students, searchInput]);

  // Active target student to display
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || currentStudent || students[0] || null;
  }, [students, selectedStudentId, currentStudent]);

  // Active Student stats
  const studentStats = useMemo(() => {
    if (!activeStudent) return null;
    const completed = getCompletedCount(activeStudent);
    const inProgress = getInProgressCount(activeStudent);
    const total = books.length || 100;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const badge = getCurrentBadge(completed);
    const nextBadge = getNextBadge(completed);
    const remainingToNext = nextBadge ? nextBadge.requiredCount - completed : 0;

    // Completed records with details
    const rawList = Object.values(activeStudent.records || {}) as ReadingRecord[];
    const completedRecords = rawList
      .filter((r): r is ReadingRecord => r.status === 'COMPLETED')
      .map((r) => {
        const book = books.find((b) => b.num === r.num);
        return {
          record: r,
          book,
        };
      })
      .sort((a, b) => (b.record.completedDate || '').localeCompare(a.record.completedDate || ''));

    // Grade breakdown
    const gradeBreakdown: Record<string, { read: number; total: number }> = {
      '1학년': { read: 0, total: 0 },
      '2학년': { read: 0, total: 0 },
      '3학년': { read: 0, total: 0 },
      '4학년': { read: 0, total: 0 },
      '5학년': { read: 0, total: 0 },
      '6학년': { read: 0, total: 0 },
    };

    books.forEach((b) => {
      ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].forEach((g) => {
        if (b.grade.includes(g)) {
          gradeBreakdown[g].total++;
          if (activeStudent.records?.[b.num]?.status === 'COMPLETED') {
            gradeBreakdown[g].read++;
          }
        }
      });
    });

    return {
      completed,
      inProgress,
      total,
      percentage,
      badge,
      nextBadge,
      remainingToNext,
      completedRecords,
      gradeBreakdown,
    };
  }, [activeStudent, books]);

  // Handle register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const student: Student = {
      id: createStudentId(newGrade, newClass, newNumber, newName),
      grade: newGrade,
      className: newClass,
      studentNumber: newNumber,
      name: newName.trim(),
      records: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onRegisterStudent(student);
    setSelectedStudentId(student.id);
    setIsRegistering(false);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white rounded-3xl p-6 md:p-8 shadow-vibrant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-indigo-100 backdrop-blur-md mb-2 border border-white/20">
              <UserCheck className="w-3.5 h-3.5" /> 학생 독서 기록 조회 메뉴
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              🔍 내 이름 검색 & 독서 현황 확인하기
            </h2>
            <p className="text-sm text-indigo-100 mt-1 max-w-xl">
              자기 이름을 검색하고 지금까지 읽은 책 목록, 달성률, 한 줄 소감, 완독 인증서를 확인해보세요!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-white text-indigo-700 hover:bg-indigo-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>새 학생 바로 등록</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Student Register Drawer */}
      {isRegistering && (
        <div className="bg-white rounded-3xl p-6 md:p-7 border-2 border-indigo-200 shadow-card animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                새로운 학생 등록 (10초 완료)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                등록 후 바로 100선 필독도서 완독 체크를 시작할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setIsRegistering(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              닫기
            </button>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">학년</label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              >
                {['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">반</label>
              <input
                type="text"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="1반"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">번호</label>
              <input
                type="text"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="15번"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-600 mb-1">학생 이름 *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 김민준"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-4 flex justify-end mt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>등록 완료하고 독서 기록 시작하기</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Left Search & Student Selector, Right Reading Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Quick Selection List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-indigo-600" />
              학생 이름 검색
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="이름을 입력하세요 (예: 김민준)"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-hidden rounded-2xl text-xs font-bold text-slate-800 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Quick Students List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>일치하는 학생이 없습니다.</p>
                  <button
                    onClick={() => {
                      setNewName(searchInput);
                      setIsRegistering(true);
                    }}
                    className="mt-2 text-indigo-600 font-bold hover:underline"
                  >
                    '+ {searchInput}' 학생 새로 등록하기
                  </button>
                </div>
              ) : (
                searchResults.map((s) => {
                  const completed = getCompletedCount(s);
                  const isSelected = activeStudent?.id === s.id;
                  const isCurrentSession = currentStudent?.id === s.id;

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                          : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {s.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm">{s.name}</span>
                            {isCurrentSession && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                접속중
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {s.grade} {s.className} {s.studentNumber}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-indigo-600">{completed}권</span>
                        <p className="text-[10px] text-slate-400">완독</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Reading Report Card (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeStudent && studentStats ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-card space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 shrink-0">
                    {activeStudent.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {activeStudent.grade} {activeStudent.className} {activeStudent.studentNumber}
                      </span>
                      {studentStats.badge && (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${studentStats.badge.color}`}
                        >
                          {studentStats.badge.icon} {studentStats.badge.title}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                      {activeStudent.name} 학생의 독서 리포트
                    </h2>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => {
                      onSelectStudent(activeStudent);
                      onGoToBooks();
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-200"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>이 학생으로 책 기록하기</span>
                  </button>

                  <button
                    onClick={() => onOpenCertificate(activeStudent)}
                    disabled={studentStats.completed === 0}
                    className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 rounded-2xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>인증서 출력</span>
                  </button>

                  {onDeleteStudent && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `'${activeStudent.name}' 학생의 모든 독서 기록과 명단을 삭제하시겠습니까?`
                          )
                        ) {
                          onDeleteStudent(activeStudent.id, activeStudent.name);
                        }
                      }}
                      title="학생 명단 및 기록 삭제"
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Summary Hero */}
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 rounded-3xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                      필독도서 100선 완독 여정
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      총 {studentStats.total}권 중 <strong className="text-indigo-600">{studentStats.completed}권</strong> 완독 완료!
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600">{studentStats.percentage}%</span>
                  </div>
                </div>

                {/* Main Progress Bar */}
                <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${studentStats.percentage}%` }}
                  />
                </div>

                {/* Badge Progression Tracker */}
                {studentStats.nextBadge && (
                  <div className="flex items-center justify-between text-xs pt-1 font-semibold text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Flame className="w-4 h-4 text-amber-500" />
                      다음 목표: <strong>{studentStats.nextBadge.title}</strong>
                    </span>
                    <span className="font-bold text-indigo-600">
                      {studentStats.remainingToNext}권만 더 읽으면 획득! 🎯
                    </span>
                  </div>
                )}
              </div>

              {/* Grade-Level Breakdown Pills */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                  학년별 필독도서 독서 현황
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {(Object.entries(studentStats.gradeBreakdown) as [string, { read: number; total: number }][]).map(([gradeName, data]) => {
                    const pct = data.total > 0 ? Math.round((data.read / data.total) * 100) : 0;
                    return (
                      <div
                        key={gradeName}
                        className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center"
                      >
                        <p className="text-xs font-bold text-slate-500">{gradeName}</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5">
                          {data.read}/{data.total}
                        </p>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Completed Books & My Impressions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    완독한 책 목록 및 나의 독서록 ({studentStats.completedRecords.length}권)
                  </h4>
                  <button
                    onClick={() => {
                      onSelectStudent(activeStudent);
                      onGoToBooks();
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    100선 전체 목록에서 추가하기 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {studentStats.completedRecords.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">아직 완독한 도서가 없습니다.</p>
                    <p className="mt-1">상단의 '이 학생으로 책 기록하기'를 눌러 첫 완독 책을 체크해보세요!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {studentStats.completedRecords.map(({ record, book }) => (
                      <div
                        key={record.num}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-indigo-600">No.{record.num}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                {book?.grade || '필독서'}
                              </span>
                            </div>
                            <h5 className="text-sm font-extrabold text-slate-900 mt-1">
                              {book?.title || `도서 #${record.num}`}
                            </h5>
                            <p className="text-xs text-slate-500 font-medium">
                              {book?.author} {book?.publisher ? `· ${book.publisher}` : ''}
                            </p>
                          </div>

                          {record.completedDate && (
                            <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap bg-white px-2 py-1 rounded-lg border border-slate-200/60">
                              {record.completedDate} 완독
                            </span>
                          )}
                        </div>

                        {/* Star Rating */}
                        {record.rating && (
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= (record.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Review */}
                        {record.review && (
                          <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60">
                            <strong className="text-indigo-600 block text-[10px] mb-0.5">✍️ 내가 쓴 한 줄 소감</strong>
                            {record.review}
                          </div>
                        )}

                        {/* Quote */}
                        {record.quote && (
                          <div className="text-xs text-slate-600 italic bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
                            <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>"{record.quote}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-card text-slate-400 text-xs">
              왼쪽에서 학생 이름을 선택하거나 검색하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
