import React, { useState, useMemo } from 'react';
import { Book, Student } from '../types';
import {
  Trophy,
  BookOpen,
  Star,
  Search,
  User,
  LogOut,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  MessageSquareQuote,
  Flame,
} from 'lucide-react';
import { calculateBookRatingStats, getTopRatedBooks, BookRatingStat } from '../utils/rankingUtils';

interface QuickRecordHeroProps {
  books: Book[];
  students: Student[];
  activeStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onOpenBookDetail: (book: Book) => void;
  onStudentLogout?: () => void;
  selectedGradeFilter: string;
  onGradeFilterChange: (grade: string) => void;
}

export function QuickRecordHero({
  books,
  students,
  activeStudent,
  onSelectStudent,
  onOpenBookDetail,
  onStudentLogout,
  selectedGradeFilter,
  onGradeFilterChange,
}: QuickRecordHeroProps) {
  // Book Selection state
  const [selectedBookGrade, setSelectedBookGrade] = useState<string>('ALL');
  const [selectedBookNum, setSelectedBookNum] = useState<string>('1');
  const [bookSearchQuery, setBookSearchQuery] = useState<string>('');

  // Available grades for books
  const BOOK_GRADES = [
    { label: '전체', value: 'ALL' },
    { label: '1학년', value: '1학년' },
    { label: '2학년', value: '2학년' },
    { label: '3학년', value: '3학년' },
    { label: '4학년', value: '4학년' },
    { label: '5학년', value: '5학년' },
    { label: '6학년', value: '6학년' },
    { label: '공통/전학년', value: '공통' },
  ];

  // Calculate real-time rating statistics
  const ratingStats = useMemo(() => {
    return calculateBookRatingStats(books, students);
  }, [books, students]);

  // Top ranked books based on selected grade
  const topBooks = useMemo(() => {
    return getTopRatedBooks(ratingStats, selectedBookGrade, 4);
  }, [ratingStats, selectedBookGrade]);

  // Filter books by selected grade for the selector
  const gradeFilteredBooks = useMemo(() => {
    if (selectedBookGrade === 'ALL') return books;
    if (selectedBookGrade === '공통') {
      return books.filter((b) => b.grade.includes('공통') || b.grade.includes('전학년') || b.grade.includes('후반'));
    }
    return books.filter((b) => b.grade.includes(selectedBookGrade));
  }, [books, selectedBookGrade]);

  const searchFilteredBooks = useMemo(() => {
    const q = bookSearchQuery.trim().toLowerCase();
    if (!q) return gradeFilteredBooks;
    return gradeFilteredBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.num.includes(q) ||
        b.grade.toLowerCase().includes(q)
    );
  }, [gradeFilteredBooks, bookSearchQuery]);

  // Current selected book from dropdown
  const currentSelectedBook = useMemo(() => {
    return books.find((b) => b.num === selectedBookNum) || gradeFilteredBooks[0] || books[0] || null;
  }, [books, selectedBookNum, gradeFilteredBooks]);

  // Stat for selected book
  const selectedBookStat = useMemo(() => {
    if (!currentSelectedBook) return null;
    return ratingStats.find((s) => s.num === currentSelectedBook.num) || null;
  }, [currentSelectedBook, ratingStats]);

  const handleGradeChange = (gradeVal: string) => {
    setSelectedBookGrade(gradeVal);
    onGradeFilterChange(gradeVal);

    // Auto select first book in that grade
    const firstBook =
      gradeVal === 'ALL'
        ? books[0]
        : gradeVal === '공통'
        ? books.find((b) => b.grade.includes('공통') || b.grade.includes('전학년'))
        : books.find((b) => b.grade.includes(gradeVal));
    if (firstBook) {
      setSelectedBookNum(firstBook.num);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 md:p-7 shadow-vibrant mb-7 relative overflow-hidden notranslate border border-indigo-800/60" translate="no">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Row: Title & Active Student Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-700/50 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-300/30 shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>서룡초 어린이 실시간 독서 랭킹 & 탐색</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
                <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>학생 평점 실시간 집계 중</span>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              ⭐ 실시간 최고 평점 도서 순위 & 학년별 도서 선택
            </h2>
            <p className="text-xs text-indigo-200 mt-0.5 font-medium">
              서룡초 학생들이 직접 읽고 남긴 별점 순위입니다. 학년별 도서를 선택하거나 순위 도서를 클릭해 독서기록을 남겨보세요!
            </p>
          </div>

          {/* Active Student Badge or Guide */}
          {activeStudent ? (
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-xs shadow-xs shrink-0 self-start md:self-auto">
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-indigo-200 font-medium">현재 접속:</span>
              <span className="font-black text-amber-300">
                {activeStudent.grade} {activeStudent.className} {activeStudent.name}
              </span>
              {onStudentLogout && (
                <button
                  type="button"
                  onClick={onStudentLogout}
                  className="ml-1.5 px-2 py-0.5 bg-rose-500/80 hover:bg-rose-600 active:bg-rose-700 text-white rounded-lg text-[10px] font-black transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="기록 종료 및 이름 숨기기"
                >
                  <LogOut className="w-3 h-3" />
                  <span>나가기</span>
                </button>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 text-xs text-indigo-200 shrink-0 self-start md:self-auto">
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span>도서 카드에서 [독서기록]을 눌러 기록을 시작하세요</span>
            </div>
          )}
        </div>

        {/* 2-Column Content Layout: Left = Book Selector, Right = Top Rated Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT: Grade & Book Selector (5 cols) */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/15 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> 도서 선택 (학년별 목록)
                </span>
                <span className="text-[11px] text-indigo-200 font-medium">
                  총 <strong className="text-white font-bold">{books.length}</strong>권 중
                </span>
              </div>

              {/* 1. Grade Selector Pills */}
              <div className="mb-3">
                <div className="text-[11px] text-indigo-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>① 도서 학년 선택:</span>
                  <span className="text-amber-300 text-[10px]">선택 학년: {gradeFilteredBooks.length}권</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BOOK_GRADES.map((bg) => (
                    <button
                      key={bg.value}
                      type="button"
                      onClick={() => handleGradeChange(bg.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedBookGrade === bg.value
                          ? 'bg-amber-400 text-indigo-950 border-amber-300 font-black shadow-xs'
                          : 'bg-indigo-950/70 text-indigo-200 border-indigo-700/50 hover:bg-indigo-900/70'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Book Dropdown & Quick Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-indigo-200 font-bold">
                  <span>② 해당 학년 도서 목록 선택:</span>
                  {searchFilteredBooks.length !== gradeFilteredBooks.length && (
                    <span className="text-amber-300 text-[10px]">검색 결과 {searchFilteredBooks.length}권</span>
                  )}
                </div>

                {/* Dropdown Select */}
                <select
                  value={selectedBookNum}
                  onChange={(e) => setSelectedBookNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-indigo-950/95 border-2 border-indigo-400/60 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-amber-400 cursor-pointer shadow-inner"
                >
                  {gradeFilteredBooks.map((b) => {
                    const stat = ratingStats.find((s) => s.num === b.num);
                    const ratingStr = stat && stat.averageRating > 0 ? ` [⭐ ${stat.averageRating}]` : '';
                    return (
                      <option key={b.num} value={b.num} className="bg-slate-900 text-white py-1">
                        No.{b.num} [{b.grade}] {b.title} - {b.author} {ratingStr}
                      </option>
                    );
                  })}
                </select>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => setBookSearchQuery(e.target.value)}
                    placeholder="도서명 또는 작가 검색..."
                    className="w-full pl-8.5 pr-3 py-2 bg-indigo-950/90 border border-indigo-400/40 rounded-xl text-xs text-white placeholder:text-indigo-400/60 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Selected Book Quick Action Preview Box */}
            {currentSelectedBook && (
              <div className="bg-indigo-950/90 p-3.5 rounded-2xl border border-indigo-700/80 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 bg-amber-400 text-indigo-950 font-black rounded-md text-[10px]">
                        No.{currentSelectedBook.num}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-800 text-indigo-200 font-bold rounded text-[10px]">
                        {currentSelectedBook.grade}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-white line-clamp-1">
                      {currentSelectedBook.title}
                    </h3>
                    <p className="text-[11px] text-indigo-300 truncate">
                      {currentSelectedBook.author} · {currentSelectedBook.publisher}
                    </p>
                  </div>

                  {/* Rating Tag */}
                  {selectedBookStat && selectedBookStat.averageRating > 0 ? (
                    <div className="bg-amber-400/20 px-2.5 py-1 rounded-xl border border-amber-300/30 text-right shrink-0">
                      <div className="flex items-center gap-1 text-amber-300 font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-300" />
                        <span>{selectedBookStat.averageRating}점</span>
                      </div>
                      <span className="text-[10px] text-indigo-200">
                        {selectedBookStat.ratingCount}명 평가
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-indigo-300 bg-white/5 px-2 py-1 rounded-lg shrink-0">
                      첫 평가 대기 중
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenBookDetail(currentSelectedBook)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:from-amber-500 text-indigo-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>이 책 선택하여 독서기록 & 별점 작성하기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Top Rated Books Ranking Board (7 cols) */}
          <div className="lg:col-span-7 bg-white/10 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-400/20 rounded-lg text-amber-300 border border-amber-400/30">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-300">
                    🏆 서룡초 최고 평점 인기 도서 TOP 순위
                  </span>
                  <span className="text-[10px] text-indigo-200 block">
                    {selectedBookGrade === 'ALL' ? '전체 학년' : selectedBookGrade} 기준 학생들이 추천한 명작 도서
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-amber-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-700/60">
                실시간 업데이트
              </span>
            </div>

            {/* Ranking Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {topBooks.length > 0 ? (
                topBooks.map((item, index) => {
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;

                  return (
                    <div
                      key={item.num}
                      onClick={() => onOpenBookDetail(item.book)}
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
                              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shadow-xs ${
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
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </div>
                          <span className="text-xs font-black text-amber-300">
                            {item.averageRating > 0 ? `${item.averageRating}점` : '5.0점'}
                          </span>
                          <span className="text-[10px] text-indigo-300">
                            ({item.ratingCount > 0 ? `${item.ratingCount}명` : `${item.completedCount}명 완독`})
                          </span>
                        </div>

                        <span className="text-[10px] font-bold text-amber-300 group-hover:underline flex items-center">
                          기록하기 <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 py-8 text-center text-indigo-300 text-xs">
                  등록된 평점 정보가 없습니다. 아래 도서 카드에서 첫 평점을 매겨보세요!
                </div>
              )}
            </div>

            {/* Bottom Info Banner */}
            <div className="bg-indigo-950/60 px-3.5 py-2 rounded-xl border border-indigo-800/40 flex items-center justify-between text-[11px] text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                도서 카드에서 <strong className="text-white font-bold">[완독/독서기록]</strong>을 누르면 평점이 순위에 즉시 반영됩니다!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
