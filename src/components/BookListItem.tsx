import React from 'react';
import { Book, ReadingRecord } from '../types';
import { Check, Clock, BookOpen, Star, FileText } from 'lucide-react';

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
      className={`group bg-white rounded-xl p-3 md:p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/20'
          : isInProgress
          ? 'border-amber-200 bg-amber-50/20'
          : 'border-slate-200/70 hover:border-indigo-200 hover:shadow-xs'
      }`}
    >
      {/* Left Info */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
          #{book.num}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onOpenDetail(book)}
              className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 cursor-pointer truncate"
              title={book.title}
            >
              {book.title}
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {book.grade}
            </span>
          </div>

          <p className="text-xs text-slate-500 truncate mt-0.5">
            {book.author} {book.publisher && `· ${book.publisher}`}
          </p>
        </div>
      </div>

      {/* Rating if present */}
      {record?.rating && (
        <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= (record.rating || 0) ? 'fill-amber-400' : 'text-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        <button
          onClick={() => onToggleComplete(book.num)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
            isCompleted
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : isInProgress
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-3.5 h-3.5" /> 완독
            </>
          ) : isInProgress ? (
            <>
              <Clock className="w-3.5 h-3.5" /> 읽는 중
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> 체크
            </>
          )}
        </button>

        <button
          onClick={() => onOpenDetail(book)}
          title="독서록 작성"
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200/80 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
