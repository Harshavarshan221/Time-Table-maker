import React, { useState, useEffect } from 'react';
import { WeekSelector } from './components/WeekSelector';
import { UnscheduledTasks } from './components/UnscheduledTasks';
import { TimetableGrid } from './components/TimetableGrid';
import { TaskModal } from './components/TaskModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
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
import { Calendar, Palette } from 'lucide-react';

export const App: React.FC = () => {
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

  // Load state from localStorage on mount
  useEffect(() => {
    setAllScheduledTasks(loadAllScheduledTasks());
    setUnscheduledTasks(loadUnscheduledTasks());
    setCategories(loadCategories());
  }, []);

  // Update currentWeekInfo whenever selectedDate changes
  useEffect(() => {
    setCurrentWeekInfo(getWeekInfo(selectedDate));
  }, [selectedDate]);

  // Save changes to localStorage whenever task arrays or categories update
  const updateScheduledTasks = (newTasks: Task[]) => {
    setAllScheduledTasks(newTasks);
    saveAllScheduledTasks(newTasks);
  };

  const updateUnscheduledTasks = (newTasks: Task[]) => {
    setUnscheduledTasks(newTasks);
    saveUnscheduledTasks(newTasks);
  };

  const handleSaveCategories = (newCategories: CategoryConfig[]) => {
    setCategories(newCategories);
    saveCategories(newCategories);
  };

  // Scheduled tasks filtered specifically for the current visible week
  const weekScheduledTasks = allScheduledTasks.filter(
    (t) => t.weekId === currentWeekInfo.weekId
  );

  // Handle Drag & Drop onto grid
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
    } else {
      const updated = allScheduledTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            weekId: currentWeekInfo.weekId,
            dayOfWeek: dayIndex,
            startTime,
          };
        }
        return task;
      });
      updateScheduledTasks(updated);
    }
  };

  // Handle resizing task duration on grid
  const handleResizeTask = (taskId: string, newDurationMinutes: number) => {
    const updated = allScheduledTasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, durationMinutes: newDurationMinutes };
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
            return {
              ...t,
              title: taskData.title || t.title,
              category: taskData.category || t.category,
              durationMinutes: taskData.durationMinutes || t.durationMinutes,
              description: taskData.description,
              dayOfWeek: taskData.dayOfWeek !== undefined ? taskData.dayOfWeek : t.dayOfWeek,
              startTime: taskData.startTime !== undefined ? taskData.startTime : t.startTime,
            };
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
        } else {
          const updatedUnscheduled = unscheduledTasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                title: taskData.title || t.title,
                category: taskData.category || t.category,
                durationMinutes: taskData.durationMinutes || t.durationMinutes,
                description: taskData.description,
              };
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
      } else {
        const newUnscheduled: Task = {
          id: newId,
          title: taskData.title || 'New Task',
          category: taskData.category || defaultCat,
          durationMinutes: taskData.durationMinutes || 60,
          description: taskData.description,
        };
        updateUnscheduledTasks([...unscheduledTasks, newUnscheduled]);
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
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    updateScheduledTasks(allScheduledTasks.filter((t) => t.id !== taskId));
    updateUnscheduledTasks(unscheduledTasks.filter((t) => t.id !== taskId));
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
    </div>
  );
};

export default App;
