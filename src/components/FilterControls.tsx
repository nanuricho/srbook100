import React from 'react';
import { GradeFilter, StatusFilter, SortOption, ViewLayout } from '../types';
import { Search, X, LayoutGrid, List, ArrowUpDown, Filter } from 'lucide-react';

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGrade: GradeFilter;
  onGradeChange: (grade: GradeFilter) => void;
  selectedStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewLayout: ViewLayout;
  onViewLayoutChange: (layout: ViewLayout) => void;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
}

const GRADES: { label: string; value: GradeFilter }[] = [
  { label: '전체 학년', value: 'ALL' },
  { label: '1학년', value: '1학년' },
  { label: '2학년', value: '2학년' },
  { label: '3학년', value: '3학년' },
  { label: '4학년', value: '4학년' },
  { label: '5학년', value: '5학년' },
  { label: '6학년', value: '6학년' },
  { label: '공통/전학년', value: '공통/기타' },
];

const STATUSES: { label: string; value: StatusFilter; color?: string }[] = [
  { label: '전체', value: 'ALL' },
  { label: '완독', value: 'COMPLETED' },
  { label: '읽는 중', value: 'IN_PROGRESS' },
  { label: '미독', value: 'UNREAD' },
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedGrade,
  onGradeChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  viewLayout,
  onViewLayoutChange,
  filteredCount,
  totalCount,
  onResetFilters,
}) => {
  const isFilterActive =
    searchQuery.trim() !== '' || selectedGrade !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-4 md:p-5 mb-6 space-y-4">
      {/* Top Search & Layout Controls Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="도서명이나 작가를 검색해보세요..."
            className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-200 focus:border-indigo-600 focus:outline-hidden rounded-2xl text-sm font-medium transition-all text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Controls: Sort & View Toggle */}
        <div className="flex items-center gap-2 justify-between md:justify-end shrink-0">
          {/* Sort Dropdown */}
          <div className="relative flex items-center bg-white border-2 border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500 mr-2 shrink-0" />
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent font-semibold focus:outline-hidden cursor-pointer text-slate-800 pr-1"
            >
              <option value="NUM_ASC">도서 번호순 (1~100)</option>
              <option value="TITLE_ASC">도서 제목순 (가나다)</option>
              <option value="GRADE_ASC">학년 순</option>
              <option value="RATING_DESC">높은 별점순</option>
              <option value="DATE_DESC">최근 완독순</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onViewLayoutChange('GRID')}
              title="카드형 보기"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'GRID'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewLayoutChange('LIST')}
              title="목록형 보기"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'LIST'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grade Pills & Status Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Grade Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 mr-1 shrink-0 flex items-center gap-1 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-500" /> 학년:
          </span>
          {GRADES.map((g) => {
            const isActive = selectedGrade === g.value;
            return (
              <button
                key={g.value}
                onClick={() => onGradeChange(g.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0 self-start lg:self-auto border border-slate-200/60">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => onStatusChange(s.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === s.value
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Status Summary Bar */}
      <div className="text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2 pt-1">
        <span className="font-medium">
          도서 목록: <strong className="text-slate-800 font-extrabold">{filteredCount}</strong>권 표시 중 / 전체 {totalCount}권
        </span>

        {isFilterActive && (
          <button
            onClick={onResetFilters}
            className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
          >
            <X className="w-3.5 h-3.5" /> 필터 초기화
          </button>
        )}
      </div>
    </div>
  );
};
