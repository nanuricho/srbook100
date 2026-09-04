import React from 'react';
import { BookRatingStat } from '../utils/rankingUtils';
import { X, Star, BookOpen, MessageSquare, Users, CheckCircle2 } from 'lucide-react';

interface BookReviewsModalProps {
  stat: BookRatingStat | null;
  onClose: () => void;
}

export const BookReviewsModal: React.FC<BookReviewsModalProps> = ({ stat, onClose }) => {
  if (!stat) return null;

  const { book, averageRating, ratingCount, completedCount, allReviews } = stat;
  const reviews = allReviews || [];

  return (
    <div
      id="book-reviews-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="book-reviews-modal-content"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-5 text-white flex items-start justify-between relative">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-indigo-950 font-black text-xs">
                No.{book.num}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white font-bold text-xs">
                {book.grade} 권장
              </span>
            </div>
            <h3 className="text-lg font-black text-white leading-snug">
              {book.title}
            </h3>
            <p className="text-xs text-indigo-200 font-medium">
              {book.author} · {book.publisher}
            </p>
          </div>

          <button
            type="button"
            id="btn-close-reviews-modal"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer shrink-0"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rating Summary Bar */}
        <div className="bg-amber-50/80 border-b border-amber-100 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400 text-indigo-950 font-black text-lg shadow-sm">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating > 0 ? averageRating : 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-black text-slate-800 ml-1">
                  {averageRating > 0 ? `${averageRating}점` : '5.0점 (추천)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                서룡초 독서기록 종합 평점
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right text-xs">
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-xl font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>완독 {completedCount}명</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-xl font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>평점 {ratingCount}명</span>
            </div>
          </div>
        </div>

        {/* Reviews List (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>친구들이 남긴 한줄평</span>
              <span className="text-amber-600 font-bold">({reviews.length})</span>
            </span>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-2.5">
              {reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300/80 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {rev.studentName}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {rev.studentGrade}
                      </span>
                    </div>

                    {rev.rating && rev.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating!
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-black text-amber-600 ml-1">
                          {rev.rating}점
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                    "{rev.review}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                아직 등록된 한줄평이 없습니다
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                책을 완독한 후 도서 카드에서 별점과 첫 한줄평을 남겨보세요!
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
