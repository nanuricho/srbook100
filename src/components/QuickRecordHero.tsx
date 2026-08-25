import React, { useState, useMemo } from 'react';
import { Book, Student, ReadingRecord } from '../types';
import {
  Sparkles,
  BookOpen,
  Star,
  Quote,
  CheckCircle2,
  Clock,
  User,
  PlusCircle,
  Save,
  Search,
  Check,
  ChevronDown,
} from 'lucide-react';

interface QuickRecordHeroProps {
  books: Book[];
  students: Student[];
  activeStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onRegisterStudent: (newStudent: Student) => void;
  onSaveRecord: (studentId: string, record: ReadingRecord) => void;
}

export function QuickRecordHero({
  books,
  students,
  activeStudent,
  onSelectStudent,
  onRegisterStudent,
  onSaveRecord,
}: QuickRecordHeroProps) {
  // Mode: existing student selection vs. new student name input
  const [studentInputName, setStudentInputName] = useState<string>(activeStudent?.name || '');
  const [studentGrade, setStudentGrade] = useState<string>(activeStudent?.grade || '3학년');
  const [studentClass, setStudentClass] = useState<string>(activeStudent?.className || '1반');
  const [studentNumber, setStudentNumber] = useState<string>(activeStudent?.studentNumber || '1번');

  // Book Selection state
  const [selectedBookNum, setSelectedBookNum] = useState<string>('1');
  const [bookSearchQuery, setBookSearchQuery] = useState<string>('');
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState<boolean>(false);

  // Review Form state
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<'COMPLETED' | 'IN_PROGRESS'>('COMPLETED');
  const [review, setReview] = useState<string>('');
  const [quote, setQuote] = useState<string>('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Sync with active student when it changes
  React.useEffect(() => {
    if (activeStudent) {
      setStudentInputName(activeStudent.name);
      setStudentGrade(activeStudent.grade || '3학년');
      setStudentClass(activeStudent.className || '1반');
      setStudentNumber(activeStudent.studentNumber || '1번');
    }
  }, [activeStudent]);

  // Selected book object
  const currentSelectedBook = useMemo(() => {
    return books.find((b) => b.num === selectedBookNum) || books[0] || null;
  }, [books, selectedBookNum]);

  // If active student has record for this book, pre-fill review & rating
  React.useEffect(() => {
    if (activeStudent && activeStudent.records && activeStudent.records[selectedBookNum]) {
      const rec = activeStudent.records[selectedBookNum];
      setRating(rec.rating || 5);
      setReview(rec.review || '');
      setQuote(rec.quote || '');
      setStatus(rec.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'COMPLETED');
    } else {
      setRating(5);
      setReview('');
      setQuote('');
      setStatus('COMPLETED');
    }
  }, [activeStudent, selectedBookNum]);

  // Search filtered books
  const filteredBooks = useMemo(() => {
    const q = bookSearchQuery.trim().toLowerCase();
    if (!q) return books.slice(0, 30);
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.num.includes(q) ||
        b.grade.toLowerCase().includes(q)
    );
  }, [books, bookSearchQuery]);

  // Handle Record Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = studentInputName.trim();
    if (!trimmedName) {
      alert('학생 이름을 입력해주세요.');
      return;
    }
    if (!currentSelectedBook) {
      alert('기록할 책을 선택해주세요.');
      return;
    }

    // Check if student already exists in list or needs to be registered
    let targetStudent = students.find(
      (s) => s.name === trimmedName && s.grade === studentGrade && s.className === studentClass
    );

    if (!targetStudent) {
      // Find by name only fallback
      targetStudent = students.find((s) => s.name === trimmedName);
    }

    let targetStudentId = targetStudent ? targetStudent.id : '';

    if (!targetStudent) {
      const newId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(-4)}`;
      const newSt: Student = {
        id: newId,
        grade: studentGrade,
        className: studentClass,
        studentNumber: studentNumber,
        name: trimmedName,
        records: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onRegisterStudent(newSt);
      targetStudentId = newId;
    } else {
      onSelectStudent(targetStudent);
      targetStudentId = targetStudent.id;
    }

    const recordToSave: ReadingRecord = {
      num: currentSelectedBook.num,
      status: status,
      rating: rating,
      review: review.trim() || undefined,
      quote: quote.trim() || undefined,
      completedDate: status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveRecord(targetStudentId, recordToSave);
    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
    }, 2500);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-5 md:p-7 shadow-vibrant mb-7 relative overflow-hidden notranslate" translate="no">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-700/60 pb-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black mb-1.5 border border-amber-300/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>실시간 독서 감상평 간편 기록</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              📝 내 이름으로 독서 감상평 & 별점 남기기
            </h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              이름과 학급을 입력하고 읽은 책의 평점과 느낀 점을 기록해보세요! 교사용 시트로 자동 수합됩니다.
            </p>
          </div>

          {activeStudent && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 text-xs">
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-indigo-200 font-medium">현재 접속 학생:</span>
              <span className="font-black text-amber-300">
                {activeStudent.grade} {activeStudent.className} {activeStudent.name}
              </span>
            </div>
          )}
        </div>

        {/* Recording Form Grid */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Step 1: Student Profile (4 cols) */}
            <div className="md:col-span-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> 1. 학생 정보 입력
                </span>
                {students.length > 0 && (
                  <select
                    onChange={(e) => {
                      const st = students.find((s) => s.id === e.target.value);
                      if (st) {
                        onSelectStudent(st);
                        setStudentInputName(st.name);
                        setStudentGrade(st.grade || '3학년');
                        setStudentClass(st.className || '1반');
                        setStudentNumber(st.studentNumber || '1번');
                      }
                    }}
                    value={activeStudent?.id || ''}
                    className="text-[11px] bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 rounded-lg px-2 py-0.5 font-bold cursor-pointer"
                  >
                    <option value="">명단에서 선택</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.grade} {st.className} {st.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-indigo-200 font-bold mb-1">학년</label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full px-2 py-1.5 bg-indigo-950/90 border border-indigo-400/40 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
                  >
                    {['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-indigo-200 font-bold mb-1">반</label>
                  <input
                    type="text"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="1반"
                    className="w-full px-2 py-1.5 bg-indigo-950/90 border border-indigo-400/40 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-indigo-200 font-bold mb-1">번호</label>
                  <input
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="1번"
                    className="w-full px-2 py-1.5 bg-indigo-950/90 border border-indigo-400/40 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-indigo-200 font-black mb-1">
                  학생 이름 <span className="text-amber-300">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentInputName}
                  onChange={(e) => setStudentInputName(e.target.value)}
                  placeholder="예: 김민준"
                  className="w-full px-3 py-2 bg-indigo-950/90 border border-indigo-400/50 rounded-xl text-sm font-black text-white placeholder:text-indigo-400/70 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Status Picker: Completed vs Reading */}
              <div>
                <label className="block text-[10px] text-indigo-200 font-bold mb-1">독서 상태</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('COMPLETED')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                      status === 'COMPLETED'
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                        : 'bg-indigo-950/50 text-indigo-200 border-indigo-700/50 hover:bg-indigo-900/50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> 완독 완료
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('IN_PROGRESS')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                      status === 'IN_PROGRESS'
                        ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
                        : 'bg-indigo-950/50 text-indigo-200 border-indigo-700/50 hover:bg-indigo-900/50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> 읽는 중
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Book Selection & Rating (8 cols) */}
            <div className="md:col-span-8 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> 2. 도서 선택 & 별점 평가
                  </span>
                  {currentSelectedBook && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-lg border border-amber-300/30">
                      No.{currentSelectedBook.num} · {currentSelectedBook.grade}
                    </span>
                  )}
                </div>

                {/* Book Select Search / Dropdown */}
                <div className="relative">
                  <div
                    onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
                    className="w-full px-3 py-2 bg-indigo-950/90 border border-indigo-400/50 rounded-xl text-xs font-bold text-white flex items-center justify-between cursor-pointer hover:border-amber-400"
                  >
                    <span className="truncate">
                      {currentSelectedBook
                        ? `[No.${currentSelectedBook.num}] ${currentSelectedBook.title} (${currentSelectedBook.author})`
                        : '도서를 선택하세요'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-indigo-300 shrink-0 ml-1" />
                  </div>

                  {isBookDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-indigo-500/50 rounded-xl shadow-2xl p-2 z-50 max-h-56 overflow-y-auto">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={bookSearchQuery}
                          onChange={(e) => setBookSearchQuery(e.target.value)}
                          placeholder="도서명 또는 번호 검색..."
                          className="w-full pl-8 pr-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-400 focus:outline-hidden"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="space-y-0.5">
                        {filteredBooks.map((b) => (
                          <div
                            key={b.num}
                            onClick={() => {
                              setSelectedBookNum(b.num);
                              setIsBookDropdownOpen(false);
                            }}
                            className={`p-2 rounded-lg text-xs font-bold flex items-center justify-between cursor-pointer hover:bg-indigo-600/50 transition-colors ${
                              selectedBookNum === b.num ? 'bg-indigo-600 text-white' : 'text-slate-200'
                            }`}
                          >
                            <span className="truncate">
                              <span className="text-amber-300 mr-1.5 font-mono">#{b.num}</span>
                              {b.title}
                            </span>
                            <span className="text-[10px] text-indigo-200 ml-2 shrink-0">{b.grade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Bar */}
                <div className="mt-3 flex items-center justify-between bg-indigo-950/70 p-2.5 rounded-xl border border-indigo-800/60">
                  <span className="text-xs font-extrabold text-indigo-200">별점 평가</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className="w-5 h-5"
                          fill={star <= rating ? 'currentColor' : 'none'}
                          stroke={star <= rating ? 'none' : 'currentColor'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-amber-300 ml-1.5">{rating}점 / 5점</span>
                  </div>
                </div>
              </div>

              {/* Review & Quote inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-indigo-200 font-bold mb-1 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-300" /> 기억에 남는 한 줄 / 인상 깊은 문장
                  </label>
                  <input
                    type="text"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="인상 깊었던 문장이나 구절을 적어보세요..."
                    className="w-full px-3 py-1.5 bg-indigo-950/90 border border-indigo-400/40 rounded-xl text-xs text-white placeholder:text-indigo-400/60 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-indigo-200 font-bold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> 간단 감상평 (느낀 점)
                  </label>
                  <input
                    type="text"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="이 책을 읽고 든 생각이나 느낌을 간단히 적어보세요..."
                    className="w-full px-3 py-1.5 bg-indigo-950/90 border border-indigo-400/40 rounded-xl text-xs text-white placeholder:text-indigo-400/60 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Submit Button & Status Message */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  {isSubmittedSuccess ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      감상평과 평점이 성공적으로 저장되었습니다! 🎉
                    </span>
                  ) : (
                    <span className="text-[11px] text-indigo-300 font-medium">
                      💡 기록된 내용은 즉시 통계와 교사 대시보드 시트에 반영됩니다.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-indigo-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-400/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>감상 기록 등록하기</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
