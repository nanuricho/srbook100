import React, { useState, useEffect } from 'react';
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
  School,
  Crown,
  Sparkles,
} from 'lucide-react';
import {
  hasMasterPassword,
  verifyMasterPassword,
  setMasterPassword,
  hasClassPassword,
  setClassPassword,
  verifyClassPassword,
  resetClassPassword,
  setTeacherSessionAuthenticated,
  getCurrentTeacherSession,
  TeacherSession,
  syncClassPasswordsWithCloud,
} from '../utils/teacherAuth';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session?: TeacherSession) => void;
  targetName?: 'TEACHER_DASHBOARD' | 'SETTINGS' | 'PASSWORD_CHANGE';
}

const GRADES = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];
const CLASSES = ['1반', '2반', '3반', '4반', '5반', '6반', '7반', '8반', '9반', '10반'];

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetName = 'TEACHER_DASHBOARD',
}) => {
  const currentSession = getCurrentTeacherSession();

  // Auth Type: Class teacher vs Master admin
  const [authMode, setAuthMode] = useState<'CLASS' | 'MASTER'>(() => {
    if (currentSession?.role === 'MASTER') return 'MASTER';
    return 'CLASS';
  });

  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    return currentSession?.grade || '3학년';
  });
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    return currentSession?.className || '1반';
  });

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [masterResetKey, setMasterResetKey] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [isClassPasswordRegistered, setIsClassPasswordRegistered] = useState<boolean>(false);

  // Sync cloud passwords on modal open
  useEffect(() => {
    if (isOpen) {
      syncClassPasswordsWithCloud().then(() => {
        checkCurrentClassStatus();
      });
      setPassword('');
      setConfirmPassword('');
      setMasterResetKey('');
      setErrorMessage('');
      setSuccessMessage('');
      setIsResetMode(false);
    }
  }, [isOpen, selectedGrade, selectedClass, authMode]);

  const checkCurrentClassStatus = () => {
    if (authMode === 'CLASS') {
      const exists = hasClassPassword(selectedGrade, selectedClass);
      setIsClassPasswordRegistered(exists);
    }
  };

  useEffect(() => {
    checkCurrentClassStatus();
  }, [selectedGrade, selectedClass, authMode]);

  if (!isOpen) return null;

  const isChangingCurrentPassword = targetName === 'PASSWORD_CHANGE';
  const isSettingNewClassPassword = authMode === 'CLASS' && !isClassPasswordRegistered;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Case 1: Password Change Mode
    if (isChangingCurrentPassword) {
      if (!password || password.trim().length < 4) {
        setErrorMessage('비밀번호는 최소 4자리 이상 입력해주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      if (authMode === 'CLASS') {
        const ok = await setClassPassword(selectedGrade, selectedClass, password);
        if (ok) {
          const session: TeacherSession = {
            role: 'CLASS_TEACHER',
            grade: selectedGrade,
            className: selectedClass,
            label: `${selectedGrade} ${selectedClass} 담임선생님`,
            loginAt: new Date().toISOString(),
          };
          setTeacherSessionAuthenticated(true, session);
          onSuccess(session);
        } else {
          setErrorMessage('비밀번호 변경 중 오류가 발생했습니다.');
        }
      } else {
        const ok = await setMasterPassword(password);
        if (ok) {
          const session: TeacherSession = {
            role: 'MASTER',
            label: '총괄 관리자',
            loginAt: new Date().toISOString(),
          };
          setTeacherSessionAuthenticated(true, session);
          onSuccess(session);
        } else {
          setErrorMessage('총괄 비밀번호 변경 중 오류가 발생했습니다.');
        }
      }
      return;
    }

    // Case 2: Class Teacher Mode - First Time Registration
    if (authMode === 'CLASS' && !isClassPasswordRegistered) {
      if (!password || password.trim().length < 4) {
        setErrorMessage('비밀번호는 최소 4자리 이상으로 설정해주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      const ok = await setClassPassword(selectedGrade, selectedClass, password);
      if (ok) {
        const session: TeacherSession = {
          role: 'CLASS_TEACHER',
          grade: selectedGrade,
          className: selectedClass,
          label: `${selectedGrade} ${selectedClass} 담임선생님`,
          loginAt: new Date().toISOString(),
        };
        setTeacherSessionAuthenticated(true, session);
        onSuccess(session);
      } else {
        setErrorMessage('비밀번호 등록 중 오류가 발생했습니다.');
      }
      return;
    }

    // Case 3: Class Teacher Mode - Regular Login
    if (authMode === 'CLASS' && isClassPasswordRegistered) {
      if (!password) {
        setErrorMessage('비밀번호를 입력해주세요.');
        return;
      }

      const isValid = verifyClassPassword(selectedGrade, selectedClass, password);
      if (isValid) {
        const session: TeacherSession = {
          role: 'CLASS_TEACHER',
          grade: selectedGrade,
          className: selectedClass,
          label: `${selectedGrade} ${selectedClass} 담임선생님`,
          loginAt: new Date().toISOString(),
        };
        setTeacherSessionAuthenticated(true, session);
        onSuccess(session);
      } else {
        setErrorMessage(
          `${selectedGrade} ${selectedClass} 비밀번호가 올바르지 않습니다. (분실 시 마스터 비밀번호로도 접속 가능)`
        );
        setPassword('');
      }
      return;
    }

    // Case 4: Master Admin Login
    if (authMode === 'MASTER') {
      if (!password) {
        setErrorMessage('총괄 관리자 비밀번호를 입력해주세요.');
        return;
      }

      const isValid = verifyMasterPassword(password);
      if (isValid) {
        const session: TeacherSession = {
          role: 'MASTER',
          label: '총괄 관리자',
          loginAt: new Date().toISOString(),
        };
        setTeacherSessionAuthenticated(true, session);
        onSuccess(session);
      } else {
        setErrorMessage('총괄 관리자 비밀번호가 올바르지 않습니다.');
        setPassword('');
      }
    }
  };

  // Reset Class Password using Master Admin Key
  const handleResetClassPassword = async () => {
    if (!verifyMasterPassword(masterResetKey)) {
      setErrorMessage('총괄 마스터 비밀번호가 일치하지 않아 초기화할 수 없습니다.');
      return;
    }

    await resetClassPassword(selectedGrade, selectedClass);
    setIsClassPasswordRegistered(false);
    setIsResetMode(false);
    setPassword('');
    setConfirmPassword('');
    setMasterResetKey('');
    setSuccessMessage(`${selectedGrade} ${selectedClass} 비밀번호가 초기화되었습니다. 새 비밀번호를 등록해주세요!`);
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
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm md:text-base leading-tight">
                {isChangingCurrentPassword
                  ? '교사 비밀번호 변경'
                  : authMode === 'CLASS'
                  ? '담임 교사 접속 인증'
                  : '총괄 관리자 인증'}
              </h2>
              <span className="text-[11px] text-indigo-200 block">
                {authMode === 'CLASS' ? `${selectedGrade} ${selectedClass} 전용 관리` : '전체 학급 일괄 관리'}
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

        {/* Mode Selector Tabs (담임 교사 vs 총괄 관리자) */}
        {!isChangingCurrentPassword && (
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('CLASS');
                setErrorMessage('');
                setPassword('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'CLASS'
                  ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <School className="w-3.5 h-3.5 text-indigo-600" />
              <span>학급 담임 교사</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('MASTER');
                setErrorMessage('');
                setPassword('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'MASTER'
                  ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>총괄 관리자 (독서담당)</span>
            </button>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Class Selectors (Shown when authMode is CLASS) */}
          {authMode === 'CLASS' && (
            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2.5">
              <label className="block text-xs font-black text-indigo-950">
                담임 담당 학년 및 반 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">학년</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 shadow-2xs"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">반</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 shadow-2xs"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Notice for Selected Class */}
              <div className="pt-1">
                {!isClassPasswordRegistered ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2.5 py-1.5 rounded-lg border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{selectedGrade} {selectedClass}은 아직 비번이 없습니다. 최초 등록해주세요!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{selectedGrade} {selectedClass} 비밀번호가 설정되어 있습니다.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Master Admin Notice */}
          {authMode === 'MASTER' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>총괄 관리자 / 독서업무 담당 교사</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                전 학년·전 학급의 학생 명단 일괄 관리 및 구글 시트 연동 설정을 모두 관리할 수 있습니다. (초기 비밀번호: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">seoryong100</code>)
              </p>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isSettingNewClassPassword || isChangingCurrentPassword
                ? `${authMode === 'CLASS' ? `${selectedGrade} ${selectedClass}` : '총괄'} 새 비밀번호 (4자리 이상)`
                : `${authMode === 'CLASS' ? `${selectedGrade} ${selectedClass}` : '총괄'} 비밀번호`}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={
                  isSettingNewClassPassword || isChangingCurrentPassword
                    ? '새 비밀번호 입력 (예: 1234)'
                    : '비밀번호를 입력하세요'
                }
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

          {/* Confirm Password (Registration or Change mode only) */}
          {(isSettingNewClassPassword || isChangingCurrentPassword) && (
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

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Reset Modal via Master Password */}
          {isResetMode && authMode === 'CLASS' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2.5 animate-fadeIn">
              <p className="font-bold text-amber-900">
                {selectedGrade} {selectedClass} 담임 비밀번호 분실 초기화
              </p>
              <p className="text-[11px] text-amber-800">
                비밀번호를 초기화하려면 <strong>총괄 마스터 비밀번호</strong>를 입력해주세요.
              </p>
              <input
                type="password"
                value={masterResetKey}
                onChange={(e) => setMasterResetKey(e.target.value)}
                placeholder="총괄 마스터 비밀번호 입력"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetClassPassword}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  비밀번호 초기화 실행
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetMode(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>
                {isChangingCurrentPassword
                  ? '비밀번호 변경 완료'
                  : isSettingNewClassPassword
                  ? `${selectedGrade} ${selectedClass} 비밀번호 등록 및 접속`
                  : authMode === 'CLASS'
                  ? `${selectedGrade} ${selectedClass} 대시보드 접속`
                  : '총괄 관리자 접속하기'}
              </span>
            </button>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-1">
              {authMode === 'CLASS' && isClassPasswordRegistered && !isResetMode ? (
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>비밀번호 분실 / 마스터 초기화</span>
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

