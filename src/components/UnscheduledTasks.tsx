import React from 'react';
import { Plus, GripVertical, Trash2, Clock, PanelLeftClose, Copy, GraduationCap } from 'lucide-react';
import type { Task, CategoryConfig } from '../types/timetable';
import type { ClassItem } from '../types/classes';
import { getCategoryConfig } from '../constants/categories';
import { formatDurationLabel } from '../utils/dateUtils';

interface UnscheduledTasksProps {
  tasks: Task[];
  classes?: ClassItem[];
  categories: CategoryConfig[];
  onAddTaskClick: () => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask?: (task: Task) => void;
  onDeleteClass?: (classId: string) => void;
  onEditClass?: (classItem: ClassItem) => void;
  onDuplicateClass?: (classItem: ClassItem) => void;
  onToggleSidebar?: () => void;
}

export const UnscheduledTasks: React.FC<UnscheduledTasksProps> = ({
  tasks,
  classes = [],
  categories,
  onAddTaskClick,
  onDeleteTask,
  onEditTask,
  onDuplicateTask,
  onDeleteClass,
  onEditClass,
  onDuplicateClass,
  onToggleSidebar,
}) => {
  const handleDragStartTask = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'UNSCHEDULED_TASK',
      taskId: task.id,
      taskData: task,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStartClass = (e: React.DragEvent, cls: ClassItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'CLASS',
      classId: cls.id,
      classData: cls,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const unscheduledClasses = classes.filter((c) => !c.dateStr || c.dateStr.trim() === '');

  return (
    <aside className="tasks-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-wrapper">
          <h2 className="sidebar-title">SIDEBAR</h2>
          <span className="task-count-badge">{tasks.length + unscheduledClasses.length}</span>
        </div>
        <div className="sidebar-header-right">
          <button
            onClick={onAddTaskClick}
            className="btn-add-task"
            title="Create a new unscheduled task"
          >
            <Plus className="icon-xs" />
            <span>Add Task</span>
          </button>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="btn-sidebar-close-icon"
              title="Close Sidebar"
            >
              <PanelLeftClose className="icon-sm" />
            </button>
          )}
        </div>
      </div>

      <p className="sidebar-hint">
        Drag & drop items onto the timetable grid to schedule them.
      </p>

      {/* TASKS SECTION */}
      <div className="sidebar-section-container">
        <div className="sidebar-section-header">
          <span className="section-title-label">TASKS</span>
          <span className="section-count-badge">{tasks.length}</span>
        </div>

        <div className="unscheduled-task-list">
          {tasks.length === 0 ? (
            <div className="empty-tasks-state">
              <p className="empty-title">No unscheduled tasks</p>
            </div>
          ) : (
            tasks.map((task) => {
              const catConfig = getCategoryConfig(categories, task.category);

              return (
                <div
                  key={task.id}
                  className="unscheduled-task-card"
                  draggable
                  onDragStart={(e) => handleDragStartTask(e, task)}
                  style={{
                    backgroundColor: catConfig.color,
                    borderLeftColor: catConfig.borderColor,
                  }}
                >
                  <div className="task-card-grip" title="Drag onto timetable grid">
                    <GripVertical className="icon-grip" />
                  </div>

                  <div 
                    className="task-card-content"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="task-card-header">
                      <span 
                        className="category-pill"
                        style={{ color: catConfig.textColor }}
                      >
                        {task.category}
                      </span>
                      <span className="duration-pill">
                        <Clock className="icon-nano" />
                        {formatDurationLabel(task.durationMinutes)}
                      </span>
                    </div>

                    <h3 className="task-card-title">{task.title}</h3>
                    {task.description && (
                      <p className="task-card-desc">{task.description}</p>
                    )}
                  </div>

                  <div className="task-card-actions">
                    {onDuplicateTask && (
                      <button
                        type="button"
                        className="btn-duplicate-task"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateTask(task);
                        }}
                        title="Duplicate task"
                      >
                        <Copy className="icon-nano" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-delete-task"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      title="Delete task"
                    >
                      <Trash2 className="icon-nano" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CLASSES SECTION */}
      <div className="sidebar-section-container margin-top-16">
        <div className="sidebar-section-header">
          <div className="flex-align-center gap-2">
            <GraduationCap className="icon-xs text-blue" />
            <span className="section-title-label text-blue">CLASSES</span>
          </div>
          <div className="flex-align-center gap-2">
            <span className="section-count-badge bg-blue-badge">{unscheduledClasses.length}</span>
          </div>
        </div>

        <div className="unscheduled-task-list">
          {unscheduledClasses.length === 0 ? (
            <div className="empty-tasks-state">
              <p className="empty-title">No unscheduled classes</p>
            </div>
          ) : (
            unscheduledClasses.map((cls) => (
              <div
                key={cls.id}
                className="unscheduled-task-card unscheduled-class-card"
                draggable
                onDragStart={(e) => handleDragStartClass(e, cls)}
                style={{
                  backgroundColor: '#F0F9FF',
                  borderLeftColor: '#0284C7',
                }}
              >
                <div className="task-card-grip" title="Drag onto timetable grid">
                  <GripVertical className="icon-grip" />
                </div>

                <div 
                  className="task-card-content"
                  onClick={() => onEditClass && onEditClass(cls)}
                >
                  <div className="task-card-header">
                    <span className="category-pill bg-class-pill">
                      🎓 CLASS
                    </span>
                    <span className="duration-pill text-blue">
                      Unscheduled
                    </span>
                  </div>

                  <h3 className="task-card-title text-dark">{cls.name}</h3>
                  {cls.notes && (
                    <p className="task-card-desc">{cls.notes}</p>
                  )}
                </div>

                <div className="task-card-actions">
                  {onDuplicateClass && (
                    <button
                      type="button"
                      className="btn-duplicate-task"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateClass(cls);
                      }}
                      title="Duplicate class"
                    >
                      <Copy className="icon-nano" />
                    </button>
                  )}
                  {onDeleteClass && (
                    <button
                      type="button"
                      className="btn-delete-task"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClass(cls.id);
                      }}
                      title="Delete class"
                    >
                      <Trash2 className="icon-nano" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
