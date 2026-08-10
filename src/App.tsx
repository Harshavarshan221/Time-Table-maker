import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import { WeekSelector } from './components/WeekSelector';
import { UnscheduledTasks } from './components/UnscheduledTasks';
import { TimetableGrid } from './components/TimetableGrid';
import { TaskModal } from './components/TaskModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { AuthModal } from './components/AuthModal';
import { GridSettingsModal } from './components/GridSettingsModal';
import type { GridSettings } from './components/GridSettingsModal';
import { ViewSwitcher } from './components/ViewSwitcher';
import type { AppView } from './components/ViewSwitcher';
import { AnalyticsView } from './components/AnalyticsView';
import type { Task, WeekInfo, CategoryConfig } from './types/timetable';
import { getWeekInfo } from './utils/dateUtils';
import { DEFAULT_CATEGORIES } from './constants/categories';
import {
  loadAllScheduledTasks,
  saveAllScheduledTasks,
  loadUnscheduledTasks,
  saveUnscheduledTasks,
  loadCategories,
  saveCategories,
  loadUserScheduledTasks,
  saveUserScheduledTasks,
  loadUserUnscheduledTasks,
  saveUserUnscheduledTasks,
  loadUserCategories,
  saveUserCategories,
  loadUserTrashHistory,
  saveUserTrashHistory,
  loadGridSettings,
  saveGridSettings,
} from './utils/storage';
import {
  subscribeToWeekTasks,
  saveScheduledTaskToFirestore,
  deleteScheduledTaskFromFirestore,
  subscribeToUnscheduledTasks,
  saveUnscheduledTaskToFirestore,
  deleteUnscheduledTaskFromFirestore,
  subscribeToCategories,
  saveCategoriesToFirestore,
  deleteCategoryFromFirestore,
  saveGridSettingsToFirestore,
  subscribeToGridSettings,
  saveEmotionToFirestore,
  subscribeToDailyEmotions,
} from './utils/firestoreStorage';
import { Calendar, Palette, LogIn, LogOut, CloudCheck, PanelLeft, History, RotateCcw, X, Bell } from 'lucide-react';
import { TrashHistoryModal } from './components/TrashHistoryModal';
import type { DeletedTaskRecord } from './components/TrashHistoryModal';

import { TodayTasksModal } from './components/TodayTasksModal';
import { HomePage } from './components/HomePage';
import type { EmotionId } from './constants/emotions';
import { loadDailyEmotions, saveEmotionForDate } from './utils/emotionStorage';
import { toISODateString } from './utils/dateUtils';
import {
  getTodayTasks,
  sendDesktopNotification,
  isNotificationGranted,
} from './utils/notificationUtils';

export const App: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // View mode & Sidebar toggle state (Default to Home Page!)
  const [activeView, setActiveView] = useState<AppView>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Daily Emotions state per date (YYYY-MM-DD -> emotionId)
  const [dailyEmotionsMap, setDailyEmotionsMap] = useState<Record<string, EmotionId>>({});

  // Grid Settings state (hours & spacing)
  const [gridSettings, setGridSettings] = useState<GridSettings>(() => {
    try {
      const saved = localStorage.getItem('timetable_grid_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { startHour: 4, endHour: 24, hourHeightPx: 64 };
  });
  const [isGridSettingsModalOpen, setIsGridSettingsModalOpen] = useState(false);

  // Today's Tasks Modal state
  const [isTodayTasksModalOpen, setIsTodayTasksModalOpen] = useState(false);

  // Date and Week state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekInfo, setCurrentWeekInfo] = useState<WeekInfo>(() =>
    getWeekInfo(new Date())
  );

  // Tasks & Categories state
  const [allScheduledTasks, setAllScheduledTasks] = useState<Task[]>([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);

  // Trash & Delete History state
  const [deletedTasksHistory, setDeletedTasksHistory] = useState<DeletedTaskRecord[]>([]);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ message: string; record?: DeletedTaskRecord } | null>(null);

  // Calculate Today's Scheduled Tasks
  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0=Mon, ..., 6=Sun
  const todayWeekId = getWeekInfo(new Date()).weekId;
  const todayTasks = getTodayTasks(allScheduledTasks, todayDayIndex, todayWeekId);

  // Real-time task start notification checker (runs every 30 seconds)
  useEffect(() => {
    if (!isNotificationGranted()) return;

    const notifiedTaskIds = new Set<string>();

    const interval = setInterval(() => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      todayTasks.forEach((task) => {
        if (task.startTime && !notifiedTaskIds.has(task.id)) {
          const [h, m] = task.startTime.split(':').map(Number);
          const startMins = h * 60 + m;

          if (currentMins === startMins) {
            notifiedTaskIds.add(task.id);
            sendDesktopNotification(
              `⏰ Task Starting Now: ${task.title}`,
              `Category: ${task.category} | Duration: ${task.durationMinutes} mins`
            );
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [todayTasks]);

  // Save trash history to local storage
  useEffect(() => {
    try {
      localStorage.setItem('timetable_trash_history_v1', JSON.stringify(deletedTasksHistory));
    } catch (e) {
      console.error('Failed to save trash history:', e);
    }
  }, [deletedTasksHistory]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  // Auth observer & Redirect result handler
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.warn('Redirect auth notice:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper to check if task is an initial demo sample task (Strict Set check)
  const DEMO_SAMPLE_IDS = new Set([
    'sample-1', 'sample-2', 'sample-3', 'sample-4', 'sample-5',
    'unsched-1', 'unsched-2', 'unsched-3', 'unsched-4', 'unsched-5', 'unsched-6'
  ]);
  const isSampleTask = (t: Task) => DEMO_SAMPLE_IDS.has(t.id);

  // Tasks & Categories state initialization based on auth
  useEffect(() => {
    if (isAuthInitializing) return;

    if (currentUser) {
      const cachedScheduled = loadUserScheduledTasks(currentUser.uid).filter((t) => !isSampleTask(t));
      const cachedUnscheduled = loadUserUnscheduledTasks(currentUser.uid).filter((t) => !isSampleTask(t));

      setAllScheduledTasks(cachedScheduled);
      setUnscheduledTasks(cachedUnscheduled);
      const userCats = loadUserCategories(currentUser.uid);
      const safeCats = userCats && userCats.length > 0 ? userCats : DEFAULT_CATEGORIES;
      setCategories(safeCats);
      saveUserCategories(currentUser.uid, safeCats);
      saveCategoriesToFirestore(currentUser.uid, safeCats);
      setDeletedTasksHistory(loadUserTrashHistory(currentUser.uid));

      const emotions = loadDailyEmotions(currentUser.uid);
      const mappedEmotions: Record<string, EmotionId> = {};
      Object.entries(emotions).forEach(([d, entry]) => {
        if (entry?.emotionId) mappedEmotions[d] = entry.emotionId;
      });
      setDailyEmotionsMap(mappedEmotions);
    } else {
      setAllScheduledTasks(loadAllScheduledTasks());
      setUnscheduledTasks(loadUnscheduledTasks());
      setCategories(loadCategories());
      try {
        const raw = localStorage.getItem('timetable_trash_history_v1');
        setDeletedTasksHistory(raw ? JSON.parse(raw) : []);
      } catch (e) {
        setDeletedTasksHistory([]);
      }

      const emotions = loadDailyEmotions();
      const mappedEmotions: Record<string, EmotionId> = {};
      Object.entries(emotions).forEach(([d, entry]) => {
        if (entry?.emotionId) mappedEmotions[d] = entry.emotionId;
      });
      setDailyEmotionsMap(mappedEmotions);
    }
  }, [currentUser, isAuthInitializing]);

  // Firestore Real-Time Subscriptions when User is Authenticated
  useEffect(() => {
    if (!currentUser) return;

    // 1. Subscribe to Current Week Tasks (Non-destructive Firestore sync)
    const unsubWeek = subscribeToWeekTasks(
      currentUser.uid,
      currentWeekInfo.weekId,
      (tasks) => {
        const userTasks = tasks.filter((t) => !isSampleTask(t));
        setAllScheduledTasks((prev) => {
          if (userTasks.length > 0) {
            const otherWeeks = prev.filter((t) => t.weekId !== currentWeekInfo.weekId && !isSampleTask(t));
            const combined = [...otherWeeks, ...userTasks];
            saveUserScheduledTasks(currentUser.uid, combined);
            return combined;
          }
          // If Firestore is empty for this week, preserve local tasks & sync to Firestore
          const currentWeekLocalTasks = prev.filter((t) => t.weekId === currentWeekInfo.weekId && !isSampleTask(t));
          if (currentWeekLocalTasks.length > 0) {
            currentWeekLocalTasks.forEach((t) => saveScheduledTaskToFirestore(currentUser.uid, t));
          }
          return prev;
        });
      }
    );

    // 2. Subscribe to Unscheduled Tasks (Non-destructive Firestore sync)
    const unsubUnscheduled = subscribeToUnscheduledTasks(
      currentUser.uid,
      (tasks) => {
        const userTasks = tasks.filter((t) => !isSampleTask(t));
        setUnscheduledTasks((prev) => {
          if (userTasks.length > 0) {
            saveUserUnscheduledTasks(currentUser.uid, userTasks);
            return userTasks;
          }
          // If Firestore is empty, preserve local tasks & sync to Firestore
          const localUnscheduled = prev.filter((t) => !isSampleTask(t));
          if (localUnscheduled.length > 0) {
            localUnscheduled.forEach((t) => saveUnscheduledTaskToFirestore(currentUser.uid, t));
          }
          return prev;
        });
      }
    );

    // 3. Subscribe to Custom Categories (Non-destructive Map merge)
    const unsubCategories = subscribeToCategories(
      currentUser.uid,
      (cats) => {
        setCategories((prev) => {
          const map = new Map<string, CategoryConfig>();
          prev.forEach((c) => map.set(c.id, c));
          cats.forEach((c) => map.set(c.id, c));
          const merged = Array.from(map.values());
          saveUserCategories(currentUser.uid, merged);
          return merged;
        });
      }
    );

    // 4. Subscribe to Per-Week Independent Grid Settings
    const unsubGridSettings = subscribeToGridSettings(
      currentUser.uid,
      currentWeekInfo.weekId,
      (settings) => {
        if (settings && settings.startHour !== undefined) {
          setGridSettings(settings);
          saveGridSettings(settings, currentUser.uid, currentWeekInfo.weekId);
        }
      }
    );

    // 5. Subscribe to Daily Emotions
    const unsubEmotions = subscribeToDailyEmotions(currentUser.uid, (emotionsMap) => {
      if (emotionsMap) {
        const mapped: Record<string, EmotionId> = {};
        Object.entries(emotionsMap).forEach(([dateKey, val]) => {
          if (val?.emotionId) mapped[dateKey] = val.emotionId;
        });
        setDailyEmotionsMap((prev) => ({ ...prev, ...mapped }));
      }
    });

    return () => {
      unsubWeek();
      unsubUnscheduled();
      unsubCategories();
      unsubGridSettings();
      unsubEmotions();
    };
  }, [currentUser, currentWeekInfo.weekId]);

  // Handle emotion selection per date
  const handleSelectEmotion = (emotionId: EmotionId) => {
    const todayIso = toISODateString(selectedDate);
    saveEmotionForDate(todayIso, emotionId, currentUser?.uid);
    setDailyEmotionsMap((prev) => ({ ...prev, [todayIso]: emotionId }));
    if (currentUser) {
      saveEmotionToFirestore(currentUser.uid, todayIso, emotionId);
    }
  };

  // Sync & Load per-week independent grid settings when week or user changes
  useEffect(() => {
    const settings = loadGridSettings(currentUser?.uid, currentWeekInfo.weekId);
    setGridSettings(settings);
  }, [currentUser, currentWeekInfo.weekId]);

  // Update currentWeekInfo whenever selectedDate changes
  useEffect(() => {
    setCurrentWeekInfo(getWeekInfo(selectedDate));
  }, [selectedDate]);

  // Task Update helper (Optimistic UI + Firestore/LocalStorage Sync)
  const updateScheduledTasks = (newTasks: Task[]) => {
    setAllScheduledTasks(newTasks);
    if (currentUser) {
      saveUserScheduledTasks(currentUser.uid, newTasks);
    } else {
      saveAllScheduledTasks(newTasks);
    }
  };

  const updateUnscheduledTasks = (newTasks: Task[]) => {
    setUnscheduledTasks(newTasks);
    if (currentUser) {
      saveUserUnscheduledTasks(currentUser.uid, newTasks);
    } else {
      saveUnscheduledTasks(newTasks);
    }
  };

  // Safe Category Management (Updates categories without mutating tasks)
  const handleSaveCategories = (newCategories: CategoryConfig[]) => {
    setCategories(newCategories);

    if (currentUser) {
      saveUserCategories(currentUser.uid, newCategories);
      saveCategoriesToFirestore(currentUser.uid, newCategories);
    } else {
      saveCategories(newCategories);
    }
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) return;

    const remaining = categories.filter((c) => c.id !== catId);
    setCategories(remaining);

    if (currentUser) {
      saveUserCategories(currentUser.uid, remaining);
      deleteCategoryFromFirestore(currentUser.uid, catId);
    } else {
      saveCategories(remaining);
    }
  };

  // Scheduled tasks filtered for current week
  const weekScheduledTasks = allScheduledTasks.filter(
    (t) => t.weekId === currentWeekInfo.weekId
  );

  // Drag & drop task onto grid
  const handleDropTask = (taskId: string, dayIndex: number, startTime: string) => {
    const unscheduledTask = unscheduledTasks.find((t) => t.id === taskId);

    if (unscheduledTask) {
      const remainingUnscheduled = unscheduledTasks.filter((t) => t.id !== taskId);
      updateUnscheduledTasks(remainingUnscheduled);

      const scheduledTask: Task = {
        ...unscheduledTask,
        weekId: currentWeekInfo.weekId,
        dayOfWeek: dayIndex,
        startTime,
      };

      updateScheduledTasks([...allScheduledTasks, scheduledTask]);

      if (currentUser) {
        deleteUnscheduledTaskFromFirestore(currentUser.uid, taskId);
        saveScheduledTaskToFirestore(currentUser.uid, scheduledTask);
      }
    } else {
      const updated = allScheduledTasks.map((task) => {
        if (task.id === taskId) {
          const newTask = {
            ...task,
            weekId: currentWeekInfo.weekId,
            dayOfWeek: dayIndex,
            startTime,
          };
          if (currentUser) {
            saveScheduledTaskToFirestore(currentUser.uid, newTask);
          }
          return newTask;
        }
        return task;
      });
      updateScheduledTasks(updated);
    }
  };

  // Resize duration on grid
  const handleResizeTask = (taskId: string, newDurationMinutes: number) => {
    const updated = allScheduledTasks.map((t) => {
      if (t.id === taskId) {
        const newTask = { ...t, durationMinutes: newDurationMinutes };
        if (currentUser) {
          saveScheduledTaskToFirestore(currentUser.uid, newTask);
        }
        return newTask;
      }
      return t;
    });
    updateScheduledTasks(updated);
  };

  // Save task from Modal (Create or Edit)
  const handleSaveTask = (taskData: Partial<Task>) => {
    const defaultCat = categories[0]?.name || 'DSA';

    if (taskData.id) {
      const taskId = taskData.id;
      const isCurrentlyScheduled = allScheduledTasks.some((t) => t.id === taskId);

      if (isCurrentlyScheduled) {
        const updatedScheduled = allScheduledTasks.map((t) => {
          if (t.id === taskId) {
            const updatedTask: Task = {
              ...t,
              title: taskData.title || t.title,
              category: taskData.category || t.category,
              durationMinutes: taskData.durationMinutes || t.durationMinutes,
              description: taskData.description,
              dayOfWeek: taskData.dayOfWeek !== undefined ? taskData.dayOfWeek : t.dayOfWeek,
              startTime: taskData.startTime !== undefined ? taskData.startTime : t.startTime,
            };
            if (currentUser) {
              saveScheduledTaskToFirestore(currentUser.uid, updatedTask);
            }
            return updatedTask;
          }
          return t;
        });
        updateScheduledTasks(updatedScheduled);
      } else {
        if (taskData.dayOfWeek !== undefined && taskData.startTime !== undefined) {
          const taskToMove = unscheduledTasks.find((t) => t.id === taskId);
          const remainingUnscheduled = unscheduledTasks.filter((t) => t.id !== taskId);
          updateUnscheduledTasks(remainingUnscheduled);

          const newScheduledTask: Task = {
            id: taskId,
            title: taskData.title || taskToMove?.title || 'Untitled Task',
            category: taskData.category || taskToMove?.category || defaultCat,
            durationMinutes: taskData.durationMinutes || taskToMove?.durationMinutes || 60,
            description: taskData.description,
            weekId: currentWeekInfo.weekId,
            dayOfWeek: taskData.dayOfWeek,
            startTime: taskData.startTime,
          };
          updateScheduledTasks([...allScheduledTasks, newScheduledTask]);

          if (currentUser) {
            deleteUnscheduledTaskFromFirestore(currentUser.uid, taskId);
            saveScheduledTaskToFirestore(currentUser.uid, newScheduledTask);
          }
        } else {
          const updatedUnscheduled = unscheduledTasks.map((t) => {
            if (t.id === taskId) {
              const updatedTask: Task = {
                ...t,
                title: taskData.title || t.title,
                category: taskData.category || t.category,
                durationMinutes: taskData.durationMinutes || t.durationMinutes,
                description: taskData.description,
              };
              if (currentUser) {
                saveUnscheduledTaskToFirestore(currentUser.uid, updatedTask);
              }
              return updatedTask;
            }
            return t;
          });
          updateUnscheduledTasks(updatedUnscheduled);
        }
      }
    } else {
      const newId = `task-${Date.now()}`;
      if (taskData.dayOfWeek !== undefined && taskData.startTime) {
        const newScheduled: Task = {
          id: newId,
          title: taskData.title || 'Untitled Task',
          category: taskData.category || defaultCat,
          durationMinutes: taskData.durationMinutes || 60,
          description: taskData.description,
          weekId: currentWeekInfo.weekId,
          dayOfWeek: taskData.dayOfWeek,
          startTime: taskData.startTime,
        };
        updateScheduledTasks([...allScheduledTasks, newScheduled]);
        if (currentUser) {
          saveScheduledTaskToFirestore(currentUser.uid, newScheduled);
        }
      } else {
        const newUnscheduled: Task = {
          id: newId,
          title: taskData.title || 'Untitled Task',
          category: taskData.category || defaultCat,
          durationMinutes: taskData.durationMinutes || 60,
          description: taskData.description,
        };
        updateUnscheduledTasks([...unscheduledTasks, newUnscheduled]);
        if (currentUser) {
          saveUnscheduledTaskToFirestore(currentUser.uid, newUnscheduled);
        }
      }
    }
  };

  // Unschedule task
  const handleUnscheduleTask = (taskId: string) => {
    const task = allScheduledTasks.find((t) => t.id === taskId);
    if (!task) return;

    const remainingScheduled = allScheduledTasks.filter((t) => t.id !== taskId);
    updateScheduledTasks(remainingScheduled);

    const unscheduledItem: Task = {
      id: task.id,
      title: task.title,
      category: task.category,
      durationMinutes: task.durationMinutes,
      description: task.description,
    };
    updateUnscheduledTasks([...unscheduledTasks, unscheduledItem]);

    if (currentUser && task.weekId) {
      deleteScheduledTaskFromFirestore(currentUser.uid, task.weekId, taskId);
      saveUnscheduledTaskToFirestore(currentUser.uid, unscheduledItem);
    }
  };

  // Duplicate task -> Generates a brand new task in the TASKS sidebar section!
  const handleDuplicateTask = (task: Task) => {
    const newId = `task-${Date.now()}`;
    const duplicatedTask: Task = {
      id: newId,
      title: task.title,
      category: task.category,
      durationMinutes: task.durationMinutes,
      description: task.description || '',
    };

    const updated = [duplicatedTask, ...unscheduledTasks];
    updateUnscheduledTasks(updated);
    if (currentUser) {
      saveUnscheduledTaskToFirestore(currentUser.uid, duplicatedTask);
    }
  };

  // Precision Single Task Deletion (Deletes ONLY the target taskId & saves to Trash History)
  const handleDeleteTask = (taskId: string) => {
    const scheduledTask = allScheduledTasks.find((t) => t.id === taskId);
    const unscheduledTask = unscheduledTasks.find((t) => t.id === taskId);
    const targetTask = scheduledTask || unscheduledTask;
    if (!targetTask) return;

    if (scheduledTask) {
      const updated = allScheduledTasks.filter((t) => t.id !== taskId);
      updateScheduledTasks(updated);
      if (currentUser && scheduledTask.weekId) {
        deleteScheduledTaskFromFirestore(currentUser.uid, scheduledTask.weekId, taskId);
      }
    } else if (unscheduledTask) {
      const updated = unscheduledTasks.filter((t) => t.id !== taskId);
      updateUnscheduledTasks(updated);
      if (currentUser) {
        deleteUnscheduledTaskFromFirestore(currentUser.uid, taskId);
      }
    }

    // Save to Trash History
    const record: DeletedTaskRecord = { task: targetTask, deletedAt: Date.now() };
    const newHistory = [record, ...deletedTasksHistory];
    setDeletedTasksHistory(newHistory);

    if (currentUser) {
      saveUserTrashHistory(currentUser.uid, newHistory);
    } else {
      try {
        localStorage.setItem('timetable_trash_history_v1', JSON.stringify(newHistory));
      } catch (e) {}
    }

    setToastNotification({ message: `Deleted "${targetTask.title}"`, record });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.record === record ? null : prev));
    }, 8000);
  };

  // Restore Task from Trash History
  const handleRestoreTask = (record: DeletedTaskRecord) => {
    const task = record.task;

    if (task.weekId && task.dayOfWeek !== undefined && task.startTime !== undefined) {
      updateScheduledTasks([...allScheduledTasks, task]);
      if (currentUser) saveScheduledTaskToFirestore(currentUser.uid, task);
    } else {
      updateUnscheduledTasks([...unscheduledTasks, task]);
      if (currentUser) saveUnscheduledTaskToFirestore(currentUser.uid, task);
    }

    const newHistory = deletedTasksHistory.filter((r) => r !== record);
    setDeletedTasksHistory(newHistory);
    if (currentUser) {
      saveUserTrashHistory(currentUser.uid, newHistory);
    } else {
      try {
        localStorage.setItem('timetable_trash_history_v1', JSON.stringify(newHistory));
      } catch (e) {}
    }

    setToastNotification({ message: `Restored "${task.title}"` });
  };

  const handleRestoreAllTrash = () => {
    deletedTasksHistory.forEach((record) => {
      const task = record.task;
      if (task.weekId && task.dayOfWeek !== undefined && task.startTime !== undefined) {
        updateScheduledTasks([...allScheduledTasks, task]);
        if (currentUser) saveScheduledTaskToFirestore(currentUser.uid, task);
      } else {
        updateUnscheduledTasks([...unscheduledTasks, task]);
        if (currentUser) saveUnscheduledTaskToFirestore(currentUser.uid, task);
      }
    });

    setDeletedTasksHistory([]);
    if (currentUser) {
      saveUserTrashHistory(currentUser.uid, []);
    } else {
      localStorage.removeItem('timetable_trash_history_v1');
    }

    setIsTrashModalOpen(false);
    setToastNotification({ message: 'Restored all deleted tasks!' });
  };

  const handleClearTrash = () => {
    setDeletedTasksHistory([]);
    if (currentUser) {
      saveUserTrashHistory(currentUser.uid, []);
    } else {
      localStorage.removeItem('timetable_trash_history_v1');
    }
    setIsTrashModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">
            <Calendar className="logo-icon" />
          </div>
          <div>
            <h1 className="brand-title">Weekly Timetable</h1>
            <p className="brand-subtitle">Effortless study & task planner</p>
          </div>
        </div>

        <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />

        <div className="header-right-actions">
          {/* User Auth Profile Badge or Sign In button */}
          {currentUser ? (
            <div className="user-profile-badge">
              <div className="user-avatar">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
                ) : (
                  <span>{(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="user-info-text">
                <span className="user-name">{currentUser.displayName || currentUser.email}</span>
                {currentUser.displayName && currentUser.email && (
                  <span className="user-email-sub">{currentUser.email}</span>
                )}
                <span className="cloud-status"><CloudCheck className="icon-nano" /> Cloud Synced</span>
              </div>
              <button
                type="button"
                className="btn-signout"
                onClick={() => signOut(auth)}
                title="Sign Out"
              >
                <LogOut className="icon-xs" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-auth-signin"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <LogIn className="icon-xs" />
              <span>Sign In / Sync</span>
            </button>
          )}

          {/* Today's Tasks & Reminders Popup Trigger */}
          <button
            type="button"
            className="btn-today-tasks-trigger"
            onClick={() => setIsTodayTasksModalOpen(true)}
            title="View Today's Scheduled Tasks & Notifications"
          >
            <Bell className="icon-xs" />
            <span>Today's Schedule</span>
            {todayTasks.length > 0 && (
              <span className="today-tasks-count-badge">{todayTasks.length}</span>
            )}
          </button>

          <button
            type="button"
            className="btn-categories-trigger"
            onClick={() => setIsCategoryManagerOpen(true)}
            title="Manage categories and colors"
          >
            <Palette className="icon-xs" />
            <span>Categories</span>
          </button>

          {/* History & Trash Recovery Trigger */}
          <button
            type="button"
            className="btn-trash-trigger"
            onClick={() => setIsTrashModalOpen(true)}
            title="View Trash History & Restore Tasks"
          >
            <History className="icon-xs" />
            <span>Trash / History</span>
            {deletedTasksHistory.length > 0 && (
              <span className="trash-badge-count">{deletedTasksHistory.length}</span>
            )}
          </button>

          {activeView === 'grid' && (
            <WeekSelector
              currentWeekInfo={currentWeekInfo}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          )}
        </div>
      </header>

      {/* Main Content View */}
      {activeView === 'home' && (
        <HomePage
          currentUser={currentUser}
          selectedDate={selectedDate}
          todayTasks={todayTasks}
          allScheduledTasks={allScheduledTasks}
          categories={categories}
          currentEmotionId={dailyEmotionsMap[toISODateString(selectedDate)] || null}
          onSelectEmotion={handleSelectEmotion}
          onNavigateToGrid={() => setActiveView('grid')}
          onNavigateToAnalytics={() => setActiveView('analytics')}
          onOpenCreateTaskModal={handleOpenCreateModal}
          onOpenTrashModal={() => setIsTrashModalOpen(true)}
          onEditTask={handleOpenEditModal}
        />
      )}

      {activeView === 'grid' && (
        <div className={`main-layout ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
          {isSidebarOpen ? (
            <UnscheduledTasks
              tasks={unscheduledTasks}
              categories={categories}
              onAddTaskClick={handleOpenCreateModal}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleOpenEditModal}
              onDuplicateTask={handleDuplicateTask}
              onToggleSidebar={() => setIsSidebarOpen(false)}
            />
          ) : (
            <button
              type="button"
              className="btn-expand-tasks-floating"
              onClick={() => setIsSidebarOpen(true)}
              title="Show Tasks Sidebar"
            >
              <PanelLeft className="icon-sm" />
              <span>Show Tasks ({unscheduledTasks.length})</span>
            </button>
          )}

          <main className="timetable-main">
            <TimetableGrid
              currentWeekInfo={currentWeekInfo}
              scheduledTasks={weekScheduledTasks}
              categories={categories}
              startHour={gridSettings.startHour}
              endHour={gridSettings.endHour}
              hourHeightPx={gridSettings.hourHeightPx}
              timeFormat={gridSettings.timeFormat || '12h'}
              onDropTask={handleDropTask}
              onEditTask={handleOpenEditModal}
              onResizeTask={handleResizeTask}
              onOpenGridSettings={() => setIsGridSettingsModalOpen(true)}
            />
          </main>
        </div>
      )}

      {activeView === 'analytics' && (
        <AnalyticsView
          currentWeekInfo={currentWeekInfo}
          scheduledTasks={allScheduledTasks}
          categories={categories}
          onDateChange={setSelectedDate}
        />
      )}

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onUnschedule={handleUnscheduleTask}
        onDuplicate={handleDuplicateTask}
        taskToEdit={taskToEdit}
        currentWeekInfo={currentWeekInfo}
        categories={categories}
        onOpenCategoryManager={() => {
          setIsModalOpen(false);
          setIsCategoryManagerOpen(true);
        }}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Auth Sign In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Grid Settings Modal */}
      <GridSettingsModal
        isOpen={isGridSettingsModalOpen}
        onClose={() => setIsGridSettingsModalOpen(false)}
        settings={gridSettings}
        onSaveSettings={(newSettings) => {
          setGridSettings(newSettings);
          saveGridSettings(newSettings, currentUser?.uid, currentWeekInfo.weekId);
          if (currentUser) {
            saveGridSettingsToFirestore(currentUser.uid, currentWeekInfo.weekId, newSettings);
          }
        }}
      />

      {/* Today's Tasks Schedule & Notifications Modal */}
      <TodayTasksModal
        isOpen={isTodayTasksModalOpen}
        onClose={() => setIsTodayTasksModalOpen(false)}
        todayTasks={todayTasks}
        categories={categories}
        onEditTask={handleOpenEditModal}
      />

      {/* Trash History & Recovery Modal */}
      <TrashHistoryModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        deletedTasks={deletedTasksHistory}
        categories={categories}
        onRestoreTask={handleRestoreTask}
        onRestoreAll={handleRestoreAllTrash}
        onClearTrash={handleClearTrash}
      />

      {/* Floating Undo Toast Notification */}
      {toastNotification && (
        <div className="undo-toast-notification">
          <span>{toastNotification.message}</span>
          {toastNotification.record && (
            <button
              type="button"
              className="btn-toast-undo"
              onClick={() => {
                handleRestoreTask(toastNotification.record!);
                setToastNotification(null);
              }}
            >
              <RotateCcw className="icon-nano" />
              <span>Undo</span>
            </button>
          )}
          <button
            type="button"
            className="btn-toast-close"
            onClick={() => setToastNotification(null)}
          >
            <X className="icon-nano" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
