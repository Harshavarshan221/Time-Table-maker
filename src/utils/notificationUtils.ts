import type { Task } from '../types/timetable';
import { timeToMinutes } from './dateUtils';

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register Service Worker for OS System-Level Background Notifications.
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered for system notifications:', swRegistration);
    } catch (e) {
      console.warn('Service Worker registration failed:', e);
    }
  }
}

// Auto-register SW on module load
registerServiceWorker();

/**
 * Play a pleasant laptop notification sound chime using Web Audio API.
 */
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // High note 1 (880Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // High note 2 (1320Hz - E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn('Could not play notification audio chime', e);
  }
}

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
 * Send a native OS system-level laptop notification (pops up over other apps/websites).
 */
export function sendDesktopNotification(title: string, body: string, icon?: string) {
  if (!isNotificationGranted()) return;

  // 1. Play audio chime alert on laptop
  playNotificationChime();

  const options: NotificationOptions = {
    body,
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: true, // Pinned on Windows/Mac desktop banner on top of other websites until clicked
    tag: `task-reminder-${Date.now()}`,
  };

  // 2. Trigger via Service Worker for true OS background notification
  if (swRegistration && swRegistration.showNotification) {
    swRegistration.showNotification(title, options).catch(() => {
      new Notification(title, options);
    });
  } else {
    try {
      new Notification(title, options);
    } catch (e) {
      console.error('Failed to trigger desktop notification', e);
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
