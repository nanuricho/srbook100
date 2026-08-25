import { Book } from '../types';

/**
 * Robust CSV parser that handles quoted strings, escaped quotes, and newlines.
 */
export function parseCSV(csvText: string): Book[] {
  if (!csvText || !csvText.trim()) return [];

  const lines = parseCSVToRows(csvText);
  if (lines.length === 0) return [];

  // Filter out header rows if present
  const dataRows = lines.filter((row) => {
    if (!row || row.length < 2) return false;
    const firstCell = (row[0] || '').trim();
    // Skip headers like '순', '번호', 'No', '순번'
    if (['순', '번호', 'no', 'no.', '순번', 'id'].includes(firstCell.toLowerCase())) {
      return false;
    }
    // Must have at least a title or number
    return row[1] || row[0];
  });

  return dataRows.map((row, index) => {
    const rawNum = row[0] ? row[0].trim() : String(index + 1);
    const title = row[1] ? row[1].trim() : '제목 없음';
    
    // Sometimes row layout: [순번, 도서명, 저자, 출판사, 학년] OR [순, 도서명, 구분, 저자, 출판사, 추천학년]
    // Flexible mapping:
    let author = '';
    let publisher = '';
    let grade = '전학년';

    if (row.length >= 6) {
      // e.g. [순, 도서명, 구분, 저자, 출판사, 학년]
      author = row[3] || row[2] || '저자 미상';
      publisher = row[4] || '';
      grade = row[5] || '전학년';
    } else if (row.length === 5) {
      // e.g. [순, 도서명, 저자, 출판사, 학년]
      author = row[2] || '저자 미상';
      publisher = row[3] || '';
      grade = row[4] || '전학년';
    } else if (row.length === 4) {
      author = row[2] || '';
      publisher = row[3] || '';
    } else if (row.length >= 3) {
      author = row[2] || '';
    }

    // Clean grade string (e.g. "1" -> "1학년", "1-2학년" -> "1~2학년")
    grade = normalizeGrade(grade);

    return {
      num: rawNum,
      title: cleanText(title),
      author: cleanText(author) || '저자 미상',
      publisher: cleanText(publisher) || '출판사 미상',
      grade: grade || '전학년',
    };
  });
}

function normalizeGrade(rawGrade: string): string {
  if (!rawGrade) return '전학년';
  const trimmed = rawGrade.trim();
  if (trimmed.includes('1') && !trimmed.includes('학년')) return '1학년';
  if (trimmed.includes('2') && !trimmed.includes('학년')) return '2학년';
  if (trimmed.includes('3') && !trimmed.includes('학년')) return '3학년';
  if (trimmed.includes('4') && !trimmed.includes('학년')) return '4학년';
  if (trimmed.includes('5') && !trimmed.includes('학년')) return '5학년';
  if (trimmed.includes('6') && !trimmed.includes('학년')) return '6학년';
  if (/^[1-6]학년/.test(trimmed)) return trimmed;
  return trimmed || '전학년';
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^"+|"+$/g, '')
    .replace(/\\"/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCSVToRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentToken = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentToken);
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentToken);
      if (currentRow.some((cell) => cell.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }

  if (currentToken || currentRow.length > 0) {
    currentRow.push(currentToken);
    if (currentRow.some((cell) => cell.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}
