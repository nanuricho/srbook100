import React, { useState, useEffect } from 'react';
import { Book, ReadingRecord, ReadingStatus, Student } from '../types';
import {
  X,
  Star,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Save,
  Trash2,
  User,
  Sparkles,
  Check,
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  record?: ReadingRecord;
  activeStudent: Student | null;
  students: Student[];
  onClose: () => void;
  onSaveRecordForStudent: (studentId: string, record: ReadingRecord) => void;
  onDeleteRecord: (num: string) => void;
  onSelectStudent: (student: Student) => void;
  onRegisterStudent: (newStudent: Student) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  record,
  activeStudent,
  students,
  onClose,
  onSaveRecordForStudent,
  onDeleteRecord,
  onSelectStudent,
  onRegisterStudent,
}) => {
  if (!book) return null;

  // Student info state (for when no student is logged in, or changing student)
  const [studentName, setStudentName] = useState<string>(activeStudent?.name || '');
  const [studentGrade, setStudentGrade] = useState<string>(activeStudent?.grade || '3학년');
  const [studentClass, setStudentClass] = useState<string>(activeStudent?.className || '1반');
  const [studentNumber, setStudentNumber] = useState<string>(activeStudent?.studentNumber || '1번');

  // Record Form state
  const [status, setStatus] = useState<ReadingStatus>(record?.status || 'COMPLETED');
  const [rating, setRating] = useState<number>(record?.rating || 5);
  const [completedDate, setCompletedDate] = useState<string>(
    record?.completedDate || new Date().toISOString().split('T')[0]
  );
  const [review, setReview] = useState<string>(record?.review || '');
  const [quote, setQuote] = useState<string>(record?.quote || '');

  useEffect(() => {
    if (activeStudent) {
      setStudentName(activeStudent.name);
      setStudentGrade(activeStudent.grade || '3학년');
      setStudentClass(activeStudent.className || '1반');
      setStudentNumber(activeStudent.studentNumber || '1번');

      // Check if student has record for this book
      const existingRec = activeStudent.records?.[book.num];
      if (existingRec) {
        setStatus(existingRec.status);
        setRating(existingRec.rating || 5);
        setCompletedDate(existingRec.completedDate || new Date().toISOString().split('T')[0]);
        setReview(existingRec.review || '');
        setQuote(existingRec.quote || '');
      } else {
        setStatus('COMPLETED');
        setRating(5);
        setCompletedDate(new Date().toISOString().split('T')[0]);
        setReview('');
        setQuote('');
      }
    } else {
      setStudentName('');
      setStatus('COMPLETED');
      setRating(5);
      setCompletedDate(new Date().toISOString().split('T')[0]);
      setReview('');
      setQuote('');
    }
  }, [book, activeStudent]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = studentName.trim();
    if (!trimmedName) {
      alert('독서 기록을 저장할 학생 이름을 입력해주세요.');
      return;
    }

    const normNumber = studentNumber.includes('번') ? studentNumber : `${studentNumber}번`;

    // Resolve or register student
    let targetStudent = students.find(
      (s) => s.name === trimmedName && s.grade === studentGrade && s.className === studentClass
    );

    if (!targetStudent) {
      targetStudent = students.find((s) => s.name === trimmedName);
    }

    let targetStudentId = targetStudent ? targetStudent.id : '';

    const updatedRecord: ReadingRecord = {
      num: book.num,
      status,
      rating: rating > 0 ? rating : undefined,
      completedDate: status === 'COMPLETED' ? completedDate : undefined,
      review: review.trim() || undefined,
      quote: quote.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (!targetStudent) {
      const newId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(-4)}`;
      const newSt: Student = {
        id: newId,
        grade: studentGrade,
        className: studentClass,
        studentNumber: normNumber,
        name: trimmedName,
        records: {
          [book.num]: updatedRecord,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onRegisterStudent(newSt);
      targetStudentId = newId;
    } else {
      // Update existing student with possibly updated number
      const updatedExisting: Student = {
        ...targetStudent,
        grade: studentGrade,
        className: studentClass,
        studentNumber: normNumber || targetStudent.studentNumber,
      };
      onSelectStudent(updatedExisting);
      targetStudentId = targetStudent.id;
      onSaveRecordForStudent(targetStudentId, updatedRecord);
    }

    onClose();
  };

  const handleQuickStatusChange = (newStatus: ReadingStatus) => {
    setStatus(newStatus);
    if (newStatus === 'COMPLETED' && !completedDate) {
      setCompletedDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in notranslate" translate="no">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-indigo-950 shadow-xs">
              No.{book.num}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {book.grade}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
            {book.title}
          </h2>
          <p className="text-xs text-indigo-200 mt-1 font-medium">
            {book.author} {book.publisher && `· ${book.publisher}`}
          </p>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Step 1: Student Selector / Name Input */}
          <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>독서 기록 학생 (학년 / 반 / 번호 / 이름)</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                {activeStudent ? `현재: ${activeStudent.name}` : '직접 입력 시 자동 저장'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">학년</label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 shadow-2xs"
                >
                  {['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">반</label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="1반"
                  className="w-full px-2 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">번호</label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="1번"
                  className="w-full px-2 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">이름 (필수)</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="이름 입력"
                  className="w-full px-2.5 py-2 bg-white border-2 border-indigo-300 focus:border-indigo-600 rounded-xl text-xs font-black text-slate-900 placeholder:text-slate-400 focus:outline-hidden shadow-2xs"
                />
              </div>
            </div>

            <p className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 shrink-0 text-amber-500" />
              <span>사전 명단이 없어도 이름과 학년·반·번호를 넣고 저장하면 바로 기록 및 구글 시트에 자동 저장됩니다.</span>
            </p>
          </div>

          {/* Step 2: Status Selection */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              1. 독서 상태
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickStatusChange('UNREAD')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'UNREAD'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                읽기 전
              </button>

              <button
                type="button"
                onClick={() => handleQuickStatusChange('IN_PROGRESS')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'IN_PROGRESS'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                읽는 중
              </button>

              <button
                type="button"
                onClick={() => handleQuickStatusChange('COMPLETED')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'COMPLETED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                완독 완료
              </button>
            </div>
          </div>

          {/* Step 3: Star Rating */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-700">
                2. 도서 평점 (1~5점) <span className="text-amber-500 font-bold">* 순위에 실시간 반영</span>
              </label>
              <span className="text-xs font-black text-amber-600">
                {rating > 0 ? `${rating}점 / 5점` : '평점 미선택'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 stroke-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Completion Date (if completed) */}
          {status === 'COMPLETED' && (
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> 3. 완독한 날짜
              </label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          )}

          {/* Step 5: Review / Impression */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>4. 한 줄 소감 (느낀 점)</span>
            </label>
            <textarea
              rows={2}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="이 책을 읽고 느낀 점이나 재미있었던 점을 자유롭게 적어보세요..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Step 6: Memorable Quote (Optional) */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>5. 기억에 남는 문장 / 인상 깊은 한 줄 (선택)</span>
            </label>
            <input
              type="text"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="책 속의 멋진 문장이나 인상 깊었던 대사를 적어보세요"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {record && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('이 도서의 기록을 초기화하시겠습니까?')) {
                    onDeleteRecord(book.num);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> 기록 초기화
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-200 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" /> 기록 & 평점 저장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
