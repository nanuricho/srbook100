import React, { useState, useMemo, useEffect } from 'react';
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
  Flame,
  Trophy,
  ArrowRight,
  Trash2,
  X,
  User,
  HelpCircle,
  LogOut,
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
  onStudentLogout?: () => void;
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
  onStudentLogout,
}: StudentLookupViewProps) {
  const [lookupGrade, setLookupGrade] = useState<string>(currentStudent?.grade || '3학년');
  const [lookupClass, setLookupClass] = useState<string>(
    currentStudent?.className ? currentStudent.className.replace('반', '') : '1'
  );
  const [lookupNumber, setLookupNumber] = useState<string>(
    currentStudent?.studentNumber ? currentStudent.studentNumber.replace('번', '') : ''
  );
  const [lookupName, setLookupName] = useState<string>(currentStudent?.name || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudent ? currentStudent.id : ''
  );
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchedLabel, setSearchedLabel] = useState<string>('');

  // New Student Registration Drawer/Inline
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [newGrade, setNewGrade] = useState<string>('3학년');
  const [newClass, setNewClass] = useState<string>('1반');
  const [newNumber, setNewNumber] = useState<string>('1번');
  const [newName, setNewName] = useState<string>('');

  // Sync selected student when currentStudent changes from outside
  useEffect(() => {
    if (currentStudent && !selectedStudentId) {
      setSelectedStudentId(currentStudent.id);
      setLookupGrade(currentStudent.grade || '3학년');
      setLookupClass(currentStudent.className ? currentStudent.className.replace('반', '') : '1');
      setLookupNumber(currentStudent.studentNumber ? currentStudent.studentNumber.replace('번', '') : '');
      setLookupName(currentStudent.name || '');
    }
  }, [currentStudent]);

  // Active target student to display (Only when explicitly selected or confirmed)
  const activeStudent = useMemo(() => {
    if (selectedStudentId) {
      return students.find((s) => s.id === selectedStudentId) || null;
    }
    return null;
  }, [students, selectedStudentId]);

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
    const trimmedName = newName.trim();
    if (!trimmedName) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    const cleanClass = newClass.trim();
    const cleanNumber = newNumber.trim();
    const normClass = cleanClass ? (cleanClass.includes('반') ? cleanClass : `${cleanClass}반`) : '1반';
    const normNumber = cleanNumber ? (cleanNumber.includes('번') ? cleanNumber : `${cleanNumber}번`) : '1번';

    const student: Student = {
      id: createStudentId(newGrade, normClass, normNumber, trimmedName),
      grade: newGrade,
      className: normClass,
      studentNumber: normNumber,
      name: trimmedName,
      records: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onRegisterStudent(student);
    setSelectedStudentId(student.id);
    onSelectStudent(student);
    setLookupGrade(newGrade);
    setLookupClass(normClass.replace('반', ''));
    setLookupNumber(normNumber.replace('번', ''));
    setLookupName(trimmedName);
    setHasSearched(true);
    setSearchedLabel(`${newGrade} ${normClass} ${normNumber} ${trimmedName}`);
    setIsRegistering(false);
    setNewName('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanClass = lookupClass.trim();
    const cleanNumber = lookupNumber.trim();
    const cleanName = lookupName.trim();

    if (!cleanName && !cleanClass && !cleanNumber) {
      alert('조회할 학생 이름 또는 반·번호를 입력해주세요.');
      return;
    }

    const normClass = cleanClass ? (cleanClass.includes('반') ? cleanClass : `${cleanClass}반`) : '';
    const normNumber = cleanNumber ? (cleanNumber.includes('번') ? cleanNumber : `${cleanNumber}번`) : '';
    const label = cleanName ? `'${cleanName}'` : `${lookupGrade} ${normClass} ${normNumber}`;

    setSearchedLabel(label);
    setHasSearched(true);

    let found: Student | undefined;
    if (cleanName) {
      found =
        students.find((s) => s.name === cleanName && s.grade === lookupGrade) ||
        students.find((s) => s.name === cleanName) ||
        (normClass && normNumber
          ? students.find(
              (s) => s.grade === lookupGrade && s.className === normClass && s.studentNumber === normNumber
            )
          : undefined);
    } else if (normClass && normNumber) {
      found = students.find(
        (s) => s.grade === lookupGrade && s.className === normClass && s.studentNumber === normNumber
      );
    }

    if (found) {
      setSelectedStudentId(found.id);
      onSelectStudent(found);
    } else {
      setSelectedStudentId('');
    }
  };

  const handleQuickCreateAndOpen = () => {
    const cleanClass = lookupClass.trim();
    const cleanNumber = lookupNumber.trim();
    const cleanName = lookupName.trim();
    const normClass = cleanClass ? (cleanClass.includes('반') ? cleanClass : `${cleanClass}반`) : '1반';
    const normNumber = cleanNumber ? (cleanNumber.includes('번') ? cleanNumber : `${cleanNumber}번`) : '1번';
    const displayName = cleanName || `${normClass} ${normNumber}`;

    const newStudent: Student = {
      id: createStudentId(lookupGrade, normClass, normNumber, displayName),
      grade: lookupGrade,
      className: normClass,
      studentNumber: normNumber,
      name: displayName,
      records: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onRegisterStudent(newStudent);
    setSelectedStudentId(newStudent.id);
    onSelectStudent(newStudent);
  };

  return (
    <div className="space-y-6 notranslate" translate="no">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white rounded-3xl p-6 md:p-8 shadow-vibrant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-indigo-100 backdrop-blur-md mb-2 border border-white/20">
              <UserCheck className="w-3.5 h-3.5" /> 개인 독서기록 조회
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              🔍 내 이름으로 독서기록 조회하기
            </h2>
            <p className="text-sm text-indigo-100 mt-1 max-w-xl">
              이름이나 학년 · 반 · 번호를 입력하면 지금까지 완독한 책 목록, 한 줄 소감과 인증서를 바로 확인할 수 있습니다.
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
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
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

      {/* Search Bar Section */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-card">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>조회할 학생 이름 또는 학년 · 반 · 번호를 입력하세요:</span>
            </span>
            {currentStudent && (
              <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                현재 접속: {currentStudent.grade} {currentStudent.className} {currentStudent.studentNumber || ''} {currentStudent.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-12 gap-2.5 items-end">
            <div className="col-span-6 sm:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1">학년</label>
              <select
                value={lookupGrade}
                onChange={(e) => setLookupGrade(e.target.value)}
                className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden"
              >
                {['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="col-span-3 sm:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1">반</label>
              <input
                type="text"
                value={lookupClass}
                onChange={(e) => setLookupClass(e.target.value)}
                placeholder="1반"
                className="w-full px-3.5 py-3 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="col-span-3 sm:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1">번호</label>
              <input
                type="text"
                value={lookupNumber}
                onChange={(e) => setLookupNumber(e.target.value)}
                placeholder="15번"
                className="w-full px-3.5 py-3 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="col-span-8 sm:col-span-3">
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1">학생 이름 (선택/직접검색)</label>
              <input
                type="text"
                value={lookupName}
                onChange={(e) => setLookupName(e.target.value)}
                placeholder="이름 (예: 김민준)"
                className="w-full px-3.5 py-3 bg-slate-50 border-2 border-indigo-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>조회하기</span>
              </button>

              {currentStudent && onStudentLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentId('');
                    setHasSearched(false);
                    onStudentLogout();
                  }}
                  className="px-3 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
                  title="조회 종료 및 학생 나가기"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* If 0 students match the searched grade/class/number/name */}
        {hasSearched && !activeStudent && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-amber-900">
                {searchedLabel} 등록된 독서 기록이 없습니다.
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                해당 학생 이름/번호로 새 독서 기록을 바로 시작하여 완독 도서를 기록해보세요.
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickCreateAndOpen}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{searchedLabel} 새 독서 기록 시작하기</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Reading Portfolio Report */}
      {activeStudent && studentStats ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-card space-y-6 animate-fadeIn">
          {/* Profile Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 shrink-0">
                {activeStudent.name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {activeStudent.grade} {activeStudent.className} {activeStudent.studentNumber || ''}
                  </span>
                  {studentStats.badge && (
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${studentStats.badge.color}`}
                    >
                      {studentStats.badge.icon} {studentStats.badge.title}
                    </span>
                  )}
                  {currentStudent?.id === activeStudent.id && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      현재 접속된 학생
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

              <button
                type="button"
                onClick={() => {
                  setSelectedStudentId('');
                  setHasSearched(false);
                  onStudentLogout?.();
                }}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="독서기록 조회 종료 및 학생 나가기"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>조회 종료 (나가기)</span>
              </button>

              {onDeleteStudent && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `'${activeStudent.grade} ${activeStudent.className} ${activeStudent.studentNumber || ''}' 학생의 모든 독서 기록을 삭제하시겠습니까?`
                      )
                    ) {
                      onDeleteStudent(activeStudent.id, activeStudent.name);
                      setSelectedStudentId('');
                      setHasSearched(false);
                    }
                  }}
                  title="학생 명단 및 기록 삭제"
                  className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-2xl text-xs font-bold transition-all cursor-pointer"
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
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Initial State before search */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-card space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner border border-indigo-100">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              학년 · 반 · 번호로 내 독서기록을 조회해보세요
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              본인의 학년, 반, 번호를 입력하면 개인 독서 통계, 완독한 100선 필독도서 목록과 한 줄 소감, 완독 인증서를 바로 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

