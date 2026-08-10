import type { EmotionId } from '../constants/emotions';

export interface DailyEmotionEntry {
  dateStr: string;     // YYYY-MM-DD
  emotionId: EmotionId;
  timestamp: number;
}

const LOCAL_STORAGE_KEY = 'timetable_daily_emotions_v1';

/**
 * Load all stored daily emotions from localStorage for user or guest.
 */
export function loadDailyEmotions(uid?: string): Record<string, DailyEmotionEntry> {
  try {
    const key = uid ? `timetable_user_emotions_${uid}` : LOCAL_STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load daily emotions:', e);
  }
  return {};
}

/**
 * Get stored emotion entry for a specific date (YYYY-MM-DD).
 */
export function getEmotionForDate(dateStr: string, uid?: string): DailyEmotionEntry | null {
  const all = loadDailyEmotions(uid);
  return all[dateStr] || null;
}

/**
 * Save an emotion entry for a specific date (YYYY-MM-DD).
 */
export function saveEmotionForDate(dateStr: string, emotionId: EmotionId, uid?: string): DailyEmotionEntry {
  const all = loadDailyEmotions(uid);
  const entry: DailyEmotionEntry = {
    dateStr,
    emotionId,
    timestamp: Date.now(),
  };

  all[dateStr] = entry;

  try {
    const key = uid ? `timetable_user_emotions_${uid}` : LOCAL_STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save daily emotion locally:', e);
  }

  return entry;
}
