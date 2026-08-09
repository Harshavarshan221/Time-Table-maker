import React from 'react';
import { Plus, GripVertical, Trash2, Clock, PanelLeftClose, Copy } from 'lucide-react';
import type { Task, CategoryConfig } from '../types/timetable';
import { getCategoryConfig } from '../constants/categories';
import { formatDurationLabel } from '../utils/dateUtils';

interface UnscheduledTasksProps {
  tasks: Task[];
  categories: CategoryConfig[];
  onAddTaskClick: () => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask?: (task: Task) => void;
  onToggleSidebar?: () => void;
}

export const UnscheduledTasks: React.FC<UnscheduledTasksProps> = ({
  tasks,
  categories,
  onAddTaskClick,
  onDeleteTask,
  onEditTask,
  onDuplicateTask,
  onToggleSidebar,
}) => {
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'UNSCHEDULED_TASK',
      taskId: task.id,
      taskData: task,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="tasks-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-wrapper">
          <h2 className="sidebar-title">TASKS</h2>
          <span className="task-count-badge">{tasks.length}</span>
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
              title="Close Task Bar"
            >
              <PanelLeftClose className="icon-sm" />
            </button>
          )}
        </div>
      </div>

      <p className="sidebar-hint">
        Drag & drop tasks onto the timetable grid to schedule them.
      </p>

      <div className="unscheduled-task-list">
        {tasks.length === 0 ? (
          <div className="empty-tasks-state">
            <p className="empty-title">No unscheduled tasks</p>
            <p className="empty-desc">Click "+ Add Task" to create one or drop tasks back here to unschedule.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const catConfig = getCategoryConfig(categories, task.category);

            return (
              <div
                key={task.id}
                className="unscheduled-task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
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
                      title="Duplicate this task"
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
    </aside>
  );
};
