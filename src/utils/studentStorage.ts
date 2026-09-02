import { Book, Student, ReadingRecord } from '../types';
import { getCurrentBadge } from './badges';

export const STORAGE_KEY_STUDENTS = 'seoryong_students_v2';
export const STORAGE_KEY_CURRENT_STUDENT_ID = 'seoryong_current_student_id_v2';

export const SAMPLE_STUDENTS: Student[] = [
  {
    id: 's_3_1_1_김민준',
    grade: '3학년',
    className: '1반',
    studentNumber: '1번',
    name: '김민준',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-10', review: '강아지 똥이 민들레를 피우는 모습이 정말 감동적이었어요.', quote: '나도 누군가에게 꼭 필요한 존재가 될 수 있겠지?' },
      '2': { num: '2', status: 'COMPLETED', rating: 5, completedDate: '2026-03-15', review: '반짝이 비늘을 나누어 주며 친구를 얻는 지혜를 배웠어요.' },
      '4': { num: '4', status: 'COMPLETED', rating: 4, completedDate: '2026-03-20', review: '존의 상상력과 선생님의 오해가 재미있었어요.' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-28', review: '사탕을 먹고 마음의 소리를 듣는 장면이 따뜻했습니다.' },
      '17': { num: '17', status: 'COMPLETED', rating: 5, completedDate: '2026-04-05', review: '잎싹이의 헌신적인 사랑이 눈물겨웠습니다.' },
      '25': { num: '25', status: 'COMPLETED', rating: 4, completedDate: '2026-04-12', review: '소금과 후추를 뿌려 책을 먹는 여우가 귀여웠어요.' },
      '33': { num: '33', status: 'COMPLETED', rating: 5, completedDate: '2026-04-20', review: '내 마음의 감정들을 단어로 표현하는 법을 알게 되었어요.' },
      '34': { num: '34', status: 'COMPLETED', rating: 5, completedDate: '2026-05-01', review: '와니니가 어려움을 딛고 성장하는 모험이 흥미진진했습니다.' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-05-15', review: '달콤한 떡을 먹고 착한 말을 하게 되는 만복이가 멋졌어요.' },
      '42': { num: '42', status: 'COMPLETED', rating: 5, completedDate: '2026-05-25', review: '샬롯과 윌버의 진정한 우정이 마음에 남아요.' },
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-06-02', review: '가장 중요한 것은 눈에 보이지 않는다는 말이 깊게 와닿았습니다.', quote: '네가 길들인 것에 넌 영원히 책임이 있어.' },
      '50': { num: '50', status: 'IN_PROGRESS' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 's_3_1_2_이서아',
    grade: '3학년',
    className: '1반',
    studentNumber: '2번',
    name: '이서아',
    records: {
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-12', review: '동동이가 아빠의 사랑을 깨닫는 장면이 뭉클했어요.' },
      '11': { num: '11', status: 'COMPLETED', rating: 5, completedDate: '2026-03-19', review: '선녀님이 요구르트를 마시는 모습이 너무 유쾌했습니다.' },
      '13': { num: '13', status: 'COMPLETED', rating: 4, completedDate: '2026-04-02', review: '구름빵을 먹고 하늘을 날아 아빠에게 빵을 전해주는 이야기.' },
      '33': { num: '33', status: 'COMPLETED', rating: 5, completedDate: '2026-04-18', review: '친구들의 마음을 더 잘 이해할 수 있게 되었습니다.' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-05-08', review: '만복이의 입에서 예쁜 말만 나오게 되어 기뻤어요.' },
      '37': { num: '37', status: 'COMPLETED', rating: 4, completedDate: '2026-05-20', review: '장군이네 떡집도 만복이네만큼 재미있었어요.' },
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-06-05', review: '어린 왕자가 만난 장미와 여우 이야기가 생각나요.' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-05T12:00:00.000Z',
  },
  {
    id: 's_3_1_3_박도윤',
    grade: '3학년',
    className: '1반',
    studentNumber: '3번',
    name: '박도윤',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-08' },
      '8': { num: '8', status: 'COMPLETED', rating: 4, completedDate: '2026-03-22' },
      '18': { num: '18', status: 'COMPLETED', rating: 5, completedDate: '2026-04-10' },
      '20': { num: '20', status: 'COMPLETED', rating: 5, completedDate: '2026-05-02' },
      '35': { num: '35', status: 'IN_PROGRESS' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-02T09:00:00.000Z',
  },
  {
    id: 's_3_1_4_최지우',
    grade: '3학년',
    className: '1반',
    studentNumber: '4번',
    name: '최지우',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-05' },
      '2': { num: '2', status: 'COMPLETED', rating: 4, completedDate: '2026-03-15' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-25' },
      '6': { num: '6', status: 'COMPLETED', rating: 5, completedDate: '2026-04-01' },
      '11': { num: '11', status: 'COMPLETED', rating: 5, completedDate: '2026-04-15' },
      '17': { num: '17', status: 'COMPLETED', rating: 5, completedDate: '2026-04-28' },
      '25': { num: '25', status: 'COMPLETED', rating: 4, completedDate: '2026-05-10' },
      '33': { num: '33', status: 'COMPLETED', rating: 5, completedDate: '2026-05-18' },
      '34': { num: '34', status: 'COMPLETED', rating: 5, completedDate: '2026-05-28' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-06-01' },
      '36': { num: '36', status: 'COMPLETED', rating: 5, completedDate: '2026-06-05' },
      '38': { num: '38', status: 'COMPLETED', rating: 5, completedDate: '2026-06-10' },
      '42': { num: '42', status: 'COMPLETED', rating: 5, completedDate: '2026-06-12' },
      '43': { num: '43', status: 'COMPLETED', rating: 4, completedDate: '2026-06-15' },
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-06-18' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-18T14:00:00.000Z',
  },
  {
    id: 's_3_1_5_정예준',
    grade: '3학년',
    className: '1반',
    studentNumber: '5번',
    name: '정예준',
    records: {
      '3': { num: '3', status: 'COMPLETED', rating: 4, completedDate: '2026-03-11' },
      '25': { num: '25', status: 'COMPLETED', rating: 5, completedDate: '2026-04-05' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-05-02' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-02T11:00:00.000Z',
  },
  {
    id: 's_3_2_1_강하은',
    grade: '3학년',
    className: '2반',
    studentNumber: '1번',
    name: '강하은',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-04' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-14' },
      '11': { num: '11', status: 'COMPLETED', rating: 4, completedDate: '2026-03-24' },
      '17': { num: '17', status: 'COMPLETED', rating: 5, completedDate: '2026-04-11' },
      '33': { num: '33', status: 'COMPLETED', rating: 5, completedDate: '2026-04-25' },
      '34': { num: '34', status: 'COMPLETED', rating: 5, completedDate: '2026-05-12' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-05-22' },
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-06-03' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-03T15:00:00.000Z',
  },
  {
    id: 's_3_2_2_윤시우',
    grade: '3학년',
    className: '2반',
    studentNumber: '2번',
    name: '윤시우',
    records: {
      '4': { num: '4', status: 'COMPLETED', rating: 4, completedDate: '2026-03-10' },
      '18': { num: '18', status: 'COMPLETED', rating: 4, completedDate: '2026-03-20' },
      '25': { num: '25', status: 'COMPLETED', rating: 5, completedDate: '2026-04-15' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-04-15T10:00:00.000Z',
  }
];

export function loadStudentsFromStorage(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error reading students from storage', e);
    return [];
  }
}

export function saveStudentsToStorage(students: Student[]) {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students to storage', e);
  }
}

export function getCompletedCount(student: Student): number {
  return Object.values(student.records || {}).filter((r) => r.status === 'COMPLETED').length;
}

export function getInProgressCount(student: Student): number {
  return Object.values(student.records || {}).filter((r) => r.status === 'IN_PROGRESS').length;
}

export function getStudentProgressPercent(student: Student, totalBooks = 100): number {
  const completed = getCompletedCount(student);
  if (totalBooks <= 0) return 0;
  return Math.min(100, Math.round((completed / totalBooks) * 100));
}

export interface ParsedStudentRow {
  grade: string;
  className: string;
  studentNumber: string;
  name: string;
}

/**
 * Batch parser supporting:
 * 1. CSV / TSV format (학년, 반, 번호, 이름 or 3, 1, 1, 김민준)
 * 2. Space-separated text: "3학년 1반 1번 김민준" or "3-1 1 김민준"
 * 3. Comma/newline-separated name list with fallback grade/class
 */
export function parseBatchStudentInput(
  rawText: string,
  defaultGrade = '3학년',
  defaultClass = '1반'
): ParsedStudentRow[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: ParsedStudentRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip table header if present
    if (
      i === 0 &&
      (line.includes('학년') && line.includes('이름')) ||
      line.startsWith('grade,') ||
      line.startsWith('번호,이름')
    ) {
      continue;
    }

    // Check if line contains CSV/TSV separators
    if (line.includes(',') || line.includes('\t')) {
      const parts = line.split(/[,\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 4) {
        // [학년, 반, 번호, 이름]
        results.push({
          grade: normalizeGrade(parts[0], defaultGrade),
          className: normalizeClass(parts[1], defaultClass),
          studentNumber: normalizeNumber(parts[2], String(results.length + 1)),
          name: parts[3] || '이름 없음',
        });
        continue;
      } else if (parts.length === 3) {
        // [반, 번호, 이름] or [번호, 이름, ...]
        if (parts[0].includes('반') || parts[0].includes('학년') || /^\d+$/.test(parts[0])) {
          results.push({
            grade: defaultGrade,
            className: normalizeClass(parts[0], defaultClass),
            studentNumber: normalizeNumber(parts[1], String(results.length + 1)),
            name: parts[2],
          });
        } else {
          results.push({
            grade: defaultGrade,
            className: defaultClass,
            studentNumber: normalizeNumber(parts[0], String(results.length + 1)),
            name: parts[1],
          });
        }
        continue;
      } else if (parts.length === 2) {
        // [번호, 이름] or [반, 이름]
        if (/^\d+$/.test(parts[0])) {
          results.push({
            grade: defaultGrade,
            className: defaultClass,
            studentNumber: normalizeNumber(parts[0], String(results.length + 1)),
            name: parts[1],
          });
        } else {
          results.push({
            grade: defaultGrade,
            className: defaultClass,
            studentNumber: `${results.length + 1}번`,
            name: parts[1],
          });
        }
        continue;
      }
    }

    // Pattern matching for space separated formats:
    // e.g. "3-1 15 김민준", "3학년 1반 15번 김민준", "1반 김민준", "김민준"
    const dashMatch = line.match(/^(\d+)[-~](\d+)\s+(\d+)\s+(.+)$/);
    if (dashMatch) {
      results.push({
        grade: `${dashMatch[1]}학년`,
        className: `${dashMatch[2]}반`,
        studentNumber: `${dashMatch[3]}번`,
        name: dashMatch[4].trim(),
      });
      continue;
    }

    const fullMatch = line.match(/^(\d+)학년\s+(\d+)반\s+(\d+)번?\s+(.+)$/);
    if (fullMatch) {
      results.push({
        grade: `${fullMatch[1]}학년`,
        className: `${fullMatch[2]}반`,
        studentNumber: `${fullMatch[3]}번`,
        name: fullMatch[4].trim(),
      });
      continue;
    }

    const classNumMatch = line.match(/^(\d+)반\s+(\d+)번?\s+(.+)$/);
    if (classNumMatch) {
      results.push({
        grade: defaultGrade,
        className: `${classNumMatch[1]}반`,
        studentNumber: `${classNumMatch[2]}번`,
        name: classNumMatch[3].trim(),
      });
      continue;
    }

    const numNameMatch = line.match(/^(\d+)번?[\s.:]\s*(.+)$/);
    if (numNameMatch) {
      results.push({
        grade: defaultGrade,
        className: defaultClass,
        studentNumber: `${numNameMatch[1]}번`,
        name: numNameMatch[2].trim(),
      });
      continue;
    }

    // Just names separated by commas or spaces in a single line
    const nameTokens = line.split(/[,\s]+/).map((t) => t.trim()).filter((t) => t.length > 0 && !/^\d+$/.test(t));
    if (nameTokens.length > 1 && !line.includes('학년')) {
      for (const token of nameTokens) {
        results.push({
          grade: defaultGrade,
          className: defaultClass,
          studentNumber: `${results.length + 1}번`,
          name: token,
        });
      }
      continue;
    }

    // Default single name line
    if (line.trim()) {
      results.push({
        grade: defaultGrade,
        className: defaultClass,
        studentNumber: `${results.length + 1}번`,
        name: line.trim(),
      });
    }
  }

  return results;
}

function normalizeGrade(val: string, fallback: string): string {
  if (!val) return fallback;
  const clean = val.replace(/[^0-9]/g, '');
  if (clean) return `${clean}학년`;
  if (val.includes('학년')) return val.trim();
  return fallback;
}

function normalizeClass(val: string, fallback: string): string {
  if (!val) return fallback;
  const clean = val.replace(/[^0-9]/g, '');
  if (clean) return `${clean}반`;
  if (val.includes('반')) return val.trim();
  return fallback;
}

function normalizeNumber(val: string, fallbackNum: string): string {
  if (!val) return `${fallbackNum}번`;
  const clean = val.replace(/[^0-9]/g, '');
  if (clean) return `${clean}번`;
  return `${fallbackNum}번`;
}

/**
 * Generate sample CSV template for teachers to fill in
 */
export function generateStudentTemplateCSV(): string {
  const headers = ['학년', '반', '번호', '이름'];
  const sampleRows = [
    ['3학년', '1반', '1번', '김민준'],
    ['3학년', '1반', '2번', '이서아'],
    ['3학년', '1반', '3번', '박도윤'],
    ['3학년', '1반', '4번', '최지우'],
    ['3학년', '1반', '5번', '정예준'],
    ['3학년', '2반', '1번', '강하은'],
    ['3학년', '2반', '2번', '조윤우'],
  ];

  return [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Generate unique student ID
 */
export function createStudentId(grade: string, className: string, studentNumber: string, name: string): string {
  const g = grade.replace(/[^0-9]/g, '') || '0';
  const c = className.replace(/[^0-9]/g, '') || '0';
  const n = studentNumber.replace(/[^0-9]/g, '') || '0';
  const cleanName = name.replace(/\s+/g, '');
  return `s_${g}_${c}_${n}_${cleanName}_${Date.now().toString(36).slice(-4)}`;
}

/**
 * Export students roster to CSV text
 */
export function exportStudentsRosterCSV(students: Student[], totalBooks = 100): string {
  const headers = ['학년', '반', '번호', '이름', '완독권수', '읽는중', '달성률(%)', '칭호', '최근활동일'];
  const rows = students.map((s) => {
    const completed = getCompletedCount(s);
    const inProgress = getInProgressCount(s);
    const percent = totalBooks > 0 ? Math.round((completed / totalBooks) * 100) : 0;
    const badge = getCurrentBadge(completed)?.title || '독서 시작';
    const lastDate = s.updatedAt ? s.updatedAt.split('T')[0] : '';
    return [
      `"${s.grade}"`,
      `"${s.className}"`,
      `"${s.studentNumber || ''}"`,
      `"${s.name}"`,
      completed,
      inProgress,
      `"${percent}%"`,
      `"${badge}"`,
      `"${lastDate}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Export all detailed student book reviews and ratings to CSV
 */
export function exportReviewsDetailedCSV(students: Student[], books: Book[]): string {
  const bookMap = new Map<string, Book>();
  books.forEach((b) => bookMap.set(b.num, b));

  const headers = [
    '학년',
    '반',
    '번호',
    '학생이름',
    '도서번호',
    '도서명',
    '저자',
    '권장학년',
    '독서상태',
    '별점',
    '간단감상평(느낀점)',
    '인상깊은한줄(구절)',
    '완독일자',
    '기록일시',
  ];

  const rows: string[] = [];

  students.forEach((s) => {
    const studentRecords = s.records || {};
    Object.values(studentRecords).forEach((rec) => {
      const book = bookMap.get(rec.num);
      const statusLabel =
        rec.status === 'COMPLETED' ? '완독 완료' : rec.status === 'IN_PROGRESS' ? '읽는 중' : '읽기 전';
      const ratingText = rec.rating ? `${rec.rating}점` : '';
      const reviewText = (rec.review || '').replace(/"/g, '""');
      const quoteText = (rec.quote || '').replace(/"/g, '""');

      rows.push(
        [
          `"${s.grade}"`,
          `"${s.className}"`,
          `"${s.studentNumber || ''}"`,
          `"${s.name}"`,
          `"${rec.num}"`,
          `"${(book?.title || `도서 #${rec.num}`).replace(/"/g, '""')}"`,
          `"${(book?.author || '').replace(/"/g, '""')}"`,
          `"${book?.grade || ''}"`,
          `"${statusLabel}"`,
          `"${ratingText}"`,
          `"${reviewText}"`,
          `"${quoteText}"`,
          `"${rec.completedDate || ''}"`,
          `"${rec.updatedAt ? rec.updatedAt.split('T')[0] : ''}"`,
        ].join(',')
      );
    });
  });

  return [headers.join(','), ...rows].join('\r\n');
}
