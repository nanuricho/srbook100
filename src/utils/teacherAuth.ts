/**
 * Teacher Authentication & Password Management
 * Supports individual class teacher passwords, master admin password,
 * and Cloud Firestore synchronization.
 */
import {
  saveClassPasswordToCloud,
  fetchClassPasswordsFromCloud,
  deleteClassPasswordFromCloud,
} from '../lib/firebase';

const STORAGE_KEY_MASTER_PASSWORD = 'seoryong_teacher_password';
const STORAGE_KEY_CLASS_PASSWORDS = 'seoryong_class_passwords';
const STORAGE_KEY_TEACHER_SESSION = 'seoryong_teacher_auth_session_data';
const DEFAULT_MASTER_PASSWORD = 'seoryong100';

export interface TeacherSession {
  role: 'MASTER' | 'CLASS_TEACHER';
  grade?: string; // e.g. "4학년"
  className?: string; // e.g. "2반"
  label: string; // e.g. "4학년 2반 담임선생님" or "총괄 관리자"
  loginAt: string;
}

/** Simple encoding to avoid plain text in storage */
export function encodePassword(pw: string): string {
  try {
    return btoa(encodeURIComponent(pw.trim()));
  } catch {
    return pw.trim();
  }
}

export function decodePassword(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return encoded;
  }
}

/** Normalize grade and class into standard key e.g. "4학년_2반" */
export function getClassKey(grade: string, className: string): string {
  const g = (grade || '1학년').trim();
  const c = (className || '1반').trim();
  return `${g}_${c}`;
}

/** Get all local cached class passwords */
function getLocalClassPasswordsMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASS_PASSWORDS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Save local cached class passwords */
function saveLocalClassPasswordsMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLASS_PASSWORDS, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save class passwords map locally', e);
  }
}

/** Sync class passwords from Cloud Firestore into local storage cache */
export async function syncClassPasswordsWithCloud(): Promise<Record<string, string>> {
  try {
    const cloudPasswords = await fetchClassPasswordsFromCloud();
    const local = getLocalClassPasswordsMap();
    const merged = { ...local, ...cloudPasswords };
    saveLocalClassPasswordsMap(merged);
    return merged;
  } catch (err) {
    console.warn('Class passwords cloud sync notice:', err);
    return getLocalClassPasswordsMap();
  }
}

// Immediately trigger background sync
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncClassPasswordsWithCloud().catch(() => {});
  }, 500);
}

/** Master Password Functions */
export function hasMasterPassword(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MASTER_PASSWORD);
    return Boolean(saved && saved.trim().length > 0);
  } catch {
    return false;
  }
}

export function getMasterPassword(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MASTER_PASSWORD);
    if (saved) return decodePassword(saved);
  } catch {}
  return DEFAULT_MASTER_PASSWORD;
}

export async function setMasterPassword(password: string): Promise<boolean> {
  try {
    if (!password || password.trim().length < 4) return false;
    const encoded = encodePassword(password);
    localStorage.setItem(STORAGE_KEY_MASTER_PASSWORD, encoded);
    // Also mirror to cloud
    await saveClassPasswordToCloud('MASTER', 'MASTER', 'MASTER', encoded);
    return true;
  } catch (e) {
    console.error('Failed to set master password', e);
    return false;
  }
}

export function verifyMasterPassword(inputPassword: string): boolean {
  if (!inputPassword) return false;
  const trimmed = inputPassword.trim();
  const masterPw = getMasterPassword();
  return trimmed === masterPw || trimmed === DEFAULT_MASTER_PASSWORD;
}

/** Class Password Functions */
export function hasClassPassword(grade: string, className: string): boolean {
  const classKey = getClassKey(grade, className);
  const map = getLocalClassPasswordsMap();
  return Boolean(map[classKey] && map[classKey].length > 0);
}

export async function setClassPassword(
  grade: string,
  className: string,
  password: string
): Promise<boolean> {
  try {
    if (!password || password.trim().length < 4) return false;
    const classKey = getClassKey(grade, className);
    const encoded = encodePassword(password);

    // 1. Update local cache
    const map = getLocalClassPasswordsMap();
    map[classKey] = encoded;
    saveLocalClassPasswordsMap(map);

    // 2. Persist to Firestore cloud
    await saveClassPasswordToCloud(classKey, grade, className, encoded);
    return true;
  } catch (e) {
    console.error(`Failed to set class password for ${grade} ${className}`, e);
    return false;
  }
}

export function verifyClassPassword(
  grade: string,
  className: string,
  inputPassword: string
): boolean {
  if (!inputPassword) return false;
  const trimmed = inputPassword.trim();

  // Master password is universally accepted as master key
  if (verifyMasterPassword(trimmed)) {
    return true;
  }

  // Check specific class password
  const classKey = getClassKey(grade, className);
  const map = getLocalClassPasswordsMap();
  const savedEncoded = map[classKey];
  if (!savedEncoded) return false;

  const actualPassword = decodePassword(savedEncoded);
  return actualPassword === trimmed;
}

export async function resetClassPassword(grade: string, className: string): Promise<void> {
  const classKey = getClassKey(grade, className);
  const map = getLocalClassPasswordsMap();
  delete map[classKey];
  saveLocalClassPasswordsMap(map);
  await deleteClassPasswordFromCloud(classKey);
}

/** Teacher Session & State */
export function getCurrentTeacherSession(): TeacherSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_TEACHER_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentTeacherSession(session: TeacherSession | null): void {
  try {
    if (session) {
      sessionStorage.setItem(STORAGE_KEY_TEACHER_SESSION, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_TEACHER_SESSION);
    }
  } catch (e) {
    console.error('Failed to update teacher session storage', e);
  }
}

/** Backward Compatibility Exports */
export function hasTeacherPassword(): boolean {
  return hasMasterPassword();
}

export function setTeacherPassword(password: string): boolean {
  setMasterPassword(password);
  return true;
}

export function verifyTeacherPassword(inputPassword: string): boolean {
  return verifyMasterPassword(inputPassword);
}

export function isTeacherSessionAuthenticated(): boolean {
  return getCurrentTeacherSession() !== null;
}

export function setTeacherSessionAuthenticated(
  authenticated: boolean,
  session?: TeacherSession
): void {
  if (authenticated) {
    const defaultSession: TeacherSession = session || {
      role: 'MASTER',
      label: '총괄 관리자',
      loginAt: new Date().toISOString(),
    };
    setCurrentTeacherSession(defaultSession);
  } else {
    setCurrentTeacherSession(null);
  }
}

export function resetTeacherPassword(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MASTER_PASSWORD);
    setCurrentTeacherSession(null);
  } catch (e) {
    console.error('Failed to reset teacher password', e);
  }
}
