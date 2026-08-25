import React from 'react';
import { BookOpen, Award, Settings, RefreshCw, Sparkles, UserCheck, Users, Search, ChevronRight } from 'lucide-react';
import { getCurrentBadge } from '../utils/badges';
import { AppTab, Student } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  activeStudent: Student | null;
  completedCount: number;
  totalCount: number;
  isLoading: boolean;
  isSyncing: boolean;
  onRefreshData: () => void;
  onOpenCertificate: () => void;
  onOpenSettings: () => void;
  totalStudentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  activeStudent,
  completedCount,
  totalCount,
  isLoading,
  isSyncing,
  onRefreshData,
  onOpenCertificate,
  onOpenSettings,
  totalStudentsCount,
}) => {
  const currentBadge = getCurrentBadge(completedCount);
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="bg-white rounded-3xl shadow-vibrant border border-slate-100 p-5 md:p-6 mb-6 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand & Actions Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10 pb-5 border-b border-slate-100">
        {/* Title Section */}
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                서룡초등학교
              </span>
              {currentBadge && (
                <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${currentBadge.color} text-white shadow-xs`}>
                  {currentBadge.icon} {currentBadge.title}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tight mt-1 flex items-center gap-2">
              📚 서룡 필독도서 100선
            </h1>

            <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              {activeStudent ? (
                <div className="inline-flex items-center gap-1.5 bg-indigo-50/80 px-2.5 py-0.5 rounded-xl border border-indigo-100 text-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-extrabold text-indigo-900">
                    {activeStudent.grade} {activeStudent.className} {activeStudent.studentNumber || ''} {activeStudent.name}
                  </span>
                  <button
                    onClick={() => onChangeTab('STUDENT_LOOKUP')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline ml-1 cursor-pointer"
                  >
                    학생 변경
                  </button>
                </div>
              ) : (
                <span>서룡초등학교 어린이를 위한 전자 독서 기록장</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Quick Stats & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
          {/* Header Progress Pill */}
          <div className="bg-slate-100/90 rounded-2xl px-4 py-2.5 flex items-center gap-4 border border-slate-200/60">
            <div className="text-center">
              <span className="block text-lg font-black text-indigo-600 leading-none">{completedCount}</span>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">완독</span>
            </div>

            <div className="w-28 sm:w-32">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">달성률</span>
                <span className="text-xs font-black text-emerald-600">{percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshData}
              disabled={isSyncing || isLoading}
              title="구글 시트 도서 목록 새로고침"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-2 border-slate-200 active:bg-slate-100 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">동기화</span>
            </button>

            <button
              onClick={onOpenCertificate}
              disabled={completedCount === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border-2 border-amber-300 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>완독 인증서</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="설정 및 구글 시트 연동"
              className="p-2.5 text-slate-600 bg-white hover:text-indigo-600 hover:bg-indigo-50 border-2 border-slate-200 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 pt-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => onChangeTab('BOOKS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'BOOKS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 필독도서 100선 탐색 & 기록</span>
        </button>

        <button
          onClick={() => onChangeTab('STUDENT_LOOKUP')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'STUDENT_LOOKUP'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>🔍 내 독서 기록 조회</span>
          {activeStudent && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-indigo-100">
              {activeStudent.name}
            </span>
          )}
        </button>

        <button
          onClick={() => onChangeTab('TEACHER_DASHBOARD')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'TEACHER_DASHBOARD'
              ? 'bg-indigo-900 text-white shadow-md shadow-indigo-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👩‍🏫 교사 대시보드 (명단 일괄 업로드)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            {totalStudentsCount}명
          </span>
        </button>
      </div>
    </header>
  );
};

