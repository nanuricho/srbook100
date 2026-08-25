export interface Book {
  num: string; // Book number e.g. "1", "2"
  title: string;
  author: string;
  publisher: string;
  grade: string; // e.g. "1학년", "2학년", "전학년"
}

export type ReadingStatus = 'UNREAD' | 'IN_PROGRESS' | 'COMPLETED';

export interface ReadingRecord {
  num: string; // references Book.num
  status: ReadingStatus;
  rating?: number; // 1-5 stars
  completedDate?: string; // YYYY-MM-DD
  review?: string; // 한 줄 소감
  quote?: string; // 명대사 / 기억에 남는 문장
  updatedAt?: string;
}

export interface Student {
  id: string; // unique ID e.g. "s_3_1_1_김민준"
  grade: string; // e.g. "3학년"
  className: string; // e.g. "1반"
  studentNumber?: string; // e.g. "1번"
  name: string; // e.g. "김민준"
  records: Record<string, ReadingRecord>;
  createdAt?: string;
  updatedAt?: string;
}

export type AppTab = 'BOOKS' | 'STUDENT_LOOKUP' | 'TEACHER_DASHBOARD';

export type GradeFilter = 'ALL' | '1학년' | '2학년' | '3학년' | '4학년' | '5학년' | '6학년' | '공통/기타';

export type StatusFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'UNREAD';

export type SortOption = 'NUM_ASC' | 'NUM_DESC' | 'TITLE_ASC' | 'GRADE_ASC' | 'RATING_DESC' | 'DATE_DESC';

export type ViewLayout = 'GRID' | 'LIST';

export interface Badge {
  id: string;
  title: string;
  description: string;
  requiredCount: number;
  icon: string;
  color: string;
}

