import React from 'react';
import { Book, ReadingRecord } from '../types';
import { Check, Clock, BookOpen, Star, Edit3 } from 'lucide-react';

interface BookListItemProps {
  book: Book;
  record?: ReadingRecord;
  onToggleComplete: (num: string) => void;
  onOpenDetail: (book: Book) => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  book,
  record,
  onToggleComplete,
  onOpenDetail,
}) => {
  const status = record?.status || 'UNREAD';
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';

  return (
    <div
      className={`group bg-white rounded-2xl p-3.5 md:p-4 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 notranslate ${
        isCompleted
          ? 'border-emerald-300 bg-emerald-50/25 shadow-2xs'
          : isInProgress
          ? 'border-amber-300 bg-amber-50/20 shadow-2xs'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-xs'
      }`}
      translate="no"
    >
      {/* Left Info */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
          #{book.num}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onOpenDetail(book)}
              className="font-black text-sm text-slate-900 group-hover:text-indigo-600 cursor-pointer truncate"
              title={`${book.title} (클릭하여 독서기록 작성)`}
            >
              {book.title}
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {book.grade}
            </span>
          </div>

          <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
            <span className="text-slate-700 font-semibold">{book.author}</span>
            {book.publisher && <span className="text-slate-400"> · {book.publisher}</span>}
          </p>
        </div>
      </div>

      {/* Rating if present */}
      {record?.rating && (
        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-800">{record.rating}점</span>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        <button
          type="button"
          onClick={() => onToggleComplete(book.num)}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all inline-flex items-center gap-1.5 cursor-pointer ${
            isCompleted
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
              : isInProgress
              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-3.5 h-3.5" /> 완독 완료
            </>
          ) : isInProgress ? (
            <>
              <Clock className="w-3.5 h-3.5" /> 읽는 중
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> 완독 체크
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onOpenDetail(book)}
          title="독서기록 및 평점 작성"
          className="px-3 py-2 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 text-xs font-black inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>기록</span>
        </button>
      </div>
    </div>
  );
};
