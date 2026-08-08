import React, { useState } from 'react';
import type { WeekInfo, Task, CategoryConfig } from '../types/timetable';
import { START_HOUR, TOTAL_HOURS, HOUR_HEIGHT_PX } from '../constants/categories';
import { minutesToTime, pxToSnappedTime } from '../utils/dateUtils';
import { TaskCard } from './TaskCard';

interface TimetableGridProps {
  currentWeekInfo: WeekInfo;
  scheduledTasks: Task[];
  categories: CategoryConfig[];
  onDropTask: (
    taskId: string,
    dayIndex: number,
    startTime: string,
    sourceType: 'UNSCHEDULED_TASK' | 'SCHEDULED_TASK',
    rawTaskData?: Task
  ) => void;
  onEditTask: (task: Task) => void;
  onResizeTask: (taskId: string, newDurationMinutes: number) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  currentWeekInfo,
  scheduledTasks,
  categories,
  onDropTask,
  onEditTask,
  onResizeTask,
}) => {
  // Drag over drop indicator state
  const [dragOverInfo, setDragOverInfo] = useState<{
    dayIndex: number;
    startTime: string;
  } | null>(null);

  // Hours array [8, 9, 10, ..., 22]
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  const handleDragOver = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const yPx = e.clientY - rect.top;
    const snappedStart = pxToSnappedTime(yPx);

    setDragOverInfo({
      dayIndex,
      startTime: snappedStart,
    });
  };

  const handleDragLeave = () => {
    setDragOverInfo(null);
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    setDragOverInfo(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const yPx = e.clientY - rect.top;
    const snappedStart = pxToSnappedTime(yPx);

    try {
      const rawPayload = e.dataTransfer.getData('application/json');
      if (!rawPayload) return;

      const payload = JSON.parse(rawPayload);
      if (payload.taskId && (payload.type === 'UNSCHEDULED_TASK' || payload.type === 'SCHEDULED_TASK')) {
        onDropTask(payload.taskId, dayIndex, snappedStart, payload.type, payload.taskData);
      }
    } catch (err) {
      console.error('Failed to parse drag & drop data', err);
    }
  };

  return (
    <div className="timetable-grid-wrapper">
      {/* Header row with Day names */}
      <div className="grid-header-row">
        <div className="time-header-cell">
          <span className="time-zone-label">TIME</span>
        </div>
        <div className="days-header-cells">
          {currentWeekInfo.days.map((day) => (
            <div
              key={day.isoDate}
              className={`day-header-cell ${day.isToday ? 'today' : ''}`}
            >
              <span className="day-name">{day.name}</span>
              <span className="day-date">{day.dateStr}</span>
              {day.isToday && <span className="today-dot" title="Today" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Body */}
      <div className="grid-body">
        {/* Left Time Column */}
        <div className="time-column">
          {hours.map((hour, idx) => {
            const timeStr = minutesToTime(hour * 60);
            return (
              <div 
                key={hour} 
                className="time-slot-label"
                style={{ height: `${HOUR_HEIGHT_PX}px` }}
              >
                <span className="time-text">{timeStr}</span>
                {idx < TOTAL_HOURS && <div className="half-hour-line" />}
              </div>
            );
          })}
        </div>

        {/* 7 Day Columns */}
        <div className="days-columns-container">
          {currentWeekInfo.days.map((day) => {
            const dayTasks = scheduledTasks.filter(
              (t) => t.dayOfWeek === day.dayIndex
            );

            const isHovered = dragOverInfo?.dayIndex === day.dayIndex;
            const dropHighlightTop = isHovered
              ? ( ( ( (parseInt(dragOverInfo.startTime.split(':')[0]) * 60 + parseInt(dragOverInfo.startTime.split(':')[1])) - (START_HOUR * 60) ) / 60) * HOUR_HEIGHT_PX )
              : 0;

            return (
              <div
                key={day.isoDate}
                className={`day-column ${day.isToday ? 'today-col' : ''} ${isHovered ? 'hover-active' : ''}`}
                onDragOver={(e) => handleDragOver(e, day.dayIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day.dayIndex)}
                style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT_PX}px` }}
              >
                {/* Background Hour & Half-Hour Grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="grid-hour-cell"
                    style={{ height: `${HOUR_HEIGHT_PX}px` }}
                  >
                    <div className="grid-half-line" />
                  </div>
                ))}

                {/* Drop target preview indicator */}
                {isHovered && (
                  <div
                    className="drop-target-preview"
                    style={{
                      top: `${dropHighlightTop}px`,
                      height: `${HOUR_HEIGHT_PX}px`, // 1 hour preview height
                    }}
                  >
                    <span className="drop-preview-time">{dragOverInfo.startTime}</span>
                  </div>
                )}

                {/* Render Scheduled Task Cards */}
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    categories={categories}
                    onEditTask={onEditTask}
                    onResizeTask={onResizeTask}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
