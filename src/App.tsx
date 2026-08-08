import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import { WeekSelector } from './components/WeekSelector';
import { UnscheduledTasks } from './components/UnscheduledTasks';
import { TimetableGrid } from './components/TimetableGrid';
import { TaskModal } from './components/TaskModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { AuthModal } from './components/AuthModal';
import { ViewSwitcher } from './components/ViewSwitcher';
import type { AppView } from './components/ViewSwitcher';
import { AnalyticsView } from './components/AnalyticsView';
import type { Task, WeekInfo, CategoryConfig } from './types/timetable';
import { getWeekInfo } from './utils/dateUtils';
import {
  loadAllScheduledTasks,
  saveAllScheduledTasks,
  loadUnscheduledTasks,
  saveUnscheduledTasks,
  loadCategories,
  saveCategories,
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
} from './utils/firestoreStorage';
import { Calendar, Palette, LogIn, LogOut, CloudCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // View mode
  const [activeView, setActiveView] = useState<AppView>('grid');

  // Date and Week state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekInfo, setCurrentWeekInfo] = useState<WeekInfo>(() =>
    getWeekInfo(new Date())
  );

  // Tasks & Categories state
  const [allScheduledTasks, setAllScheduledTasks] = useState<Task[]>([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Initial local storage load fallback
  useEffect(() => {
    if (!currentUser) {
      setAllScheduledTasks(loadAllScheduledTasks());
      setUnscheduledTasks(loadUnscheduledTasks());
      setCategories(loadCategories());
    }
  }, [currentUser]);

  // Firestore Real-Time Subscriptions when User is Authenticated
  useEffect(() => {
    if (!currentUser) return;

    // 1. Subscribe to Current Week Tasks
    const unsubWeek = subscribeToWeekTasks(
      currentUser.uid,
      currentWeekInfo.weekId,
      (tasks) => {
        setAllScheduledTasks((prev) => {
          const otherWeeks = prev.filter((t) => t.weekId !== currentWeekInfo.weekId);
          return [...otherWeeks, ...tasks];
        });
      }
    );

    // 2. Subscribe to Unscheduled Tasks
    const unsubUnscheduled = subscribeToUnscheduledTasks(
      currentUser.uid,
      (tasks) => {
        setUnscheduledTasks(tasks);
      }
    );

    // 3. Subscribe to Custom Categories
    const unsubCategories = subscribeToCategories(
      currentUser.uid,
      (cats) => {
        if (cats.length > 0) setCategories(cats);
      }
    );

    return () => {
      unsubWeek();
      unsubUnscheduled();
      unsubCategories();
    };
  }, [currentUser, currentWeekInfo.weekId]);

  // Update currentWeekInfo whenever selectedDate changes
  useEffect(() => {
    setCurrentWeekInfo(getWeekInfo(selectedDate));
  }, [selectedDate]);

  // Task Update helper (Optimistic UI + Firestore/LocalStorage Sync)
  const updateScheduledTasks = (newTasks: Task[]) => {
    setAllScheduledTasks(newTasks);
    if (!currentUser) {
      saveAllScheduledTasks(newTasks);
    }
  };

  const updateUnscheduledTasks = (newTasks: Task[]) => {
    setUnscheduledTasks(newTasks);
    if (!currentUser) {
      saveUnscheduledTasks(newTasks);
    }
  };

  const handleSaveCategories = (newCategories: CategoryConfig[]) => {
    setCategories(newCategories);
    if (currentUser) {
      saveCategoriesToFirestore(currentUser.uid, newCategories);
    } else {
      saveCategories(newCategories);
    }
  };

  // Scheduled tasks filtered for current week
  const weekScheduledTasks = allScheduledTasks.filter(
    (t) => t.weekId === currentWeekInfo.weekId
  );

  // Drag & Drop onto grid
  const handleDropTask = (
    taskId: string,
    dayIndex: number,
    startTime: string,
    sourceType: 'UNSCHEDULED_TASK' | 'SCHEDULED_TASK',
    rawTaskData?: Task
  ) => {
    if (sourceType === 'UNSCHEDULED_TASK') {
      const task = unscheduledTasks.find((t) => t.id === taskId) || rawTaskData;
      if (!task) return;

      const remainingUnscheduled = unscheduledTasks.filter((t) => t.id !== taskId);
      updateUnscheduledTasks(remainingUnscheduled);

      const scheduledTask: Task = {
        ...task,
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
          title: taskData.title || 'New Task',
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
          title: taskData.title || 'New Task',
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

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const scheduledTask = allScheduledTasks.find((t) => t.id === taskId);
    updateScheduledTasks(allScheduledTasks.filter((t) => t.id !== taskId));
    updateUnscheduledTasks(unscheduledTasks.filter((t) => t.id !== taskId));

    if (currentUser) {
      if (scheduledTask && scheduledTask.weekId) {
        deleteScheduledTaskFromFirestore(currentUser.uid, scheduledTask.weekId, taskId);
      }
      deleteUnscheduledTaskFromFirestore(currentUser.uid, taskId);
    }
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
                <span className="user-name">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
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

          <button
            type="button"
            className="btn-categories-trigger"
            onClick={() => setIsCategoryManagerOpen(true)}
            title="Manage categories and colors"
          >
            <Palette className="icon-xs" />
            <span>Categories</span>
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
      {activeView === 'grid' && (
        <div className="main-layout">
          <UnscheduledTasks
            tasks={unscheduledTasks}
            categories={categories}
            onAddTaskClick={handleOpenCreateModal}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleOpenEditModal}
          />

          <main className="timetable-main">
            <TimetableGrid
              currentWeekInfo={currentWeekInfo}
              scheduledTasks={weekScheduledTasks}
              categories={categories}
              onDropTask={handleDropTask}
              onEditTask={handleOpenEditModal}
              onResizeTask={handleResizeTask}
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
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
