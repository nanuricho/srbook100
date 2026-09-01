import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import {
  hasTeacherPassword,
  setTeacherPassword,
  verifyTeacherPassword,
  resetTeacherPassword,
} from '../utils/teacherAuth';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetName?: 'TEACHER_DASHBOARD' | 'SETTINGS' | 'PASSWORD_CHANGE';
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetName = 'TEACHER_DASHBOARD',
}) => {
  const isSetupMode = !hasTeacherPassword() || targetName === 'PASSWORD_CHANGE';
  
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isResetConfirming, setIsResetConfirming] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetTitle =
    targetName === 'SETTINGS'
      ? '시스템 설정 및 연동'
      : targetName === 'PASSWORD_CHANGE'
      ? '교사 비밀번호 변경'
      : '교사 대시보드 (학생 명단 관리)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSetupMode) {
      // Setting up new password
      if (!password || password.trim().length < 4) {
        setErrorMessage('비밀번호는 최소 4자리 이상 입력해주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      const success = setTeacherPassword(password);
      if (success) {
        onSuccess();
      } else {
        setErrorMessage('비밀번호 설정 중 오류가 발생했습니다.');
      }
    } else {
      // Login mode
      if (!password) {
        setErrorMessage('비밀번호를 입력해주세요.');
        return;
      }

      const isValid = verifyTeacherPassword(password);
      if (isValid) {
        onSuccess();
      } else {
        setErrorMessage('비밀번호가 올바르지 않습니다. 다시 확인해주세요.');
        setPassword('');
      }
    }
  };

  const handleResetPassword = () => {
    resetTeacherPassword();
    setIsResetConfirming(false);
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('비밀번호가 초기화되었습니다. 새로운 비밀번호를 설정해주세요.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn notranslate"
      translate="no"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm md:text-base leading-tight">
                {isSetupMode ? '교사 비밀번호 신규 설정' : '교사 인증 비밀번호'}
              </h2>
              <span className="text-[11px] text-indigo-200 block">
                {targetTitle} 접근 보호
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 border border-indigo-100 shadow-inner">
              {isSetupMode ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {isSetupMode
                ? '학생들의 개인정보 보호 및 관리자 기능 접근을 위해 교사용 비밀번호를 설정해주세요.'
                : '선생님만 접속할 수 있는 보호 영역입니다. 설정된 비밀번호를 입력해주세요.'}
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isSetupMode ? '새 비밀번호 (4자리 이상 권장)' : '교사 비밀번호'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={isSetupMode ? '예: 1234 또는 영문/숫자 조합' : '비밀번호를 입력하세요'}
                autoFocus
                className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Setup mode only) */}
          {isSetupMode && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-slate-700">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="비밀번호를 다시 한 번 입력하세요"
                  className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Reset Confirmation Prompt */}
          {isResetConfirming && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2 animate-fadeIn">
              <p className="font-bold text-amber-900">
                비밀번호를 분실하셨나요? 비밀번호를 초기화하고 새로 설정하시겠습니까?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  네, 비밀번호 초기화
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetConfirming(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{isSetupMode ? '비밀번호 등록 및 접속' : '인증하고 접속하기'}</span>
            </button>

            {!isSetupMode && !isResetConfirming && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsResetConfirming(true)}
                  className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>비밀번호 초기화 / 분실</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
