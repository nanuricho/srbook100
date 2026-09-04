import { Book, Student } from '../types';

export interface BookRatingStat {
  num: string;
  book: Book;
  averageRating: number;
  ratingCount: number;
  completedCount: number;
  topReviews: {
    studentName: string;
    studentGrade: string;
    rating?: number;
    review: string;
  }[];
  allReviews: {
    studentName: string;
    studentGrade: string;
    rating?: number;
    review: string;
  }[];
}

/**
 * Calculate book ratings and popularity from all students' records
 */
export function calculateBookRatingStats(books: Book[], students: Student[]): BookRatingStat[] {
  const bookMap = new Map<string, Book>();
  books.forEach((b) => bookMap.set(b.num, b));

  const statsMap = new Map<
    string,
    {
      ratings: number[];
      completedCount: number;
      reviews: {
        studentName: string;
        studentGrade: string;
        rating?: number;
        review: string;
      }[];
    }
  >();

  // Aggregate student records
  students.forEach((student) => {
    const records = student.records || {};
    Object.values(records).forEach((rec) => {
      if (!statsMap.has(rec.num)) {
        statsMap.set(rec.num, {
          ratings: [],
          completedCount: 0,
          reviews: [],
        });
      }

      const item = statsMap.get(rec.num)!;

      if (rec.status === 'COMPLETED') {
        item.completedCount += 1;
      }

      if (rec.rating && rec.rating > 0) {
        item.ratings.push(rec.rating);
      }

      if (rec.review && rec.review.trim()) {
        item.reviews.push({
          studentName: student.name,
          studentGrade: `${student.grade} ${student.className}`,
          rating: rec.rating,
          review: rec.review.trim(),
        });
      }
    });
  });

  const results: BookRatingStat[] = [];

  books.forEach((book) => {
    const data = statsMap.get(book.num);
    if (!data) {
      results.push({
        num: book.num,
        book,
        averageRating: 0,
        ratingCount: 0,
        completedCount: 0,
        topReviews: [],
        allReviews: [],
      });
      return;
    }

    const ratingCount = data.ratings.length;
    const averageRating =
      ratingCount > 0
        ? Math.round((data.ratings.reduce((acc, curr) => acc + curr, 0) / ratingCount) * 10) / 10
        : 0;

    results.push({
      num: book.num,
      book,
      averageRating,
      ratingCount,
      completedCount: data.completedCount,
      topReviews: data.reviews.slice(0, 3),
      allReviews: data.reviews,
    });
  });

  return results;
}

/**
 * Get top rated books filtered by grade
 */
export function getTopRatedBooks(
  stats: BookRatingStat[],
  gradeFilter = 'ALL',
  limit = 10
): BookRatingStat[] {
  let filtered = stats;
  if (gradeFilter !== 'ALL') {
    if (gradeFilter === '공통/기타') {
      filtered = stats.filter((s) => s.book.grade.includes('전학년') || s.book.grade.includes('공통'));
    } else {
      filtered = stats.filter((s) => s.book.grade.includes(gradeFilter.replace('학년', '')));
    }
  }

  const rated = [...filtered].filter((s) => s.averageRating > 0 || s.completedCount > 0);
  if (rated.length > 0) {
    return rated
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        if (b.ratingCount !== a.ratingCount) {
          return b.ratingCount - a.ratingCount;
        }
        if (b.completedCount !== a.completedCount) {
          return b.completedCount - a.completedCount;
        }
        return parseInt(a.num, 10) - parseInt(b.num, 10);
      })
      .slice(0, limit);
  }

  // Fallback to top books of that category
  return [...filtered].slice(0, limit);
}
