import React, { useState } from 'react';
import type { WeekInfo, Task, CategoryConfig } from '../types/timetable';
import type { ClassItem, ClassStatus } from '../types/classes';
import { minutesToFormattedTime, pxToSnappedTime } from '../utils/dateUtils';
import { TaskCard } from './TaskCard';
import { ClassCard } from './classes/ClassCard';
import { Settings } from 'lucide-react';

interface TimetableGridProps {
  currentWeekInfo: WeekInfo;
  scheduledTasks: Task[];
  classes?: ClassItem[];
  categories: CategoryConfig[];
  startHour?: number;
  endHour?: number;
  hourHeightPx?: number;
  timeFormat?: '12h' | '24h';
  onDropTask: (
    taskId: string,
    dayIndex: number,
    startTime: string,
    sourceType: 'UNSCHEDULED_TASK' | 'SCHEDULED_TASK',
    rawTaskData?: Task
  ) => void;
  onEditTask: (task: Task) => void;
  onResizeTask: (taskId: string, newDurationMinutes: number) => void;
  onOpenGridSettings?: () => void;
  onUpdateClassStatus?: (classId: string, status: ClassStatus) => void;
  onDeleteClass?: (classId: string) => void;
  onSelectDate?: (date: Date) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  currentWeekInfo,
  scheduledTasks,
  classes = [],
  categories,
  startHour = 4,
  endHour = 28,
  hourHeightPx = 64,
  timeFormat = '12h',
  onDropTask,
  onEditTask,
  onResizeTask,
  onOpenGridSettings,
  onUpdateClassStatus,
  onDeleteClass,
  onSelectDate,
}) => {
  // Drag over drop indicator state
  const [dragOverInfo, setDragOverInfo] = useState<{
    dayIndex: number;
    startTime: string;
  } | null>(null);

  const totalHours = endHour - startHour;

  // Hours array [startHour, ..., endHour]
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  const handleDragOver = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const yPx = e.clientY - rect.top;
    const snappedStart = pxToSnappedTime(yPx, startHour, endHour, hourHeightPx);

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
    const snappedStart = pxToSnappedTime(yPx, startHour, endHour, hourHeightPx);

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
        <div
          className="time-header-cell clickable"
          onClick={onOpenGridSettings}
          title="Click to configure grid hours & row spacing"
        >
          <span className="time-zone-label">TIME</span>
          <Settings className="icon-nano time-settings-icon" />
        </div>
        <div className="days-header-cells">
          {currentWeekInfo.days.map((day) => (
            <div
              key={day.isoDate}
              className={`day-header-cell clickable ${day.isToday ? 'today' : ''}`}
              onClick={() => {
                const [y, m, d] = day.isoDate.split('-').map(Number);
                if (onSelectDate) onSelectDate(new Date(y, m - 1, d));
              }}
              title={`Click to select ${day.fullName} (${day.dateStr})`}
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
            const timeStr = minutesToFormattedTime(hour * 60, timeFormat);
            return (
              <div 
                key={hour} 
                className="time-slot-label clickable"
                onClick={onOpenGridSettings}
                title="Click to configure grid hours & row spacing"
                style={{ height: `${hourHeightPx}px` }}
              >
                <span className="time-text">{timeStr}</span>
                {idx < totalHours && <div className="half-hour-line" />}
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

            const dayClasses = classes.filter(
              (c) => c.dateStr === day.isoDate
            );

            const isHovered = dragOverInfo?.dayIndex === day.dayIndex;
            const dropHighlightTop = isHovered
              ? ( ( ( (parseInt(dragOverInfo.startTime.split(':')[0]) * 60 + parseInt(dragOverInfo.startTime.split(':')[1])) - (startHour * 60) ) / 60) * hourHeightPx )
              : 0;

            return (
              <div
                key={day.isoDate}
                className={`day-column ${day.isToday ? 'today-col' : ''} ${isHovered ? 'hover-active' : ''}`}
                onDragOver={(e) => handleDragOver(e, day.dayIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day.dayIndex)}
                style={{ height: `${totalHours * hourHeightPx}px` }}
              >
                {/* Background Hour & Half-Hour Grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="grid-hour-cell"
                    style={{ height: `${hourHeightPx}px` }}
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
                      height: `${hourHeightPx}px`, // 1 hour preview height
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
                    startHour={startHour}
                    hourHeightPx={hourHeightPx}
                    onEditTask={onEditTask}
                    onResizeTask={onResizeTask}
                  />
                ))}

                {/* Render Scheduled Lecture Class Cards */}
                {dayClasses.map((cls) => (
                  <ClassCard
                    key={cls.id}
                    classItem={cls}
                    startHour={startHour}
                    hourHeightPx={hourHeightPx}
                    onUpdateStatus={onUpdateClassStatus || (() => {})}
                    onDeleteClass={onDeleteClass || (() => {})}
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
