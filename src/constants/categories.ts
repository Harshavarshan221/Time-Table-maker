import type { CategoryConfig } from '../types/timetable';

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'cat-dsa',
    name: 'DSA',
    color: '#EEF2FF',      // Soft Indigo
    borderColor: '#6366F1',
    textColor: '#3730A3',
  },
  {
    id: 'cat-dev',
    name: 'Development',
    color: '#ECFDF5',      // Soft Emerald
    borderColor: '#10B981',
    textColor: '#065F46',
  },
  {
    id: 'cat-corecs',
    name: 'Core CS',
    color: '#FEF3C7',      // Soft Amber
    borderColor: '#F59E0B',
    textColor: '#92400E',
  },
  {
    id: 'cat-college',
    name: 'College',
    color: '#F3E8FF',      // Soft Purple
    borderColor: '#A855F7',
    textColor: '#6B21A8',
  },
  {
    id: 'cat-exercise',
    name: 'Exercise',
    color: '#FFEDD5',      // Soft Orange
    borderColor: '#F97316',
    textColor: '#9A3412',
  },
  {
    id: 'cat-personal',
    name: 'Personal',
    color: '#FCE7F3',      // Soft Rose
    borderColor: '#EC4899',
    textColor: '#9D174D',
  },
  {
    id: 'cat-other',
    name: 'Other',
    color: '#F1F5F9',      // Soft Slate
    borderColor: '#64748B',
    textColor: '#334155',
  },
];

export const FALLBACK_CATEGORY: CategoryConfig = {
  id: 'cat-fallback',
  name: 'Other',
  color: '#F1F5F9',
  borderColor: '#64748B',
  textColor: '#334155',
};

export const START_HOUR = 8;  // 08:00 AM
export const END_HOUR = 22;   // 10:00 PM (22:00)
export const TOTAL_HOURS = END_HOUR - START_HOUR; // 14 hours
export const HOUR_HEIGHT_PX = 64; // Height per hour in grid

export function getCategoryConfig(
  categories: CategoryConfig[],
  catName: string
): CategoryConfig {
  const found = categories.find((c) => c.name.toLowerCase() === catName?.toLowerCase());
  if (found) return found;

  // Generate color dynamically if custom name
  const generated = generateCategoryColors('#64748B');
  return {
    id: `cat-dynamic-${catName}`,
    name: catName || 'Other',
    ...generated,
  };
}

/**
 * Generate soft background color and text color from an accent hex color.
 */
export function generateCategoryColors(accentHex: string): {
  color: string;
  borderColor: string;
  textColor: string;
} {
  // Simple hex to RGB conversion
  let hex = accentHex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 100;
  const g = parseInt(hex.substring(2, 4), 16) || 100;
  const b = parseInt(hex.substring(4, 6), 16) || 100;

  // Soft background tint (90% white blend)
  const bgR = Math.round(r * 0.15 + 255 * 0.85);
  const bgG = Math.round(g * 0.15 + 255 * 0.85);
  const bgB = Math.round(b * 0.15 + 255 * 0.85);
  const color = `rgb(${bgR}, ${bgG}, ${bgB})`;

  // Darker text color (60% black blend)
  const textR = Math.round(r * 0.6);
  const textG = Math.round(g * 0.6);
  const textB = Math.round(b * 0.6);
  const textColor = `rgb(${textR}, ${textG}, ${textB})`;

  return {
    color,
    borderColor: accentHex,
    textColor,
  };
}
