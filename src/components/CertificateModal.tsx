import React from 'react';
import { getCurrentBadge } from '../utils/badges';
import { X, Printer, Award, Sparkles, CheckCircle } from 'lucide-react';

interface CertificateModalProps {
  studentName: string;
  studentGradeClass: string;
  completedCount: number;
  totalCount: number;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName,
  studentGradeClass,
  completedCount,
  totalCount,
  onClose,
}) => {
  const currentBadge = getCurrentBadge(completedCount);
  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-amber-200/80 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">독서 완독 인증서 미리보기</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> 인쇄 / PDF 저장
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame */}
        <div className="p-8 md:p-12 overflow-y-auto print:overflow-visible print:p-8 text-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="border-8 border-double border-amber-600/70 p-8 md:p-10 rounded-2xl bg-white shadow-inner relative overflow-hidden">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-9xl font-black text-amber-900">서룡</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <p className="text-xs md:text-sm font-bold text-amber-800 tracking-widest uppercase mb-1">
                서룡초등학교 필독도서 100선
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight underline decoration-amber-400 decoration-4 underline-offset-8">
                독서 완독 인증서
              </h1>
            </div>

            {/* Student Info Box */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 max-w-md mx-auto mb-8 text-slate-800">
              <p className="text-sm font-medium text-amber-900">
                소속: <span className="font-bold">{studentGradeClass || '서룡초등학교'}</span>
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                성명: {studentName || '학생'}
              </p>
            </div>

            {/* Citation Statement */}
            <div className="space-y-4 text-slate-700 leading-relaxed max-w-lg mx-auto text-sm md:text-base font-medium mb-8">
              <p>
                위 학생은 서룡초등학교 필독도서 100선 중 총{' '}
                <strong className="text-indigo-700 text-lg underline font-extrabold">
                  {completedCount}권
                </strong>
                의 책을 완독하고 달성률{' '}
                <strong className="text-emerald-700 text-lg underline font-extrabold">
                  {percentage}%
                </strong>
                를 기록하며 훌륭한 독서 태도를 발휘하였기에 이 인증서를 수여합니다.
              </p>

              {currentBadge && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-950 px-4 py-2 rounded-full border border-amber-300 shadow-xs font-bold text-xs md:text-sm my-2">
                  <span>{currentBadge.icon}</span>
                  <span>부여 칭호: [{currentBadge.title}]</span>
                </div>
              )}
            </div>

            {/* Date & School Seal Signature */}
            <div className="mt-12 pt-6 border-t border-amber-200 flex flex-col items-center justify-center gap-4">
              <p className="text-sm font-bold text-slate-600 tracking-widest">
                {todayStr}
              </p>

              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-lg font-extrabold text-slate-900 tracking-wider">
                  서룡초등학교장
                </span>
                {/* Simulated Official Seal Stamp */}
                <div className="w-14 h-14 rounded-full border-2 border-red-600 flex items-center justify-center text-red-600 font-black text-xs rotate-[-12deg] shadow-xs bg-red-50/50 select-none">
                  <div className="text-center leading-tight">
                    서룡초<br />직인
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
