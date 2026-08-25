import React, { useState } from 'react';
import { X, Save, RefreshCw, Download, Upload, Trash2, Link as LinkIcon, User } from 'lucide-react';

interface SettingsModalProps {
  sheetUrl: string;
  studentName: string;
  studentGradeClass: string;
  onSaveSettings: (url: string, name: string, gradeClass: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  onClose: () => void;
  defaultUrl: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  sheetUrl,
  studentName,
  studentGradeClass,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetData,
  onClose,
  defaultUrl,
}) => {
  const [url, setUrl] = useState(sheetUrl);
  const [name, setName] = useState(studentName);
  const [gradeClass, setGradeClass] = useState(studentGradeClass);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(url.trim(), name.trim(), gradeClass.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base">설정 및 전자 독서록 관리</h2>
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
              학생 정보
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
                  placeholder="예: 홍길동"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Google Sheet Link Settings */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                구글 시트 연동 URL
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
              학교 구글 시트 게시 URL (CSV 내보내기 링크)입니다.
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
                <Download className="w-3.5 h-3.5" /> 백업 다운로드
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

          {/* Danger Zone */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onResetData}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> 모든 독서 기록 초기화
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
              <Save className="w-3.5 h-3.5" /> 저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
