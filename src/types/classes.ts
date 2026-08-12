export type ClassStatus = 'scheduled' | 'attended' | 'missed' | 'cancelled';

export interface ClassItem {
  id: string;
  name: string;
  dateStr: string;      // YYYY-MM-DD format
  startTime: string;    // 'HH:mm' format, e.g. '10:00'
  endTime: string;      // 'HH:mm' format, e.g. '11:00'
  status: ClassStatus;  // 'scheduled' (white), 'attended' (green), 'missed' (red), 'cancelled' (yellow)
  repeatRule?: {
    weekday: number;   // 0 = Mon, 1 = Tue, ..., 6 = Sun
    monthIso: string;  // YYYY-MM
  };
  category?: string;
  notes?: string;
}
