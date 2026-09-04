import React, { useState, useEffect } from 'react';
import { Book, ReadingRecord, Student } from '../types';
import {
  X,
  Star,
  Save,
  Trash2,
  User,
  Sparkles,
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

  // Student info state
  const [studentName, setStudentName] = useState<string>(activeStudent?.name || '');
  const [studentGrade, setStudentGrade] = useState<string>(activeStudent?.grade || '3학년');
  const [studentClass, setStudentClass] = useState<string>(activeStudent?.className || '1반');
  const [studentNumber, setStudentNumber] = useState<string>(activeStudent?.studentNumber || '1번');

  // Star rating & One-line reading record
  const [rating, setRating] = useState<number>(record?.rating || 5);
  const [review, setReview] = useState<string>(record?.review || '');

  useEffect(() => {
    if (activeStudent) {
      setStudentName(activeStudent.name);
      setStudentGrade(activeStudent.grade || '3학년');
      setStudentClass(activeStudent.className || '1반');
      setStudentNumber(activeStudent.studentNumber || '1번');

      const existingRec = activeStudent.records?.[book.num];
      if (existingRec) {
        setRating(existingRec.rating || 5);
        setReview(existingRec.review || '');
      } else {
        setRating(5);
        setReview('');
      }
    } else {
      setStudentName('');
      setRating(5);
      setReview('');
    }
  }, [book, activeStudent]);

  // Star rating descriptive hints
  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5:
        return '5점 - 정말 최고예요! 강력 추천 ⭐⭐⭐⭐⭐';
      case 4:
        return '4점 - 재미있고 유익했어요! ⭐⭐⭐⭐';
      case 3:
        return '3점 - 보통이었어요. ⭐⭐⭐';
      case 2:
        return '2점 - 조금 아쉬웠어요. ⭐⭐';
      case 1:
        return '1점 - 나에겐 조금 어려웠어요. ⭐';
      default:
        return '별점을 선택해주세요';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = studentName.trim();
    if (!trimmedName) {
      alert('독서 기록을 저장할 학생 이름을 입력해주세요.');
      return;
    }

    const normNumber = studentNumber ? (studentNumber.includes('번') ? studentNumber : `${studentNumber}번`) : '1번';
    const normClass = studentClass ? (studentClass.includes('반') ? studentClass : `${studentClass}반`) : '1반';

    // Find or create student
    let targetStudent = students.find(
      (s) => s.name === trimmedName && s.grade === studentGrade && s.className === normClass
    ) || students.find((s) => s.name === trimmedName);

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];

    const updatedRecord: ReadingRecord = {
      num: book.num,
      status: 'COMPLETED',
      rating: rating > 0 ? rating : 5,
      completedDate: todayDate,
      review: review.trim() || undefined,
      updatedAt: nowIso,
    };

    if (!targetStudent) {
      const newId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(-4)}`;
      const newSt: Student = {
        id: newId,
        grade: studentGrade,
        className: normClass,
        studentNumber: normNumber,
        name: trimmedName,
        records: {
          [book.num]: updatedRecord,
        },
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      onRegisterStudent(newSt);
    } else {
      const updatedExisting: Student = {
        ...targetStudent,
        grade: studentGrade,
        className: normClass,
        studentNumber: normNumber || targetStudent.studentNumber,
      };
      onSelectStudent(updatedExisting);
      onSaveRecordForStudent(targetStudent.id, updatedRecord);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in notranslate" translate="no">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Book Info */}
        <div className="p-5 md:p-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white relative">
          <button
            type="button"
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

        {/* Modal Form: Focused strictly on Rating & One-line record */}
        <form onSubmit={handleSave} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Student Info Identifier - Hidden when already logged in as a student */}
          {!activeStudent && (
            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>독서 기록 학생 (학년 · 반 · 번호 · 이름)</span>
                </label>
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
            </div>
          )}

          {/* 1. Star Rating (별점) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>도서 별점 남기기 (1~5점)</span>
              </label>
              <span className="text-xs font-black text-amber-600">
                {rating}점 / 5점
              </span>
            </div>

            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer focus:outline-hidden"
                    title={`${star}점 선택`}
                  >
                    <Star
                      className={`w-9 h-9 ${
                        star <= rating ? 'fill-amber-400 text-amber-400 drop-shadow-xs' : 'text-slate-200 stroke-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-amber-800">
                {getRatingLabel(rating)}
              </p>
            </div>
          </div>

          {/* 2. One-line Reading Record (한줄 독서기록) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>한줄 독서기록</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {review.length}/100자
              </span>
            </label>
            <textarea
              rows={3}
              maxLength={100}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="책을 읽고 난 후의 생각이나 가장 기억에 남는 장면을 한 줄로 적어보세요..."
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl text-xs font-medium text-slate-800 focus:outline-hidden resize-none placeholder:text-slate-400 shadow-inner leading-relaxed transition-all"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              💡 별점과 한줄 소감은 실시간 클라우드 및 구글 시트에 안전하게 자동 저장됩니다.
            </p>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {record ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`'${book.title}' 도서의 기록을 초기화하시겠습니까?`)) {
                    onDeleteRecord(book.num);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> 기록 삭제
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:from-amber-600 text-indigo-950 text-xs font-black rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>독서기록 저장하기</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
