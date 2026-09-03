import React from 'react';
import {
  BookOpen,
  Award,
  Settings,
  RefreshCw,
  Sparkles,
  UserCheck,
  Users,
  Search,
  ChevronRight,
  Lock,
  Unlock,
  LogOut,
  Cloud,
} from 'lucide-react';
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
  cloudStatus?: 'synced' | 'syncing' | 'offline';
  onRefreshData: () => void;
  onOpenCertificate: () => void;
  onOpenSettings: () => void;
  totalStudentsCount: number;
  isTeacherAuthenticated: boolean;
  onTeacherLogout: () => void;
  onOpenTeacherAuth: (target: 'TEACHER_DASHBOARD' | 'SETTINGS') => void;
  onStudentLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  activeStudent,
  completedCount,
  totalCount,
  isLoading,
  isSyncing,
  cloudStatus = 'synced',
  onRefreshData,
  onOpenCertificate,
  onOpenSettings,
  totalStudentsCount,
  isTeacherAuthenticated,
  onTeacherLogout,
  onOpenTeacherAuth,
  onStudentLogout,
}) => {
  const currentBadge = getCurrentBadge(completedCount);
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleTeacherDashboardClick = () => {
    if (isTeacherAuthenticated) {
      onChangeTab('TEACHER_DASHBOARD');
    } else {
      onOpenTeacherAuth('TEACHER_DASHBOARD');
    }
  };

  const handleSettingsClick = () => {
    if (isTeacherAuthenticated) {
      onOpenSettings();
    } else {
      onOpenTeacherAuth('SETTINGS');
    }
  };

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
              {/* Cloud Sync Status Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                  cloudStatus === 'synced'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : cloudStatus === 'syncing'
                    ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title="모든 기기(휴대폰, 태블릿, PC) 실시간 클라우드 동기화 상태"
              >
                <Cloud className={`w-3 h-3 ${cloudStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>
                  {cloudStatus === 'synced'
                    ? '전 기기 실시간 동기화'
                    : cloudStatus === 'syncing'
                    ? '클라우드 저장 중...'
                    : '오프라인 캐시 모드'}
                </span>
              </span>
              {currentBadge && (
                <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${currentBadge.color} text-white shadow-xs`}>
                  {currentBadge.icon} {currentBadge.title}
                </span>
              )}
              {isTeacherAuthenticated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fadeIn">
                  <Unlock className="w-3 h-3 text-emerald-600" /> 교사 인증됨
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tight mt-1 flex items-center gap-2">
              📚 서룡 필독도서 100선
            </h1>

            <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              {activeStudent ? (
                <div className="inline-flex items-center gap-2 bg-indigo-50/90 px-3 py-1 rounded-2xl border border-indigo-200/80 text-slate-700 shadow-2xs">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-extrabold text-indigo-950">
                    {activeStudent.grade} {activeStudent.className} {activeStudent.studentNumber ? `${activeStudent.studentNumber} ` : ''}{activeStudent.name}
                  </span>
                  <div className="flex items-center gap-1.5 ml-1 border-l border-indigo-200 pl-2">
                    <button
                      type="button"
                      onClick={() => onChangeTab('STUDENT_LOOKUP')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      조회/변경
                    </button>
                    <span className="text-slate-300 text-[10px]">·</span>
                    <button
                      type="button"
                      onClick={onStudentLogout}
                      className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-[11px] font-black transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="학생 기록 종료 및 이름 숨기기"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>나가기</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500">서룡초등학교 어린이를 위한 전자 독서 기록장</span>
                  <button
                    type="button"
                    onClick={() => onChangeTab('STUDENT_LOOKUP')}
                    className="px-2.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Search className="w-3 h-3 text-indigo-600" />
                    <span>내 이름으로 조회/기록</span>
                  </button>
                </div>
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
              onClick={handleSettingsClick}
              title={isTeacherAuthenticated ? '교사 시스템 설정' : '교사 인증 후 설정 접속'}
              className="p-2.5 text-slate-600 bg-white hover:text-indigo-600 hover:bg-indigo-50 border-2 border-slate-200 rounded-xl transition-all cursor-pointer shadow-xs relative"
            >
              <Settings className="w-4 h-4" />
              {!isTeacherAuthenticated && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border border-white">
                  🔒
                </span>
              )}
            </button>

            {isTeacherAuthenticated && (
              <button
                onClick={onTeacherLogout}
                title="교사 모드 잠금 (로그아웃)"
                className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">잠금</span>
              </button>
            )}
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
          onClick={handleTeacherDashboardClick}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'TEACHER_DASHBOARD'
              ? 'bg-indigo-900 text-white shadow-md shadow-indigo-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👩‍🏫 교사 대시보드 (명단 일괄 관리)</span>
          {!isTeacherAuthenticated ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-0.5">
              <Lock className="w-3 h-3 text-amber-700" />
              보호됨
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              {totalStudentsCount}명
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

