export interface CTRPresetColor {
  id: string;
  name: string;
  hex: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
}

export const CTR_PRESET_COLORS: CTRPresetColor[] = [
  { id: 'blue', name: 'Blue', hex: '#3B82F6', bgHex: '#EFF6FF', borderHex: '#93C5FD', textHex: '#1E40AF' },
  { id: 'purple', name: 'Purple', hex: '#8B5CF6', bgHex: '#F5F3FF', borderHex: '#C4B5FD', textHex: '#5B21B6' },
  { id: 'green', name: 'Green', hex: '#10B981', bgHex: '#ECFDF5', borderHex: '#6EE7B7', textHex: '#065F46' },
  { id: 'orange', name: 'Orange', hex: '#F97316', bgHex: '#FFF7ED', borderHex: '#FDBA74', textHex: '#9A3412' },
  { id: 'red', name: 'Red', hex: '#EF4444', bgHex: '#FEF2F2', borderHex: '#FCA5A5', textHex: '#991B1B' },
  { id: 'cyan', name: 'Cyan', hex: '#06B6D4', bgHex: '#ECFEFF', borderHex: '#67E8F9', textHex: '#155E75' },
  { id: 'yellow', name: 'Yellow', hex: '#EAB308', bgHex: '#FEFCE8', borderHex: '#FDE047', textHex: '#854D0E' },
];

export interface CTRItem {
  id: string;
  name: string;
  color: string; // Color hex or preset ID
  dailyValues: Record<string, number>; // "YYYY-MM-DD" -> count
  createdAt: string;
}
