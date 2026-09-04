import React, { useState, useMemo, useEffect } from 'react';
import { Book, Student } from '../types';
import {
  Star,
  User,
  LogOut,
  Sparkles,
  TrendingUp,
  ArrowRight,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { BookRatingStat, calculateBookRatingStats, getTopRatedBooks } from '../utils/rankingUtils';
import { BookReviewsModal } from './BookReviewsModal';

interface QuickRecordHeroProps {
  books: Book[];
  students: Student[];
  activeStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onRegisterStudent?: (newStudent: Student) => void;
  onOpenBookDetail: (book: Book) => void;
  onStudentLogout?: () => void;
  selectedGradeFilter: string;
  onGradeFilterChange: (grade: string) => void;
  onNavigateToBooksList?: () => void;
}

export function QuickRecordHero({
  books,
  students,
  activeStudent,
  onSelectStudent,
  onRegisterStudent,
  onOpenBookDetail,
  onStudentLogout,
  selectedGradeFilter,
  onGradeFilterChange,
  onNavigateToBooksList,
}: QuickRecordHeroProps) {
  // Student Input State
  const [inputGrade, setInputGrade] = useState<string>(
    activeStudent?.grade || (selectedGradeFilter !== 'ALL' && selectedGradeFilter ? selectedGradeFilter : '1학년')
  );
  const [inputClass, setInputClass] = useState<string>(
    activeStudent?.className ? activeStudent.className.replace('반', '') : ''
  );
  const [inputNumber, setInputNumber] = useState<string>(
    activeStudent?.studentNumber ? activeStudent.studentNumber.replace('번', '') : ''
  );
  const [inputName, setInputName] = useState<string>(activeStudent?.name || '');
  const [selectedReviewStat, setSelectedReviewStat] = useState<BookRatingStat | null>(null);

  // Sync state when activeStudent changes
  useEffect(() => {
    if (activeStudent) {
      setInputGrade(activeStudent.grade || '1학년');
      setInputClass(activeStudent.className ? activeStudent.className.replace('반', '') : '');
      setInputNumber(activeStudent.studentNumber ? activeStudent.studentNumber.replace('번', '') : '');
      setInputName(activeStudent.name || '');
    } else {
      // 학생이 접속 후 나가면 기록된 반, 번호, 이름 초기화
      setInputClass('');
      setInputNumber('');
      setInputName('');
    }
  }, [activeStudent]);

  // Sync with selectedGradeFilter if not 'ALL'
  useEffect(() => {
    if (selectedGradeFilter && selectedGradeFilter !== 'ALL') {
      setInputGrade(selectedGradeFilter);
    }
  }, [selectedGradeFilter]);

  // Available grades for student profile
  const GRADES = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];

  // Scroll helper to smoothly scroll to the book cards list
  const scrollToBooks = () => {
    setTimeout(() => {
      const el = document.getElementById('books-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  // Handle student grade change: updates inputGrade
  const handleGradeSelect = (grade: string) => {
    setInputGrade(grade);
  };

  // Connect or register student, then navigate directly to chosen grade's book cards
  const handleApplyAndConnect = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = inputName.trim();
    if (!trimmedName) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    const normClass = inputClass ? (inputClass.includes('반') ? inputClass : `${inputClass}반`) : '1반';
    const normNumber = inputNumber ? (inputNumber.includes('번') ? inputNumber : `${inputNumber}번`) : '1번';

    // Find existing student
    const existing = students.find(
      (s) => s.name === trimmedName && s.grade === inputGrade && s.className === normClass
    ) || students.find((s) => s.name === trimmedName);

    if (existing) {
      const updated = {
        ...existing,
        grade: inputGrade,
        className: normClass,
        studentNumber: normNumber || existing.studentNumber,
      };
      onSelectStudent(updated);
    } else if (onRegisterStudent) {
      const newId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(-4)}`;
      const newStudent: Student = {
        id: newId,
        grade: inputGrade,
        className: normClass,
        studentNumber: normNumber,
        name: trimmedName,
        records: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onRegisterStudent(newStudent);
    }

    // Set filter to the chosen grade
    onGradeFilterChange(inputGrade);

    // Call optional navigation callback or scroll to the book card grid
    if (onNavigateToBooksList) {
      onNavigateToBooksList();
    } else {
      scrollToBooks();
    }
  };

  // Count books in selected grade
  const gradeBooksCount = useMemo(() => {
    return books.filter((b) => b.grade.includes(inputGrade)).length;
  }, [books, inputGrade]);

  // Calculate real-time rating statistics
  const ratingStats = useMemo(() => {
    return calculateBookRatingStats(books, students);
  }, [books, students]);

  // Top ranked books based on selected grade
  const topBooks = useMemo(() => {
    return getTopRatedBooks(ratingStats, inputGrade, 4);
  }, [ratingStats, inputGrade]);

  return (
    <div
      className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 md:p-7 shadow-vibrant mb-7 relative overflow-hidden notranslate border border-indigo-800/60"
      translate="no"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Header: Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-700/50 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              📖 독서 후기 남기기
            </h2>
            <p className="text-xs text-indigo-200 mt-1 font-medium">
              학년 반 번호 이름을 입력하세요.
            </p>
          </div>

          {/* Active Student Status */}
          {activeStudent ? (
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-xs shadow-xs shrink-0 self-start md:self-auto">
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-indigo-200 font-medium">접속 학생:</span>
              <span className="font-black text-amber-300">
                {activeStudent.grade} {activeStudent.className} {activeStudent.studentNumber || ''} {activeStudent.name}
              </span>
              {onStudentLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setInputClass('');
                    setInputNumber('');
                    setInputName('');
                    onStudentLogout();
                  }}
                  className="ml-1.5 px-2 py-0.5 bg-rose-500/80 hover:bg-rose-600 active:bg-rose-700 text-white rounded-lg text-[10px] font-black transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="접속 종료 및 학생 나가기"
                >
                  <LogOut className="w-3 h-3" />
                  <span>나가기</span>
                </button>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-amber-400/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-300/30 text-xs text-amber-200 shrink-0 self-start md:self-auto">
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-bold">학년 · 반 · 번호 · 이름을 입력해 주세요</span>
            </div>
          )}
        </div>

        {/* 2-Column Layout: Left = Student Login & Grade Access, Right = Top 4 Books Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT: Student Info & Direct Grade Access Form (7 cols) */}
          <div className="lg:col-span-7 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Header inside Student Box */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-300" />
                  <span>학생 정보 입력 및 접속</span>
                </span>
              </div>

              {/* 1. Grade Selection Buttons (1학년 ~ 6학년) */}
              <div>
                <div className="text-xs text-indigo-200 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-indigo-950 font-black text-[10px] inline-flex items-center justify-center">
                      1
                    </span>
                    <span>학년을 선택하세요:</span>
                  </span>
                  <span className="text-amber-300 text-[11px] font-bold">
                    {inputGrade} 권장도서 {gradeBooksCount}권
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGradeSelect(g)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border text-center ${
                        inputGrade === g
                          ? 'bg-amber-400 text-indigo-950 border-amber-300 shadow-md scale-105 ring-2 ring-amber-300/40'
                          : 'bg-indigo-950/80 text-indigo-200 border-indigo-700/60 hover:bg-indigo-900 hover:border-amber-400/50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Class, Number, Name Inputs */}
              <form onSubmit={handleApplyAndConnect} className="space-y-3">
                <div className="text-xs text-indigo-200 font-bold flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-indigo-950 font-black text-[10px] inline-flex items-center justify-center">
                    2
                  </span>
                  <span>반, 번호, 이름을 입력하세요:</span>
                </div>

                <div className="grid grid-cols-12 gap-2.5 items-end">
                  <div className="col-span-3 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-indigo-300 mb-1">반</label>
                    <input
                      type="text"
                      value={inputClass}
                      onChange={(e) => setInputClass(e.target.value)}
                      placeholder="1반"
                      className="w-full px-3 py-2 bg-indigo-950/90 border border-indigo-500/60 rounded-xl text-xs font-bold text-white placeholder:text-indigo-400/50 focus:outline-hidden focus:border-amber-400 shadow-inner"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-indigo-300 mb-1">번호</label>
                    <input
                      type="text"
                      value={inputNumber}
                      onChange={(e) => setInputNumber(e.target.value)}
                      placeholder="1번"
                      className="w-full px-3 py-2 bg-indigo-950/90 border border-indigo-500/60 rounded-xl text-xs font-bold text-white placeholder:text-indigo-400/50 focus:outline-hidden focus:border-amber-400 shadow-inner"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-5">
                    <label className="block text-[10px] font-bold text-indigo-300 mb-1">이름 (필수)</label>
                    <input
                      type="text"
                      required
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="이름 입력"
                      className="w-full px-3.5 py-2 bg-indigo-950/90 border-2 border-amber-400/70 focus:border-amber-300 rounded-xl text-xs font-black text-amber-300 placeholder:text-indigo-400/50 focus:outline-hidden shadow-inner"
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 active:from-amber-500 text-indigo-950 font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-950" />
                      <span>접속하기</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-950" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-2 border-t border-indigo-700/40 flex items-center justify-between text-[11px] text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                접속 후 도서 카드에서 <strong className="text-white">완독 체크</strong>와 <strong className="text-amber-300">독서기록(별점·한줄평)</strong>을 바로 남길 수 있습니다.
              </span>
            </div>
          </div>

          {/* RIGHT: Top Rated Books Ranking Board (5 cols) */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-400/20 rounded-lg text-amber-300 border border-amber-400/30">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-300">
                    🏆 서룡초 최고 평점 도서 TOP 4
                  </span>
                  <span className="text-[10px] text-indigo-200 block">
                    [{inputGrade}] 학생 추천 인기 도서
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-amber-300 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-700/60">
                실시간
              </span>
            </div>

            {/* Ranking Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {topBooks.length > 0 ? (
                topBooks.map((item, index) => {
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;

                  return (
                    <div
                      key={item.num}
                      onClick={() => setSelectedReviewStat(item)}
                      className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isTop1
                          ? 'bg-gradient-to-br from-amber-500/25 to-indigo-950/90 border-amber-400/60 hover:border-amber-300 shadow-md hover:-translate-y-0.5'
                          : isTop2
                          ? 'bg-gradient-to-br from-slate-300/20 to-indigo-950/90 border-slate-300/40 hover:border-slate-200 hover:-translate-y-0.5'
                          : isTop3
                          ? 'bg-gradient-to-br from-amber-700/25 to-indigo-950/90 border-amber-600/40 hover:border-amber-500 hover:-translate-y-0.5'
                          : 'bg-indigo-950/70 border-indigo-800/60 hover:border-indigo-500 hover:bg-indigo-900/60'
                      }`}
                    >
                      <div>
                        {/* Rank Badge & Grade */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-5 h-5 rounded-lg text-[11px] font-black flex items-center justify-center shadow-xs ${
                                isTop1
                                  ? 'bg-amber-400 text-indigo-950'
                                  : isTop2
                                  ? 'bg-slate-200 text-slate-900'
                                  : isTop3
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-indigo-900 text-indigo-200 border border-indigo-700'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300">
                              No.{item.num}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded-md text-indigo-200 border border-white/10">
                            {item.book.grade}
                          </span>
                        </div>

                        {/* Title & Author */}
                        <h4 className="font-extrabold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-0.5">
                          {item.book.title}
                        </h4>
                        <p className="text-[10px] text-indigo-300 truncate">
                          {item.book.author}
                        </p>
                      </div>

                      {/* Rating & Action Row */}
                      <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black text-amber-300">
                            {item.averageRating > 0 ? `${item.averageRating}점` : '5.0점'}
                          </span>
                          <span className="text-[10px] text-indigo-300">
                            ({item.ratingCount > 0 ? `${item.ratingCount}명` : `${item.completedCount}명 완독`})
                          </span>
                        </div>

                        <span className="text-[10px] font-bold text-amber-300/90 group-hover:text-amber-200 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>평점·한줄평 보기</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-indigo-300 text-xs">
                  등록된 평점 정보가 없습니다. 도서명을 클릭하여 첫 평점을 남겨보세요!
                </div>
              )}
            </div>

            {/* Bottom Info */}
            <div className="bg-indigo-950/60 px-3.5 py-2 rounded-xl border border-indigo-800/40 flex items-center justify-between text-[11px] text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                도서명을 클릭하면 해당 도서의 평점과 친구들의 한줄평을 확인할 수 있습니다.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Book Reviews & Rating Modal */}
      {selectedReviewStat && (
        <BookReviewsModal
          stat={selectedReviewStat}
          onClose={() => setSelectedReviewStat(null)}
        />
      )}
    </div>
  );
}
