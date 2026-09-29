import React, { useMemo } from 'react';
import { Book, ReadingRecord, Student, GradeFilter } from '../types';
import { CheckCircle2, BookOpen, Clock } from 'lucide-react';

interface StatsOverviewProps {
  books: Book[];
  records: Record<string, ReadingRecord>;
  activeStudent?: Student | null;
  students?: Student[];
  selectedGrade?: GradeFilter;
  onSelectGrade?: (grade: GradeFilter) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  books,
  records,
}) => {
  const totalCount = books.length;

  const completedCount = useMemo(() => {
    return books.filter((b) => records[b.num]?.status === 'COMPLETED').length;
  }, [books, records]);

  const inProgressCount = useMemo(() => {
    return books.filter((b) => records[b.num]?.status === 'IN_PROGRESS').length;
  }, [books, records]);

  return (
    <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-5 md:p-6 mb-6 notranslate" translate="no">
      {/* Top Main Cards Grid (전체 도서, 완독 도서, 읽는 중) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
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
      </div>
    </div>
  );
};
