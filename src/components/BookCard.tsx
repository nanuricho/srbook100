import React from 'react';
import { Book, ReadingRecord } from '../types';
import { Check, Clock, BookOpen, Star, FileText, Edit3 } from 'lucide-react';

interface BookCardProps {
  book: Book;
  record?: ReadingRecord;
  onToggleComplete: (num: string) => void;
  onOpenDetail: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  record,
  onToggleComplete,
  onOpenDetail,
}) => {
  const status = record?.status || 'UNREAD';
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';

  // Grade badge styling
  const getGradeBadgeClass = (grade: string) => {
    if (grade.includes('1') || grade.includes('2')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (grade.includes('3') || grade.includes('4')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (grade.includes('5') || grade.includes('6')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div
      className={`group relative bg-white rounded-3xl p-5 border-2 transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5 notranslate ${
        isCompleted
          ? 'border-emerald-500 bg-emerald-50/30 shadow-xs'
          : isInProgress
          ? 'border-amber-400 bg-amber-50/20 shadow-xs'
          : 'border-slate-200 hover:border-indigo-400 hover:shadow-vibrant'
      }`}
      translate="no"
    >
      <div>
        {/* Top Header: Book No. & Grade Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-black text-slate-400 tracking-wider">
            No. {book.num}
          </span>
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getGradeBadgeClass(
              book.grade
            )}`}
          >
            {book.grade}
          </span>
        </div>

        {/* Book Title */}
        <h3
          onClick={() => onOpenDetail(book)}
          className="text-base font-black text-indigo-950 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer mb-1.5 leading-snug"
          title={`${book.title} (클릭하여 독서기록 작성)`}
        >
          {book.title}
        </h3>

        {/* Author & Publisher */}
        <p className="text-xs text-slate-500 mb-3.5 line-clamp-1 font-medium">
          <span className="text-slate-700 font-bold">{book.author}</span>
          {book.publisher && <span className="text-slate-400"> · {book.publisher}</span>}
        </p>

        {/* Rating or Review Snippet (if recorded) */}
        {(record?.rating || record?.review) && (
          <div className="mb-3.5 p-2.5 bg-slate-50 rounded-2xl text-xs border border-slate-100/90 space-y-1">
            {record.rating && (
              <div className="flex items-center gap-1">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= (record.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-black text-amber-700 ml-1">{record.rating}점</span>
              </div>
            )}
            {record.review && (
              <p className="text-slate-600 italic line-clamp-1">"{record.review}"</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Toggle Status Button */}
        <button
          type="button"
          onClick={() => onToggleComplete(book.num)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            isCompleted
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
              : isInProgress
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>완독 완료</span>
            </>
          ) : isInProgress ? (
            <>
              <Clock className="w-4 h-4" />
              <span>읽는 중</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>완독 체크</span>
            </>
          )}
        </button>

        {/* Open Reading Log & Rating Modal Button */}
        <button
          type="button"
          onClick={() => onOpenDetail(book)}
          title="독서기록 및 평점 작성"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-2xl text-xs font-bold transition-all cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>독서기록</span>
        </button>
      </div>
    </div>
  );
};
