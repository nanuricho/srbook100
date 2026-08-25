import React from 'react';
import { Book, ReadingRecord } from '../types';
import { getCurrentBadge, getNextBadge } from '../utils/badges';
import { CheckCircle2, BookOpen, Clock, Trophy, ChevronRight } from 'lucide-react';

interface StatsOverviewProps {
  books: Book[];
  records: Record<string, ReadingRecord>;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ books, records }) => {
  const totalCount = books.length;
  
  const completedCount = books.filter(
    (b) => records[b.num]?.status === 'COMPLETED'
  ).length;

  const inProgressCount = books.filter(
    (b) => records[b.num]?.status === 'IN_PROGRESS'
  ).length;

  const unreadCount = Math.max(0, totalCount - completedCount - inProgressCount);

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentBadge = getCurrentBadge(completedCount);
  const nextBadge = getNextBadge(completedCount);

  // Grade breakdown computation
  const grades = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년', '전학년'];
  const gradeStats = grades.map((grade) => {
    const gradeBooks = books.filter((b) => b.grade.includes(grade) || (grade === '전학년' && (b.grade === '전학년' || b.grade === '공통')));
    const gradeTotal = gradeBooks.length;
    const gradeCompleted = gradeBooks.filter(
      (b) => records[b.num]?.status === 'COMPLETED'
    ).length;
    const gradePercent = gradeTotal > 0 ? Math.round((gradeCompleted / gradeTotal) * 100) : 0;
    return {
      grade,
      total: gradeTotal,
      completed: gradeCompleted,
      percent: gradePercent,
    };
  }).filter((g) => g.total > 0);

  // Progress to next badge
  let nextBadgeProgress = 100;
  let prevBadgeReq = 0;
  if (nextBadge) {
    prevBadgeReq = currentBadge ? currentBadge.requiredCount : 0;
    const range = nextBadge.requiredCount - prevBadgeReq;
    const progressInRage = completedCount - prevBadgeReq;
    nextBadgeProgress = Math.min(100, Math.max(0, Math.round((progressInRage / range) * 100)));
  }

  return (
    <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-5 md:p-6 mb-6">
      {/* Top Main Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Total Books */}
        <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">전체 도서</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{totalCount}권</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-emerald-50/80 border-2 border-emerald-100/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">완독 도서</p>
            <p className="text-xl font-black text-emerald-900 mt-0.5">{completedCount}권</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-amber-50/80 border-2 border-amber-100/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">읽는 중</p>
            <p className="text-xl font-black text-amber-900 mt-0.5">{inProgressCount}권</p>
          </div>
        </div>

        {/* Progress Percent */}
        <div className="bg-indigo-50/80 border-2 border-indigo-100/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider">전체 달성률</p>
            <p className="text-xl font-black text-indigo-900 mt-0.5">{percentage}%</p>
          </div>
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            🎯 100선 완독 달성율
          </span>
          <span className="text-sm font-bold text-indigo-600">{completedCount} / {totalCount}권 ({percentage}%)</span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Next Badge Goal + Grade Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
        {/* Next Badge Tracker */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-4 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-xs text-indigo-200 mb-2">
              <span className="font-semibold uppercase tracking-wider">다음 달성 뱃지</span>
              {nextBadge && (
                <span>{completedCount} / {nextBadge.requiredCount}권</span>
              )}
            </div>

            {nextBadge ? (
              <div className="flex items-center gap-3 my-1">
                <span className="text-3xl">{nextBadge.icon}</span>
                <div>
                  <h4 className="font-bold text-base text-white">{nextBadge.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-1">{nextBadge.description}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 my-1">
                <span className="text-3xl">🏆</span>
                <div>
                  <h4 className="font-bold text-base text-amber-300">최고 등급 달성!</h4>
                  <p className="text-xs text-slate-300">100선 완독을 축하합니다!</p>
                </div>
              </div>
            )}
          </div>

          {nextBadge && (
            <div className="mt-3">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${nextBadgeProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-right text-slate-400 mt-1">
                완독까지 <span className="text-amber-300 font-bold">{nextBadge.requiredCount - completedCount}권</span> 남음
              </p>
            </div>
          )}
        </div>

        {/* Grade Breakdown Progress Meters */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            학년별 완독 현황
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {gradeStats.map((item) => (
              <div key={item.grade} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700">{item.grade}</span>
                  <span className="text-slate-500 font-bold">{item.completed}/{item.total}</span>
                </div>
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
