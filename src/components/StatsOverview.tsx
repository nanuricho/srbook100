import React, { useState, useEffect, useMemo } from 'react';
import { Book, ReadingRecord, Student, GradeFilter } from '../types';
import { getCurrentBadge, getNextBadge, BADGES } from '../utils/badges';
import { CheckCircle2, BookOpen, Clock, Trophy, Target, Sparkles, ChevronRight, Award } from 'lucide-react';

interface StatsOverviewProps {
  books: Book[];
  records: Record<string, ReadingRecord>;
  activeStudent?: Student | null;
  selectedGrade?: GradeFilter;
  onSelectGrade?: (grade: GradeFilter) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  books,
  records,
  activeStudent,
  selectedGrade,
  onSelectGrade,
}) => {
  const totalCount = books.length;
  
  const completedCount = useMemo(() => {
    return books.filter((b) => records[b.num]?.status === 'COMPLETED').length;
  }, [books, records]);

  const inProgressCount = useMemo(() => {
    return books.filter((b) => records[b.num]?.status === 'IN_PROGRESS').length;
  }, [books, records]);

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Grade list
  const GRADES = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];

  // Determine effective grade from active student (highest priority), then selected grade filter, default to '1학년'
  const initialGrade = useMemo(() => {
    if (activeStudent?.grade && GRADES.includes(activeStudent.grade)) {
      return activeStudent.grade;
    }
    if (selectedGrade && GRADES.includes(selectedGrade)) {
      return selectedGrade;
    }
    return '1학년';
  }, [activeStudent?.grade, selectedGrade]);

  // Current grade target displayed in the goal card
  const [targetGrade, setTargetGrade] = useState<string>(initialGrade);

  // Sync targetGrade when active student or selectedGrade changes
  useEffect(() => {
    if (activeStudent?.grade && GRADES.includes(activeStudent.grade)) {
      setTargetGrade(activeStudent.grade);
    } else if (selectedGrade && GRADES.includes(selectedGrade)) {
      setTargetGrade(selectedGrade);
    }
  }, [activeStudent?.grade, selectedGrade]);

  // Target Grade Specific Stats
  const targetGradeBooks = useMemo(() => {
    return books.filter((b) => b.grade.includes(targetGrade));
  }, [books, targetGrade]);

  const targetTotal = targetGradeBooks.length;
  const targetCompleted = useMemo(() => {
    return targetGradeBooks.filter((b) => records[b.num]?.status === 'COMPLETED').length;
  }, [targetGradeBooks, records]);

  const targetInProgress = useMemo(() => {
    return targetGradeBooks.filter((b) => records[b.num]?.status === 'IN_PROGRESS').length;
  }, [targetGradeBooks, records]);

  const targetPercentage = targetTotal > 0 ? Math.round((targetCompleted / targetTotal) * 100) : 0;
  const targetRemaining = Math.max(0, targetTotal - targetCompleted);

  // Grade Milestone Badge & Description based on grade progress
  const gradeMilestone = useMemo(() => {
    if (targetTotal === 0) {
      return {
        icon: '🌱',
        title: `${targetGrade} 독서 시작`,
        description: `${targetGrade} 권장도서를 확인하고 첫 완독에 도전해보세요!`,
      };
    }

    if (targetCompleted >= targetTotal) {
      return {
        icon: '👑',
        title: `${targetGrade} 필독도서 완독 달성!`,
        description: `축하합니다! ${targetGrade} 필독도서 ${targetTotal}권을 모두 완독하여 학년 마스터가 되었어요! 🎉`,
      };
    }

    if (targetCompleted === 0) {
      return {
        icon: '🌱',
        title: `${targetGrade} 독서 씨앗`,
        description: `${targetGrade} 필독도서 총 ${targetTotal}권 완독 목표에 도전해보세요!`,
      };
    }

    const pct = (targetCompleted / targetTotal) * 100;
    if (pct < 30) {
      return {
        icon: '🌿',
        title: `${targetGrade} 독서 새싹`,
        description: `${targetTotal}권의 필독도서 중 ${targetCompleted}권을 완독하고 씨앗을 틔웠어요.`,
      };
    }
    if (pct < 60) {
      return {
        icon: '📖',
        title: `${targetGrade} 독서 탐험가`,
        description: `${targetTotal}권 중 ${targetCompleted}권을 완독하며 책 읽는 재미를 알아가고 있어요.`,
      };
    }
    if (pct < 90) {
      return {
        icon: '🌳',
        title: `${targetGrade} 독서 마라토너`,
        description: `${targetTotal}권 중 ${targetCompleted}권 완독! 절반을 넘어 풍성한 지식의 나무가 자라납니다.`,
      };
    }
    return {
      icon: '💫',
      title: `${targetGrade} 완독 눈앞!`,
      description: `완독까지 단 ${targetRemaining}권 남았어요! 끝까지 멋지게 완주해보세요!`,
    };
  }, [targetCompleted, targetTotal, targetGrade, targetRemaining]);

  // Overall Grade breakdown computation
  const grades = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년', '전학년'];
  const gradeStats = grades.map((grade) => {
    const gradeBooks = books.filter((b) => b.grade.includes(grade) || (grade === '전학년' && (b.grade === '전학년' || b.grade === '공통')));
    const gTotal = gradeBooks.length;
    const gCompleted = gradeBooks.filter(
      (b) => records[b.num]?.status === 'COMPLETED'
    ).length;
    const gPercent = gTotal > 0 ? Math.round((gCompleted / gTotal) * 100) : 0;
    return {
      grade,
      total: gTotal,
      completed: gCompleted,
      percent: gPercent,
    };
  }).filter((g) => g.total > 0);

  const handleSwitchTargetGrade = (g: string) => {
    setTargetGrade(g);
    if (onSelectGrade) {
      onSelectGrade(g as GradeFilter);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-5 md:p-6 mb-6 notranslate" translate="no">
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
      <div className="mb-6 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-2">
          <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>100선 독서 마라톤 전체 완독률</span>
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-indigo-600">
            총 {completedCount} / {totalCount}권 ({percentage}%)
          </span>
        </div>
        <div className="w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-200 flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Next Badge Goal + Grade Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
        {/* Grade-Specific Achievement Goal Card (Matches User Image Request) */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 rounded-2xl p-4 md:p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-md border border-indigo-800/60">
          <div className="absolute top-0 right-0 p-10 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          <div>
            {/* Top Bar: Title & Target Grade Progress */}
            <div className="flex items-center justify-between text-xs text-indigo-200 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold uppercase tracking-wider text-white flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  다음 달성 목표
                </span>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/40 px-1.5 py-0.5 rounded-md">
                  {targetGrade}
                </span>
              </div>
              <div className="flex items-center gap-1 text-right">
                <span className="font-black text-amber-300 text-sm">{targetCompleted} / {targetTotal}권</span>
                <span className="text-[11px] text-indigo-200 font-bold">({targetPercentage}%)</span>
              </div>
            </div>

            {/* Quick Grade Selector Pills on Goal Card */}
            <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {GRADES.map((g) => {
                const isSelected = targetGrade === g;
                const isMyGrade = activeStudent?.grade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleSwitchTargetGrade(g)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-indigo-950 border-amber-300 shadow-xs'
                        : 'bg-indigo-950/70 text-indigo-200 border-indigo-700/50 hover:bg-indigo-800/60'
                    }`}
                    title={`${g} 목표 보기`}
                  >
                    {g}
                    {isMyGrade && <span className="ml-1 text-[9px] text-amber-700 font-black">★</span>}
                  </button>
                );
              })}
            </div>

            {/* Icon, Title, and Encouraging Description */}
            <div className="flex items-start gap-3.5 my-1.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
              <span className="text-3xl sm:text-4xl shrink-0 pt-0.5">{gradeMilestone.icon}</span>
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <span>{gradeMilestone.title}</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {gradeMilestone.description}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar & Remaining Count (Matches User Image Request) */}
          <div className="mt-3.5 pt-2 border-t border-indigo-800/40">
            <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-indigo-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1.5 text-slate-400">
              <span>
                {targetInProgress > 0 ? (
                  <span className="text-amber-200 font-medium">읽는 중 {targetInProgress}권</span>
                ) : (
                  <span>진행률 {targetPercentage}%</span>
                )}
              </span>
              <span className="text-right">
                {targetRemaining > 0 ? (
                  <>
                    완독까지 <span className="text-amber-300 font-black text-xs">{targetRemaining}권</span> 남음
                  </>
                ) : (
                  <span className="text-emerald-300 font-bold">🎉 {targetGrade} 목표 완독 완료!</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Grade Breakdown Progress Meters */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              학년별 완독 현황
            </h4>
            <span className="text-[11px] text-slate-400">
              카드를 클릭하면 해당 학년 목표로 전환됩니다
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {gradeStats.map((item) => {
              const isSelected = targetGrade === item.grade;
              const isMyGrade = activeStudent?.grade === item.grade;
              return (
                <button
                  key={item.grade}
                  type="button"
                  onClick={() => handleSwitchTargetGrade(item.grade)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-400 shadow-xs ring-2 ring-indigo-300/40'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <span>{item.grade}</span>
                      {isMyGrade && (
                        <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-black">
                          내 학년
                        </span>
                      )}
                    </span>
                    <span className={`font-black text-xs ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                      {item.completed}/{item.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.percent >= 100
                          ? 'bg-emerald-500'
                          : isSelected
                          ? 'bg-indigo-600'
                          : 'bg-indigo-400'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right mt-1 font-medium">
                    {item.percent}% 달성
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

