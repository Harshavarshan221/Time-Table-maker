export type Category = string;

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;       // Soft background tint (e.g. #EEF2FF)
  borderColor: string; // Accent color (e.g. #6366F1)
  textColor: string;   // Text color (e.g. #3730A3)
}

export interface Task {
  id: string;
  title: string;
  durationMinutes: number; // e.g. 60, 90, 120
  category: Category;
  description?: string;
  weekId?: string;       // e.g. '2026-08-03' (Monday ISO date)
  dayOfWeek?: number;    // 0 = Mon, 1 = Tue, ..., 6 = Sun
  startTime?: string;    // 'HH:mm' format, e.g. '10:00'
}

export interface WeekInfo {
  mondayDate: Date;
  sundayDate: Date;
  weekId: string; // ISO string YYYY-MM-DD for Monday
  days: {
    name: string;      // 'Mon', 'Tue'
    fullName: string;  // 'Monday'
    dateStr: string;   // 'Aug 3'
    isoDate: string;   // '2026-08-03'
    dayIndex: number;  // 0 to 6
    isToday: boolean;
  }[];
}
