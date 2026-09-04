import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, ReadingRecord } from '../types';

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Attempt silent anonymous auth for secure sessions
export async function ensureAnonymousAuth(): Promise<void> {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (err) {
    console.warn('Anonymous auth note:', err);
  }
}

// Test server connection as per best practices
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    // If permission or offline, still return false
    console.debug('Firestore connection check:', error);
    return false;
  }
}

const STUDENTS_COLLECTION = 'students';

/**
 * Clean student object to ensure Firestore compatibility (no undefined fields)
 */
function sanitizeStudentForFirestore(student: Student): Record<string, any> {
  const sanitized: Record<string, any> = {
    id: student.id,
    grade: student.grade || '3학년',
    className: student.className || '1반',
    name: student.name || '학생',
    records: student.records || {},
    createdAt: student.createdAt || new Date().toISOString(),
    updatedAt: student.updatedAt || new Date().toISOString(),
  };

  if (student.studentNumber) {
    sanitized.studentNumber = student.studentNumber;
  }

  return sanitized;
}

/**
 * Real-time listener for students collection across all devices
 */
export function subscribeToStudentsFromCloud(
  onUpdate: (students: Student[]) => void,
  onError?: (error: Error) => void
): () => void {
  const studentsCol = collection(db, STUDENTS_COLLECTION);

  const unsubscribe = onSnapshot(
    studentsCol,
    (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.name) {
          list.push({
            id: data.id || docSnap.id,
            grade: data.grade || '3학년',
            className: data.className || '1반',
            studentNumber: data.studentNumber || '',
            name: data.name,
            records: data.records || {},
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      });

      // Sort by grade, class, studentNumber, name
      list.sort((a, b) => {
        const gradeA = parseInt(a.grade.replace(/[^0-9]/g, '') || '0', 10);
        const gradeB = parseInt(b.grade.replace(/[^0-9]/g, '') || '0', 10);
        if (gradeA !== gradeB) return gradeA - gradeB;

        const classA = parseInt(a.className.replace(/[^0-9]/g, '') || '0', 10);
        const classB = parseInt(b.className.replace(/[^0-9]/g, '') || '0', 10);
        if (classA !== classB) return classA - classB;

        const numA = parseInt((a.studentNumber || '').replace(/[^0-9]/g, '') || '0', 10);
        const numB = parseInt((b.studentNumber || '').replace(/[^0-9]/g, '') || '0', 10);
        if (numA !== numB) return numA - numB;

        return a.name.localeCompare(b.name, 'ko');
      });

      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore snapshot error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a single student to Firestore
 */
export async function saveStudentToCloud(student: Student): Promise<void> {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, student.id);
    const payload = sanitizeStudentForFirestore(student);
    await setDoc(studentRef, payload, { merge: true });
  } catch (e) {
    console.error('Failed to save student to Firestore cloud', e);
    throw e;
  }
}

/**
 * Save or update a specific reading record for a student
 */
export async function saveStudentRecordToCloud(
  studentId: string,
  record: ReadingRecord,
  studentMeta?: { grade?: string; className?: string; studentNumber?: string; name?: string }
): Promise<void> {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    const nowIso = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      [`records.${record.num}`]: {
        ...record,
        updatedAt: record.updatedAt || nowIso,
      },
      updatedAt: nowIso,
    };

    if (studentMeta) {
      if (studentMeta.name) updatePayload.name = studentMeta.name;
      if (studentMeta.grade) updatePayload.grade = studentMeta.grade;
      if (studentMeta.className) updatePayload.className = studentMeta.className;
      if (studentMeta.studentNumber) updatePayload.studentNumber = studentMeta.studentNumber;
    }

    await setDoc(studentRef, updatePayload, { merge: true });
  } catch (e) {
    console.error('Failed to save student record to Firestore cloud', e);
    throw e;
  }
}

/**
 * Delete a reading record from a student in Firestore
 */
export async function deleteStudentRecordFromCloud(
  student: Student,
  bookNum: string
): Promise<void> {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, student.id);
    const currentRecords = { ...(student.records || {}) };
    delete currentRecords[bookNum];

    await setDoc(
      studentRef,
      {
        records: currentRecords,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error('Failed to delete student record from Firestore cloud', e);
    throw e;
  }
}

/**
 * Batch upload / save multiple students to Firestore
 */
export async function saveMultipleStudentsToCloud(studentsList: Student[]): Promise<void> {
  if (!studentsList || studentsList.length === 0) return;

  try {
    // Firestore batches are limited to 500 operations
    const CHUNK_SIZE = 400;
    for (let i = 0; i < studentsList.length; i += CHUNK_SIZE) {
      const chunk = studentsList.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      chunk.forEach((st) => {
        const studentRef = doc(db, STUDENTS_COLLECTION, st.id);
        const payload = sanitizeStudentForFirestore(st);
        batch.set(studentRef, payload, { merge: true });
      });

      await batch.commit();
    }
  } catch (e) {
    console.error('Failed batch saving students to Firestore cloud', e);
    throw e;
  }
}

/**
 * Delete a single student from Firestore
 */
export async function deleteStudentFromCloud(studentId: string): Promise<void> {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentRef);
  } catch (e) {
    console.error('Failed to delete student from Firestore cloud', e);
    throw e;
  }
}

/**
 * Clear all students from Firestore
 */
export async function clearAllStudentsFromCloud(): Promise<void> {
  try {
    const studentsCol = collection(db, STUDENTS_COLLECTION);
    const snapshot = await getDocs(studentsCol);

    const CHUNK_SIZE = 400;
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (e) {
    console.error('Failed to clear students from Firestore cloud', e);
    throw e;
  }
}

const CLASS_PASSWORDS_COLLECTION = 'class_passwords';

export interface CloudClassPassword {
  classKey: string;
  grade: string;
  className: string;
  passwordHash: string;
  updatedAt: string;
}

/**
 * Save or update an individual class password in Firestore
 */
export async function saveClassPasswordToCloud(
  classKey: string,
  grade: string,
  className: string,
  passwordHash: string
): Promise<void> {
  try {
    const ref = doc(db, CLASS_PASSWORDS_COLLECTION, classKey);
    const payload: CloudClassPassword = {
      classKey,
      grade,
      className,
      passwordHash,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, payload, { merge: true });
  } catch (e) {
    console.error(`Failed to save class password for ${classKey} to cloud`, e);
    // don't throw to allow offline/local fallback
  }
}

/**
 * Fetch all class passwords from Firestore
 */
export async function fetchClassPasswordsFromCloud(): Promise<Record<string, string>> {
  try {
    const col = collection(db, CLASS_PASSWORDS_COLLECTION);
    const snapshot = await getDocs(col);
    const result: Record<string, string> = {};
    snapshot.forEach((d) => {
      const data = d.data() as Partial<CloudClassPassword>;
      if (data.classKey && data.passwordHash) {
        result[data.classKey] = data.passwordHash;
      }
    });
    return result;
  } catch (e) {
    console.warn('Failed to fetch class passwords from cloud, using local storage cache', e);
    return {};
  }
}

/**
 * Delete a class password from Firestore (reset)
 */
export async function deleteClassPasswordFromCloud(classKey: string): Promise<void> {
  try {
    const ref = doc(db, CLASS_PASSWORDS_COLLECTION, classKey);
    await deleteDoc(ref);
  } catch (e) {
    console.error(`Failed to delete class password for ${classKey} from cloud`, e);
  }
}

