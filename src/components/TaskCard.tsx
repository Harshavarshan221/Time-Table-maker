import React, { useState } from 'react';
import { GripVertical, Clock } from 'lucide-react';
import type { Task, CategoryConfig } from '../types/timetable';
import { getCategoryConfig, HOUR_HEIGHT_PX } from '../constants/categories';
import { timeToTopPx, durationToHeightPx, formatTimeRange, snapDuration } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  categories: CategoryConfig[];
  onEditTask: (task: Task) => void;
  onResizeTask: (taskId: string, newDurationMinutes: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  categories,
  onEditTask,
  onResizeTask,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizePreviewDuration, setResizePreviewDuration] = useState<number | null>(null);

  const catConfig = getCategoryConfig(categories, task.category);
  const currentDuration = resizePreviewDuration ?? task.durationMinutes;

  const topPx = timeToTopPx(task.startTime || '08:00');
  const heightPx = durationToHeightPx(currentDuration);

  // Drag start for moving task around the grid
  const handleDragStart = (e: React.DragEvent) => {
    if (isResizing) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'SCHEDULED_TASK',
        taskId: task.id,
        taskData: task,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  // Resize handler using pointer/mouse drag on bottom handle
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    const startY = e.clientY;
    const initialDuration = task.durationMinutes;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMinutes = (deltaY / HOUR_HEIGHT_PX) * 60;
      const rawNewDuration = initialDuration + deltaMinutes;
      const snapped = snapDuration(rawNewDuration);
      setResizePreviewDuration(snapped);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);

      setResizePreviewDuration((finalDuration) => {
        if (finalDuration !== null && finalDuration !== task.durationMinutes) {
          onResizeTask(task.id, finalDuration);
        }
        return null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`scheduled-task-card ${isResizing ? 'resizing' : ''}`}
      style={{
        top: `${topPx}px`,
        height: `${Math.max(28, heightPx)}px`,
        backgroundColor: catConfig.color,
        borderLeftColor: catConfig.borderColor,
      }}
      draggable={!isResizing}
      onDragStart={handleDragStart}
      onClick={() => {
        if (!isResizing) onEditTask(task);
      }}
    >
      <div className="scheduled-card-inner">
        <div className="card-top-row">
          <span 
            className="scheduled-category-pill"
            style={{ color: catConfig.textColor }}
          >
            {task.category}
          </span>
          <span className="scheduled-time-pill">
            <Clock className="icon-nano" />
            {formatTimeRange(task.startTime || '08:00', currentDuration)}
          </span>
          <span className="card-drag-icon" title="Drag to move">
            <GripVertical className="icon-nano" />
          </span>
        </div>

        <h4 className="scheduled-card-title">{task.title}</h4>

        {heightPx > 50 && task.description && (
          <p className="scheduled-card-desc">{task.description}</p>
        )}
      </div>

      {/* Bottom resize edge handle */}
      <div
        className="task-resize-handle"
        onMouseDown={handleResizeStart}
        title="Drag bottom edge to adjust duration"
      >
        <div className="resize-handle-bar" />
      </div>
    </div>
  );
};
