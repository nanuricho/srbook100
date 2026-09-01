/**
 * Teacher Authentication & Password Management
 * Manages teacher password setup, validation, session state, and password changes.
 */

const STORAGE_KEY_TEACHER_PASSWORD = 'seoryong_teacher_password';
const STORAGE_KEY_TEACHER_AUTH_SESSION = 'seoryong_teacher_auth_session';

/** Simple hashing/encoding to avoid plain text in storage */
function encodePassword(pw: string): string {
  try {
    return btoa(encodeURIComponent(pw));
  } catch {
    return pw;
  }
}

function decodePassword(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return encoded;
  }
}

/** Check if teacher password has been configured */
export function hasTeacherPassword(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TEACHER_PASSWORD);
    return Boolean(saved && saved.trim().length > 0);
  } catch {
    return false;
  }
}

/** Set new teacher password */
export function setTeacherPassword(password: string): boolean {
  try {
    if (!password || password.trim().length < 2) return false;
    localStorage.setItem(STORAGE_KEY_TEACHER_PASSWORD, encodePassword(password.trim()));
    setTeacherSessionAuthenticated(true);
    return true;
  } catch (e) {
    console.error('Failed to save teacher password', e);
    return false;
  }
}

/** Verify entered teacher password */
export function verifyTeacherPassword(inputPassword: string): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TEACHER_PASSWORD);
    if (!saved) return false;
    const actual = decodePassword(saved);
    return actual === inputPassword.trim();
  } catch {
    return false;
  }
}

/** Check if currently authenticated in this browser session */
export function isTeacherSessionAuthenticated(): boolean {
  try {
    const session = sessionStorage.getItem(STORAGE_KEY_TEACHER_AUTH_SESSION);
    return session === 'true';
  } catch {
    return false;
  }
}

/** Set authentication state in session storage */
export function setTeacherSessionAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(STORAGE_KEY_TEACHER_AUTH_SESSION, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY_TEACHER_AUTH_SESSION);
    }
  } catch (e) {
    console.error('Failed to update session auth state', e);
  }
}

/** Clear password (reset) */
export function resetTeacherPassword(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TEACHER_PASSWORD);
    setTeacherSessionAuthenticated(false);
  } catch (e) {
    console.error('Failed to reset teacher password', e);
  }
}
