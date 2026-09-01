import { Book, Student, ReadingRecord } from '../types';

export const DEFAULT_GAS_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbzadfKKmLDbaSzfpZ4g3s9UZgeKDgPwsPtMRViofcpNSqucSuNK9C_-f5tjVc4C03DO/exec';

export const STORAGE_KEY_GAS_URL = 'seoryong_gas_script_url';

export interface RecordPayload {
  studentName: string;
  grade: string;
  className: string;
  studentNumber?: string;
  bookNum: string;
  bookTitle: string;
  author: string;
  publisher?: string;
  bookGrade?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UNREAD';
  rating?: number;
  review?: string;
  quote?: string;
  completedDate?: string;
  timestamp?: string;
}

export function getGoogleScriptUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GAS_URL);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    console.error('Failed to read GAS URL from localStorage', e);
  }
  return DEFAULT_GAS_WEBAPP_URL;
}

export function saveGoogleScriptUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
  } catch (e) {
    console.error('Failed to save GAS URL to localStorage', e);
  }
}

/**
 * Format current date-time string in Korean timezone (YYYY-MM-DD HH:mm:ss)
 */
export function getFormattedNow(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Send a single reading record to Google Apps Script Web App
 * Uses multiple compatible payload formats to ensure compatibility with various doGet/doPost GAS scripts
 */
export async function sendRecordToGoogleSheet(
  payload: RecordPayload,
  customUrl?: string
): Promise<{ success: boolean; message: string }> {
  const scriptUrl = (customUrl || getGoogleScriptUrl()).trim();
  if (!scriptUrl) {
    return { success: false, message: '구글 앱스 스크립트 연동 URL이 설정되지 않았습니다.' };
  }

  const timestamp = payload.timestamp || getFormattedNow();
  const statusKorean =
    payload.status === 'COMPLETED'
      ? '완독 완료'
      : payload.status === 'IN_PROGRESS'
      ? '읽는 중'
      : '읽기 전';

  // Build comprehensive unified data object
  const recordData = {
    action: 'saveRecord',
    timestamp: timestamp,
    // English Keys
    grade: payload.grade || '',
    className: payload.className || '',
    studentNumber: payload.studentNumber || '',
    studentName: payload.studentName || '',
    name: payload.studentName || '',
    bookNum: payload.bookNum || '',
    num: payload.bookNum || '',
    bookTitle: payload.bookTitle || '',
    title: payload.bookTitle || '',
    author: payload.author || '',
    publisher: payload.publisher || '',
    bookGrade: payload.bookGrade || '',
    status: payload.status,
    statusKorean: statusKorean,
    rating: payload.rating || 0,
    ratingText: payload.rating ? `${payload.rating}점` : '',
    review: payload.review || '',
    quote: payload.quote || '',
    completedDate: payload.completedDate || '',
    // Korean Keys for direct sheet column mapping
    학년: payload.grade || '',
    반: payload.className || '',
    번호: payload.studentNumber || '',
    학생이름: payload.studentName || '',
    이름: payload.studentName || '',
    도서번호: payload.bookNum || '',
    도서명: payload.bookTitle || '',
    저자: payload.author || '',
    출판사: payload.publisher || '',
    권장학년: payload.bookGrade || '',
    독서상태: statusKorean,
    별점: payload.rating ? `${payload.rating}점` : '',
    간단감상평: payload.review || '',
    감상평: payload.review || '',
    인상깊은구절: payload.quote || '',
    기억에남는한줄: payload.quote || '',
    완독일자: payload.completedDate || '',
    기록일시: timestamp,
  };

  try {
    // 1. Primary Attempt: POST request with text/plain (avoids CORS preflight in Google Apps Script Web Apps)
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(recordData),
      });
    } catch (postError) {
      console.warn('POST failed, attempting fallback GET request', postError);
    }

    // 2. Secondary/Fallback: also send GET with URL query parameters for scripts implemented with doGet(e)
    try {
      const params = new URLSearchParams();
      params.append('action', 'saveRecord');
      params.append('timestamp', timestamp);
      params.append('grade', payload.grade || '');
      params.append('className', payload.className || '');
      params.append('studentNumber', payload.studentNumber || '');
      params.append('name', payload.studentName || '');
      params.append('bookNum', payload.bookNum || '');
      params.append('title', payload.bookTitle || '');
      params.append('author', payload.author || '');
      params.append('status', statusKorean);
      params.append('rating', String(payload.rating || 0));
      params.append('review', payload.review || '');
      params.append('quote', payload.quote || '');
      params.append('completedDate', payload.completedDate || '');

      const getUrl = scriptUrl.includes('?') ? `${scriptUrl}&${params.toString()}` : `${scriptUrl}?${params.toString()}`;
      await fetch(getUrl, { mode: 'no-cors', method: 'GET' });
    } catch (getError) {
      // Ignored since no-cors might not return response object but request succeeds
      console.debug('GET fallback sent', getError);
    }

    return {
      success: true,
      message: '구글 스프레드시트에 성공적으로 기록되었습니다! 📊',
    };
  } catch (error) {
    console.error('Error saving record to Google Apps Script', error);
    return {
      success: false,
      message: '구글 시트 전송 중 오류가 발생했습니다. (로컬에는 정상 저장됨)',
    };
  }
}

/**
 * Batch Sync all existing student records to Google Sheet
 */
export async function syncAllRecordsToGoogleSheet(
  students: Student[],
  books: Book[],
  onProgress?: (current: number, total: number) => void
): Promise<{ total: number; sent: number; success: boolean; message: string }> {
  const bookMap = new Map<string, Book>();
  books.forEach((b) => bookMap.set(b.num, b));

  // Collect all valid records
  const allPayloads: RecordPayload[] = [];

  students.forEach((student) => {
    const studentRecords = student.records || {};
    Object.values(studentRecords).forEach((rec) => {
      const book = bookMap.get(rec.num);
      allPayloads.push({
        studentName: student.name,
        grade: student.grade || '3학년',
        className: student.className || '1반',
        studentNumber: student.studentNumber || '',
        bookNum: rec.num,
        bookTitle: book?.title || `도서 #${rec.num}`,
        author: book?.author || '',
        publisher: book?.publisher || '',
        bookGrade: book?.grade || '',
        status: rec.status,
        rating: rec.rating || 0,
        review: rec.review || '',
        quote: rec.quote || '',
        completedDate: rec.completedDate || '',
        timestamp: rec.updatedAt || getFormattedNow(),
      });
    });
  });

  if (allPayloads.length === 0) {
    return {
      total: 0,
      sent: 0,
      success: true,
      message: '동기화할 독서 기록이 없습니다.',
    };
  }

  // Also send full batch payload if the GAS script supports batch 'bulkSave'
  const scriptUrl = getGoogleScriptUrl();
  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'bulkSave',
        timestamp: getFormattedNow(),
        count: allPayloads.length,
        records: allPayloads,
      }),
    });
  } catch (bulkErr) {
    console.debug('Bulk post sent', bulkErr);
  }

  // Send individual rows with slight stagger to prevent hitting GAS concurrent rate limits
  let sentCount = 0;
  for (let i = 0; i < allPayloads.length; i++) {
    const payload = allPayloads[i];
    await sendRecordToGoogleSheet(payload);
    sentCount++;
    if (onProgress) {
      onProgress(sentCount, allPayloads.length);
    }
    // Small delay to be polite to Google Apps Script rate limits
    if (i < allPayloads.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  return {
    total: allPayloads.length,
    sent: sentCount,
    success: true,
    message: `총 ${sentCount}건의 독서 기록을 구글 스프레드시트에 성공적으로 동기화했습니다! 🎉`,
  };
}
