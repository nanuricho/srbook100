import React, { useState, useEffect } from 'react';
import { Book, ReadingRecord, ReadingStatus } from '../types';
import { X, Star, Calendar, CheckCircle2, Clock, BookOpen, Save, Trash2 } from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  record?: ReadingRecord;
  onClose: () => void;
  onSaveRecord: (record: ReadingRecord) => void;
  onDeleteRecord: (num: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  record,
  onClose,
  onSaveRecord,
  onDeleteRecord,
}) => {
  if (!book) return null;

  const [status, setStatus] = useState<ReadingStatus>(record?.status || 'UNREAD');
  const [rating, setRating] = useState<number>(record?.rating || 0);
  const [completedDate, setCompletedDate] = useState<string>(
    record?.completedDate || new Date().toISOString().split('T')[0]
  );
  const [review, setReview] = useState<string>(record?.review || '');

  useEffect(() => {
    if (record) {
      setStatus(record.status);
      setRating(record.rating || 0);
      setCompletedDate(record.completedDate || new Date().toISOString().split('T')[0]);
      setReview(record.review || '');
    } else {
      setStatus('UNREAD');
      setRating(0);
      setCompletedDate(new Date().toISOString().split('T')[0]);
      setReview('');
    }
  }, [book, record]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRecord: ReadingRecord = {
      num: book.num,
      status,
      rating: rating > 0 ? rating : undefined,
      completedDate: status === 'COMPLETED' ? completedDate : undefined,
      review: review.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    onSaveRecord(updatedRecord);
    onClose();
  };

  const handleQuickStatusChange = (newStatus: ReadingStatus) => {
    setStatus(newStatus);
    if (newStatus === 'COMPLETED' && !completedDate) {
      setCompletedDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {book.grade}
            </span>
            <span className="text-xs font-medium text-slate-300">
              도서 번호 #{book.num}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
            {book.title}
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            {book.author} · {book.publisher}
          </p>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              독서 상태
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickStatusChange('UNREAD')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              도서 평점 (1~5점)
            </label>
            <div className="flex items-center gap-1 bg-amber-50/50 p-3 rounded-xl border border-amber-100/80">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-amber-800">
                {rating > 0 ? `${rating}점` : '평점 선택 안함'}
              </span>
            </div>
          </div>

          {/* Completion Date */}
          {status === 'COMPLETED' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> 완독한 날짜
              </label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          )}

          {/* Review / Impression */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              한 줄 소감 / 느낀 점
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="이 책을 읽고 느낀 한 줄 소감을 자유롭게 적어보세요..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-indigo-500 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Submit & Reset buttons */}
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
                <Trash2 className="w-3.5 h-3.5" /> 기록 삭제
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
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" /> 기록 저장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
