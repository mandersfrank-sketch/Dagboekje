import { DiaryEntry } from '../types';

export interface StreakInfo {
  streak: number;
  hasEntryToday: boolean;
}

/**
 * Calculates the current consecutive days streak of diary entries.
 * - If today has an entry, counts backwards starting today.
 * - If today has no entry yet, but yesterday has an entry, counts backwards from yesterday.
 * - If a day was missed (e.g., neither today nor yesterday has an entry), streak is 0.
 */
export function calculateStreak(entries: DiaryEntry[]): StreakInfo {
  if (!entries || entries.length === 0) {
    return { streak: 0, hasEntryToday: false };
  }

  // Collect all unique entry dates (format: 'YYYY-MM-DD')
  const entryDates = new Set(
    entries
      .map((e) => e.date)
      .filter((dateStr): dateStr is string => typeof dateStr === 'string' && dateStr.trim().length > 0)
  );

  const formatDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayKey = formatDateKey(today);
  const hasEntryToday = entryDates.has(todayKey);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);
  const hasEntryYesterday = entryDates.has(yesterdayKey);

  // If there is no entry today and no entry yesterday, a day was missed -> streak resets to 0
  if (!hasEntryToday && !hasEntryYesterday) {
    return { streak: 0, hasEntryToday: false };
  }

  // Start checking backwards from today (if completed today) or yesterday (if completed yesterday)
  let checkDate = new Date(hasEntryToday ? today : yesterday);
  let count = 0;

  while (entryDates.has(formatDateKey(checkDate))) {
    count++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { streak: count, hasEntryToday };
}
