import type { Task } from '../types/timetable';
import { timeToMinutes } from './dateUtils';

/**
 * Request Browser Desktop Notification permissions.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Check if browser notification permissions are currently granted.
 */
export function isNotificationGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a native browser desktop notification.
 */
export function sendDesktopNotification(title: string, body: string, icon?: string) {
  if (isNotificationGranted()) {
    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        requireInteraction: false,
      });
    } catch (e) {
      console.error('Failed to trigger notification', e);
    }
  }
}

/**
 * Filter and sort scheduled tasks for today.
 */
export function getTodayTasks(allScheduledTasks: Task[], todayDayIndex: number, currentWeekId: string): Task[] {
  return allScheduledTasks
    .filter((t) => t.weekId === currentWeekId && t.dayOfWeek === todayDayIndex && t.startTime)
    .sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!));
}

/**
 * Check task status relative to current time: 'LIVE', 'UPCOMING', or 'COMPLETED'.
 */
export function getTaskTimingStatus(task: Task): 'LIVE' | 'UPCOMING' | 'COMPLETED' {
  if (!task.startTime) return 'UPCOMING';
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const startMins = timeToMinutes(task.startTime);
  const endMins = startMins + (task.durationMinutes || 60);

  if (currentMins >= startMins && currentMins < endMins) {
    return 'LIVE';
  }
  if (currentMins < startMins) {
    return 'UPCOMING';
  }
  return 'COMPLETED';
}
