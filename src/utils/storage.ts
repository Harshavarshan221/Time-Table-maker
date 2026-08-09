import type { Task, CategoryConfig } from '../types/timetable';
import { getWeekInfo } from './dateUtils';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const SCHEDULED_TASKS_KEY = 'timetable_scheduled_tasks_v1';
const UNSCHEDULED_TASKS_KEY = 'timetable_unscheduled_tasks_v1';
const CATEGORIES_KEY = 'timetable_categories_v1';

// Initial sample unscheduled tasks
const INITIAL_UNSCHEDULED_TASKS: Task[] = [
  { id: 'unsched-1', title: 'DSA Practice', durationMinutes: 120, category: 'DSA', description: 'Solve LeetCode Top 150 Interview Questions' },
  { id: 'unsched-2', title: 'React Project', durationMinutes: 120, category: 'Development', description: 'Build component architecture and state management' },
  { id: 'unsched-3', title: 'DBMS Revision', durationMinutes: 90, category: 'Core CS', description: 'Review SQL Indexing & Normalization' },
  { id: 'unsched-4', title: 'Gym Workout', durationMinutes: 60, category: 'Exercise', description: 'Chest and Triceps day' },
  { id: 'unsched-5', title: 'Operating Systems', durationMinutes: 90, category: 'Core CS', description: 'Process synchronization & semaphores' },
  { id: 'unsched-6', title: 'College Assignment', durationMinutes: 60, category: 'College', description: 'Complete lab report submission' },
];

/**
 * Generate initial sample scheduled tasks for current week so user sees immediate visual magic.
 */
function getInitialScheduledTasks(currentWeekId: string): Task[] {
  return [
    {
      id: 'sample-1',
      title: 'DSA Practice',
      durationMinutes: 120,
      category: 'DSA',
      description: 'Binary Trees & Graphs practice',
      weekId: currentWeekId,
      dayOfWeek: 0, // Monday
      startTime: '10:00',
    },
    {
      id: 'sample-2',
      title: 'React Project',
      durationMinutes: 120,
      category: 'Development',
      description: 'Implement drag and drop features',
      weekId: currentWeekId,
      dayOfWeek: 1, // Tuesday
      startTime: '14:00',
    },
    {
      id: 'sample-3',
      title: 'DBMS Revision',
      durationMinutes: 90,
      category: 'Core CS',
      description: 'ACID properties and Transactions',
      weekId: currentWeekId,
      dayOfWeek: 2, // Wednesday
      startTime: '11:00',
    },
    {
      id: 'sample-4',
      title: 'Gym Session',
      durationMinutes: 60,
      category: 'Exercise',
      description: 'Evening workout',
      weekId: currentWeekId,
      dayOfWeek: 3, // Thursday
      startTime: '18:00',
    },
    {
      id: 'sample-5',
      title: 'Weekly Revision',
      durationMinutes: 90,
      category: 'Personal',
      description: 'Review weekly progress and notes',
      weekId: currentWeekId,
      dayOfWeek: 4, // Friday
      startTime: '16:00',
    },
  ];
}

/**
 * Load all scheduled tasks from localStorage.
 */
export function loadAllScheduledTasks(): Task[] {
  try {
    const raw = localStorage.getItem(SCHEDULED_TASKS_KEY);
    if (!raw) {
      const currentWeekInfo = getWeekInfo(new Date());
      const initial = getInitialScheduledTasks(currentWeekInfo.weekId);
      saveAllScheduledTasks(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load scheduled tasks from storage', e);
    return [];
  }
}

/**
 * Save all scheduled tasks to localStorage.
 */
export function saveAllScheduledTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(SCHEDULED_TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save scheduled tasks to storage', e);
  }
}

/**
 * Load unscheduled tasks from localStorage.
 */
export function loadUnscheduledTasks(): Task[] {
  try {
    const raw = localStorage.getItem(UNSCHEDULED_TASKS_KEY);
    if (!raw) {
      saveUnscheduledTasks(INITIAL_UNSCHEDULED_TASKS);
      return INITIAL_UNSCHEDULED_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load unscheduled tasks from storage', e);
    return INITIAL_UNSCHEDULED_TASKS;
  }
}

/**
 * Save unscheduled tasks to localStorage.
 */
export function saveUnscheduledTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(UNSCHEDULED_TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save unscheduled tasks to storage', e);
  }
}

/**
 * Load categories from localStorage, fallback to DEFAULT_CATEGORIES.
 */
export function loadCategories(): CategoryConfig[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed to load categories from storage', e);
    return DEFAULT_CATEGORIES;
  }
}

/**
 * Save categories to localStorage.
 */
export function saveCategories(categories: CategoryConfig[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories to storage', e);
  }
}

/**
 * User-specific cache helpers for instant reload persistence
 */
export function loadUserScheduledTasks(uid: string): Task[] {
  try {
    const raw = localStorage.getItem(`timetable_user_scheduled_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user scheduled tasks:', e);
  }
  return [];
}

export function saveUserScheduledTasks(uid: string, tasks: Task[]): void {
  try {
    localStorage.setItem(`timetable_user_scheduled_${uid}`, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save user scheduled tasks:', e);
  }
}

export function loadUserUnscheduledTasks(uid: string): Task[] {
  try {
    const raw = localStorage.getItem(`timetable_user_unscheduled_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user unscheduled tasks:', e);
  }
  return [];
}

export function saveUserUnscheduledTasks(uid: string, tasks: Task[]): void {
  try {
    localStorage.setItem(`timetable_user_unscheduled_${uid}`, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save user unscheduled tasks:', e);
  }
}

export function loadUserCategories(uid: string): CategoryConfig[] {
  try {
    const raw = localStorage.getItem(`timetable_user_categories_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load user categories:', e);
  }
  return DEFAULT_CATEGORIES;
}

export function saveUserCategories(uid: string, categories: CategoryConfig[]): void {
  try {
    localStorage.setItem(`timetable_user_categories_${uid}`, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save user categories:', e);
  }
}

export function loadUserTrashHistory(uid: string): any[] {
  try {
    const raw = localStorage.getItem(`timetable_user_trash_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user trash history:', e);
  }
  return [];
}

export function saveUserTrashHistory(uid: string, history: any[]): void {
  try {
    localStorage.setItem(`timetable_user_trash_${uid}`, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save user trash history:', e);
  }
}

