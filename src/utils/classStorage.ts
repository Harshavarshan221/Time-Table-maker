import type { ClassItem, ClassStatus } from '../types/classes';

const LOCAL_STORAGE_KEY = 'timetable.app.cls.v1';

export function loadAllClasses(): ClassItem[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load classes from localStorage:', err);
  }
  return [];
}

export function saveAllClasses(classes: ClassItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(classes));
  } catch (err) {
    console.error('Failed to save classes to localStorage:', err);
  }
}

/**
 * Generate dates for a specific weekday (0=Mon, ..., 6=Sun) remaining in the month of the target date.
 */
export function getWeekdayDatesInMonth(targetDate: Date, weekday: number): string[] {
  const dates: string[] = [];
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  // Find first day of month
  const date = new Date(year, month, 1);
  
  while (date.getMonth() === month) {
    // JS getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat -> convert to 0 = Mon, ..., 6 = Sun
    const jsDay = date.getDay();
    const convertedDay = (jsDay + 6) % 7;
    
    if (convertedDay === weekday) {
      const iso = date.toISOString().split('T')[0];
      dates.push(iso);
    }
    date.setDate(date.getDate() + 1);
  }
  
  return dates;
}

/**
 * Create a new Class item, optionally repeating on the chosen weekday for the rest of the current month.
 */
export function createClassWithRepeat(
  baseClass: Omit<ClassItem, 'id'>,
  repeatWeekday?: number,
  repeatThisMonth?: boolean
): ClassItem[] {
  const existingClasses = loadAllClasses();
  const created: ClassItem[] = [];

  const baseDate = new Date(baseClass.dateStr);

  if (repeatThisMonth && repeatWeekday !== undefined) {
    const dates = getWeekdayDatesInMonth(baseDate, repeatWeekday);

    for (const dStr of dates) {
      // Duplicate prevention check: check if same class name & date & startTime exists
      const isDuplicate = existingClasses.some(
        (c) => c.dateStr === dStr && c.name.toLowerCase() === baseClass.name.toLowerCase() && c.startTime === baseClass.startTime
      );

      if (!isDuplicate) {
        const newItem: ClassItem = {
          ...baseClass,
          id: `cls_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          dateStr: dStr,
          repeatRule: {
            weekday: repeatWeekday,
            monthIso: dStr.substring(0, 7),
          },
        };
        created.push(newItem);
      }
    }
  } else {
    // Single instance creation
    const newItem: ClassItem = {
      ...baseClass,
      id: `cls_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };
    created.push(newItem);
  }

  const updatedList = [...existingClasses, ...created];
  saveAllClasses(updatedList);
  return updatedList;
}

export function updateClassStatus(classId: string, status: ClassStatus): ClassItem[] {
  const classes = loadAllClasses();
  const updated = classes.map((c) => (c.id === classId ? { ...c, status } : c));
  saveAllClasses(updated);
  return updated;
}

export function updateClassItem(updatedItem: ClassItem): ClassItem[] {
  const classes = loadAllClasses();
  const updated = classes.map((c) => (c.id === updatedItem.id ? updatedItem : c));
  saveAllClasses(updated);
  return updated;
}

export function deleteClassItem(classId: string): ClassItem[] {
  const classes = loadAllClasses();
  const updated = classes.filter((c) => c.id !== classId);
  saveAllClasses(updated);
  return updated;
}
