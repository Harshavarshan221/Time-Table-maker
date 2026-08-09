import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Task, CategoryConfig } from '../types/timetable';

/**
 * Subscribe to real-time updates for a specific week's scheduled tasks under users/{userId}/weeks/{weekId}/tasks.
 */
export function subscribeToWeekTasks(
  userId: string,
  weekId: string,
  onTasksUpdate: (tasks: Task[]) => void
): () => void {
  const tasksRef = collection(db, 'users', userId, 'weeks', weekId, 'tasks');
  
  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Untitled',
          durationMinutes: data.durationMinutes || 60,
          category: data.category || 'DSA',
          description: data.description || '',
          weekId: data.weekId || weekId,
          dayOfWeek: data.dayOfWeek ?? 0,
          startTime: data.startTime || '10:00',
        };
      });
      onTasksUpdate(tasks);
    },
    (error) => {
      console.warn('Firestore week tasks subscription notice:', error);
    }
  );
}

/**
 * Save or update a scheduled task in Cloud Firestore.
 */
export async function saveScheduledTaskToFirestore(
  userId: string,
  task: Task
): Promise<void> {
  if (!task.weekId || !task.id) return;
  const taskDocRef = doc(db, 'users', userId, 'weeks', task.weekId, 'tasks', task.id);
  
  const payload = {
    id: task.id,
    title: task.title,
    durationMinutes: task.durationMinutes,
    category: task.category,
    description: task.description || '',
    weekId: task.weekId,
    dayOfWeek: task.dayOfWeek ?? 0,
    startTime: task.startTime || '10:00',
    updatedAt: serverTimestamp(),
  };

  await setDoc(taskDocRef, payload, { merge: true });
}

/**
 * Delete a scheduled task from Cloud Firestore.
 */
export async function deleteScheduledTaskFromFirestore(
  userId: string,
  weekId: string,
  taskId: string
): Promise<void> {
  const taskDocRef = doc(db, 'users', userId, 'weeks', weekId, 'tasks', taskId);
  await deleteDoc(taskDocRef);
}

/**
 * Subscribe to unscheduled tasks under users/{userId}/unscheduledTasks.
 */
export function subscribeToUnscheduledTasks(
  userId: string,
  onTasksUpdate: (tasks: Task[]) => void
): () => void {
  const unscheduledRef = collection(db, 'users', userId, 'unscheduledTasks');

  return onSnapshot(
    unscheduledRef,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Untitled',
          durationMinutes: data.durationMinutes || 60,
          category: data.category || 'DSA',
          description: data.description || '',
        };
      });
      onTasksUpdate(tasks);
    },
    (error) => {
      console.warn('Firestore unscheduled tasks subscription notice:', error);
    }
  );
}

/**
 * Save or update an unscheduled task in Firestore.
 */
export async function saveUnscheduledTaskToFirestore(
  userId: string,
  task: Task
): Promise<void> {
  const taskDocRef = doc(db, 'users', userId, 'unscheduledTasks', task.id);
  await setDoc(
    taskDocRef,
    {
      id: task.id,
      title: task.title,
      durationMinutes: task.durationMinutes,
      category: task.category,
      description: task.description || '',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Delete an unscheduled task from Firestore.
 */
export async function deleteUnscheduledTaskFromFirestore(
  userId: string,
  taskId: string
): Promise<void> {
  const taskDocRef = doc(db, 'users', userId, 'unscheduledTasks', taskId);
  await deleteDoc(taskDocRef);
}

/**
 * Subscribe to user categories under users/{userId}/categories.
 */
export function subscribeToCategories(
  userId: string,
  onCategoriesUpdate: (categories: CategoryConfig[]) => void
): () => void {
  const catRef = collection(db, 'users', userId, 'categories');

  return onSnapshot(
    catRef,
    (snapshot) => {
      const categories: CategoryConfig[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          color: data.color,
          borderColor: data.borderColor,
          textColor: data.textColor,
        };
      });
      onCategoriesUpdate(categories);
    },
    (error) => {
      console.warn('Firestore categories subscription notice:', error);
    }
  );
}

/**
 * Save categories to Cloud Firestore.
 */
export async function saveCategoriesToFirestore(
  userId: string,
  categories: CategoryConfig[]
): Promise<void> {
  for (const cat of categories) {
    const catDocRef = doc(db, 'users', userId, 'categories', cat.id);
    await setDoc(catDocRef, cat, { merge: true });
  }
}

/**
 * Delete a single category from Cloud Firestore.
 */
export async function deleteCategoryFromFirestore(
  userId: string,
  categoryId: string
): Promise<void> {
  const catDocRef = doc(db, 'users', userId, 'categories', categoryId);
  await deleteDoc(catDocRef);
}
