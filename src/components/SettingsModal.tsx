import React, { useState } from 'react';
import {
  X,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Link as LinkIcon,
  User,
  Send,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { sendRecordToGoogleSheet } from '../utils/googleAppsScriptSync';

interface SettingsModalProps {
  sheetUrl: string;
  gasUrl: string;
  studentName: string;
  studentGradeClass: string;
  onSaveSettings: (url: string, gasUrl: string, name: string, gradeClass: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  onClose: () => void;
  defaultUrl: string;
  defaultGasUrl: string;
  onOpenPasswordChange?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  sheetUrl,
  gasUrl,
  studentName,
  studentGradeClass,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetData,
  onClose,
  defaultUrl,
  defaultGasUrl,
  onOpenPasswordChange,
}) => {
  const [url, setUrl] = useState(sheetUrl);
  const [appsScriptUrl, setAppsScriptUrl] = useState(gasUrl);
  const [name, setName] = useState(studentName);
  const [gradeClass, setGradeClass] = useState(studentGradeClass);
  const [testStatus, setTestStatus] = useState<{ testing: boolean; message?: string; success?: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(url.trim(), appsScriptUrl.trim(), name.trim(), gradeClass.trim());
    onClose();
  };

  const handleTestGasConnection = async () => {
    if (!appsScriptUrl.trim()) {
      setTestStatus({ testing: false, success: false, message: '웹앱 URL을 입력해주세요.' });
      return;
    }
    setTestStatus({ testing: true });
    try {
      const res = await sendRecordToGoogleSheet(
        {
          studentName: name || '테스트학생',
          grade: gradeClass ? gradeClass.split(' ')[0] : '3학년',
          className: gradeClass ? gradeClass.split(' ')[1] : '1반',
          studentNumber: '1번',
          bookNum: '1',
          bookTitle: '테스트 도서 (연동 테스트)',
          author: '시스템',
          status: 'COMPLETED',
          rating: 5,
          review: '구글 앱스 스크립트 웹앱 연동 테스트입니다.',
          quote: '정상 작동 확인',
          completedDate: new Date().toISOString().split('T')[0],
        },
        appsScriptUrl.trim()
      );
      setTestStatus({
        testing: false,
        success: true,
        message: '연동 신호가 성공적으로 전송되었습니다! 스프레드시트를 확인해보세요.',
      });
    } catch {
      setTestStatus({
        testing: false,
        success: false,
        message: '연동 전송 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in notranslate" translate="no">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base">설정 및 구글 시트 연동 관리</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Student Profile Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              기본 접속 학생 정보
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  학년 / 반 (예: 3학년 1반)
                </label>
                <input
                  type="text"
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  placeholder="예: 3학년 1반"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  학생 이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 김민준"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Google Apps Script Web App URL Settings (for saving reading records) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-indigo-600" />
                독후기록 저장용 구글 웹앱 URL (Google Apps Script)
              </span>
              <button
                type="button"
                onClick={() => setAppsScriptUrl(defaultGasUrl)}
                className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                기본값 복원
              </button>
            </div>

            <div className="relative">
              <input
                type="url"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-indigo-500 shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500">
                학생들이 남긴 별점과 감상평이 위 웹앱을 통해 구글 스프레드시트에 실시간 기록됩니다.
              </p>
              <button
                type="button"
                onClick={handleTestGasConnection}
                disabled={testStatus?.testing}
                className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg transition-colors cursor-pointer shrink-0 ml-2 disabled:opacity-50"
              >
                {testStatus?.testing ? '전송 중...' : '연동 테스트'}
              </button>
            </div>

            {testStatus?.message && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>

          {/* Google Sheet Link Settings (for reading book list CSV) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                도서 목록 불러오기 구글 시트 URL (CSV)
              </h3>
              <button
                type="button"
                onClick={() => setUrl(defaultUrl)}
                className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
              >
                기본 URL로 복원
              </button>
            </div>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              학교 추천도서 100선 목록을 실시간으로 가져오는 CSV 발행 주소입니다.
            </p>
          </div>

          {/* Backup & Import Data */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              데이터 백업 및 복원
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> 전체 백업 다운로드
              </button>

              <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" /> 백업 파일 복원
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Teacher Security & Password */}
          {onOpenPasswordChange && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  교사 관리자 비밀번호 보호
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPasswordChange();
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>비밀번호 변경</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                교사 대시보드 및 시스템 설정 메뉴는 학생이 임의로 접근하거나 수정할 수 없도록 교사용 비밀번호로 안전하게 보호됩니다.
              </p>
            </div>
          )}

          {/* Danger Zone */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onResetData}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> 현재 학생 독서 기록 초기화
            </button>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" /> 설정 저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
