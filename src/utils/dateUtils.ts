import type { WeekInfo } from '../types/timetable';
import { START_HOUR, HOUR_HEIGHT_PX } from '../constants/categories';

/**
 * Given a date, returns the Monday date of that week (00:00:00).
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Format date into ISO YYYY-MM-DD.
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get comprehensive week info object for a given reference date.
 */
export function getWeekInfo(referenceDate: Date): WeekInfo {
  const monday = getMonday(referenceDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const todayStr = toISODateString(new Date());
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const days = [];
  for (let i = 0; i < 7; i++) {
    const curDate = new Date(monday);
    curDate.setDate(monday.getDate() + i);
    const isoDate = toISODateString(curDate);
    const dateStr = `${monthNames[curDate.getMonth()]} ${curDate.getDate()}`;

    days.push({
      name: dayNames[i],
      fullName: fullDayNames[i],
      dateStr,
      isoDate,
      dayIndex: i,
      isToday: isoDate === todayStr,
    });
  }

  return {
    mondayDate: monday,
    sundayDate: sunday,
    weekId: toISODateString(monday),
    days,
  };
}

/**
 * Formats a week date range string like "Aug 3 – Aug 9, 2026".
 */
export function formatWeekRange(weekInfo: WeekInfo): string {
  const mon = weekInfo.mondayDate;
  const sun = weekInfo.sundayDate;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const startStr = `${monthNames[mon.getMonth()]} ${mon.getDate()}`;
  const endStr = `${monthNames[sun.getMonth()]} ${sun.getDate()}`;
  const yearStr = sun.getFullYear();

  return `${startStr} – ${endStr}, ${yearStr}`;
}

/**
 * Convert time string "HH:mm" (e.g. "10:30") to total minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Convert total minutes from midnight to "HH:mm" string.
 */
export function minutesToTime(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Format total minutes from midnight into 12-hour (e.g. "10:30 AM") or 24-hour format (e.g. "10:30").
 */
export function minutesToFormattedTime(totalMinutes: number, format: '12h' | '24h' = '12h'): string {
  let hrs = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const minsStr = mins === 0 ? '00' : String(mins).padStart(2, '0');

  if (format === '24h') {
    return `${String(hrs).padStart(2, '0')}:${minsStr}`;
  }

  const period = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  return `${hrs}:${minsStr} ${period}`;
}

/**
 * Compute range label, e.g., "10:00 AM – 12:00 PM" or "10:00 – 12:00".
 */
export function formatTimeRange(startTimeStr: string, durationMinutes: number, format: '12h' | '24h' = '12h'): string {
  const startMins = timeToMinutes(startTimeStr);
  const endMins = startMins + durationMinutes;
  return `${minutesToFormattedTime(startMins, format)} – ${minutesToFormattedTime(endMins, format)}`;
}

/**
 * Format duration in minutes into a clean human-readable label e.g., 90 -> "1h 30m", 120 -> "2h", 45 -> "45m".
 */
export function formatDurationLabel(durationMinutes: number): string {
  const hrs = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (hrs > 0) {
    return `${hrs}h`;
  }
  return `${mins}m`;
}

/**
 * Convert time string to pixel offset from top of grid (handles overnight times after 12 AM midnight).
 */
export function timeToTopPx(
  startTimeStr: string,
  startHour: number = START_HOUR,
  hourHeightPx: number = HOUR_HEIGHT_PX
): number {
  let startMins = timeToMinutes(startTimeStr);
  const gridStartMins = startHour * 60;

  // Overnight adjustment: If startMins is less than gridStartMins (e.g. 01:00 AM vs 04:00 AM grid start),
  // it means the task is scheduled after 12 AM midnight in the 24-hour cycle. Add 1440 mins (24h).
  if (startMins < gridStartMins) {
    startMins += 1440;
  }

  const offsetMins = startMins - gridStartMins;
  return (offsetMins / 60) * hourHeightPx;
}

/**
 * Convert duration in minutes to pixel height.
 */
export function durationToHeightPx(
  durationMinutes: number,
  hourHeightPx: number = HOUR_HEIGHT_PX
): number {
  return (durationMinutes / 60) * hourHeightPx;
}

/**
 * Convert pixel Y offset on the grid to snapped time string "HH:mm" (snapped to 30 min).
 */
export function pxToSnappedTime(
  yPx: number,
  startHour: number = START_HOUR,
  endHour: number = 22,
  hourHeightPx: number = HOUR_HEIGHT_PX
): string {
  const hoursFromStart = yPx / hourHeightPx;
  const totalMinutes = startHour * 60 + hoursFromStart * 60;
  // Snap to nearest 30 mins
  const snappedMinutes = Math.max(
    startHour * 60,
    Math.min(endHour * 60, Math.round(totalMinutes / 30) * 30)
  );
  return minutesToTime(snappedMinutes);
}

/**
 * Snap raw duration in minutes to 30-minute interval (minimum 30 mins).
 */
export function snapDuration(durationMins: number): number {
  const snapped = Math.round(durationMins / 30) * 30;
  return Math.max(30, snapped);
}

/**
 * Format month & year string (e.g. "August 2026").
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Returns array of WeekInfo for all Mondays that belong to or overlap the given month.
 */
export function getWeeksInMonth(year: number, month: number): WeekInfo[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const weeks: WeekInfo[] = [];
  const visitedWeekIds = new Set<string>();

  let curr = new Date(firstDayOfMonth);
  while (curr <= lastDayOfMonth || curr.getDay() !== 1) {
    const monday = getMonday(curr);
    const weekInfo = getWeekInfo(monday);
    if (!visitedWeekIds.has(weekInfo.weekId)) {
      visitedWeekIds.add(weekInfo.weekId);
      weeks.push(weekInfo);
    }

    curr.setDate(curr.getDate() + 1);
    if (curr > lastDayOfMonth && curr.getDay() === 1) {
      break;
    }
  }

  return weeks;
}

/**
 * Returns true if two Date objects represent the same calendar day.
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Converts a timetable slot date string ("YYYY-MM-DD") and time string ("HH:mm")
 * into its true, exact chronological Date object based on gridStartHour boundary.
 *
 * Example:
 * If timetable start is 8:00 AM (or 4:00 AM), and slot is 04:00 AM under Wednesday's timetable,
 * because 4 < 8 (or 1 < 4), it belongs chronologically to Thursday 04:00 AM.
 */
export function getLogicalStartDateTime(
  isoDateStr: string,
  timeStr: string = '00:00',
  gridStartHour: number = 4
): Date {
  const [year, month, day] = isoDateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const dt = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);

  // If slot hours is less than gridStartHour, it belongs to the next calendar date chronologically
  if ((hours || 0) < gridStartHour) {
    dt.setDate(dt.getDate() + 1);
  }

  return dt;
}

export type TemporalState = 'PAST' | 'CURRENT' | 'FUTURE';

/**
 * Returns whether a scheduled item is chronologically PAST, CURRENT, or FUTURE.
 */
export function getTemporalState(
  isoDateStr: string,
  startTimeStr?: string,
  durationMinutes: number = 60,
  gridStartHour: number = 4,
  now: Date = new Date()
): TemporalState {
  if (!startTimeStr) {
    // If no start time, compare date boundary
    const [y, m, d] = isoDateStr.split('-').map(Number);
    const itemDate = new Date(y, m - 1, d, 23, 59, 59);
    if (now > itemDate) return 'PAST';
    if (toISODateString(now) === isoDateStr) return 'CURRENT';
    return 'FUTURE';
  }

  const startDt = getLogicalStartDateTime(isoDateStr, startTimeStr, gridStartHour);
  const endDt = new Date(startDt.getTime() + durationMinutes * 60 * 1000);

  if (now < startDt) {
    return 'FUTURE';
  }
  if (now >= startDt && now <= endDt) {
    return 'CURRENT';
  }
  return 'PAST';
}

/**
 * Helper to check if a scheduled item is eligible for historical performance analytics.
 * Returns true ONLY if the item's logical start time has already occurred (PAST or CURRENT).
 * FUTURE items return false (FUTURE != MISSED).
 */
export function isAnalyticsEligible(
  isoDateStr: string,
  startTimeStr?: string,
  durationMinutes: number = 60,
  gridStartHour: number = 4,
  now: Date = new Date()
): boolean {
  const state = getTemporalState(isoDateStr, startTimeStr, durationMinutes, gridStartHour, now);
  return state === 'PAST' || state === 'CURRENT';
}


