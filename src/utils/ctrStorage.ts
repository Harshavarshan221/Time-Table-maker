import type { CTRItem } from '../types/ctrs';
import { CTR_PRESET_COLORS } from '../types/ctrs';

const LOCAL_STORAGE_KEY = 'timetable.app.ctr.v1';

export function loadAllCTRs(): CTRItem[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load CTRs from localStorage:', err);
  }
  
  // Provide default initial CTRs if none exist
  const defaultCTRs: CTRItem[] = [
    {
      id: 'ctr_dsa_medium',
      name: 'DSA Medium Questions',
      color: CTR_PRESET_COLORS[1].hex, // Purple
      dailyValues: {},
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ctr_pushups',
      name: 'Pushups',
      color: CTR_PRESET_COLORS[2].hex, // Green
      dailyValues: {},
      createdAt: new Date().toISOString(),
    },
  ];
  return defaultCTRs;
}

export function saveAllCTRs(ctrs: CTRItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ctrs));
  } catch (err) {
    console.error('Failed to save CTRs to localStorage:', err);
  }
}

export function createCTR(name: string, colorHex: string): CTRItem[] {
  const ctrs = loadAllCTRs();
  const newItem: CTRItem = {
    id: `ctr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: name.trim(),
    color: colorHex,
    dailyValues: {},
    createdAt: new Date().toISOString(),
  };
  const updated = [...ctrs, newItem];
  saveAllCTRs(updated);
  return updated;
}

export function updateCTRValue(ctrId: string, dateStr: string, newValue: number): CTRItem[] {
  const ctrs = loadAllCTRs();
  const safeVal = Math.max(0, newValue);
  const updated = ctrs.map((c) => {
    if (c.id === ctrId) {
      return {
        ...c,
        dailyValues: {
          ...c.dailyValues,
          [dateStr]: safeVal,
        },
      };
    }
    return c;
  });
  saveAllCTRs(updated);
  return updated;
}

export function incrementCTRValue(ctrId: string, dateStr: string, delta: number = 1): CTRItem[] {
  const ctrs = loadAllCTRs();
  const target = ctrs.find((c) => c.id === ctrId);
  const currentVal = target?.dailyValues[dateStr] || 0;
  return updateCTRValue(ctrId, dateStr, currentVal + delta);
}

export function deleteCTR(ctrId: string): CTRItem[] {
  const ctrs = loadAllCTRs();
  const updated = ctrs.filter((c) => c.id !== ctrId);
  saveAllCTRs(updated);
  return updated;
}
