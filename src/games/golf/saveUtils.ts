import { GameState } from './types';

export const GOLF_AUTOSAVE_KEY = 'isogolf-autosave';
export const GOLF_SAVED_COURSE_PREFIX = 'isogolf-course-';

export function saveGolfStateToStorage(key: string, state: GameState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Failed to save golf state:', e);
    return false;
  }
}

export function loadGolfStateFromStorage(key: string): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as GameState;
    return parsed.grid ? parsed : null;
  } catch (e) {
    console.error('Failed to load golf state:', e);
    return null;
  }
}

export function deleteGolfStateFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to delete golf state:', e);
  }
}
