import React, { useState } from 'react';
import { X, Bell, Clock, Calendar, CheckCircle2, Radio, PlayCircle } from 'lucide-react';
import type { Task, CategoryConfig } from '../types/timetable';
import { formatTimeRange, formatDurationLabel } from '../utils/dateUtils';
import {
  requestNotificationPermission,
  isNotificationGranted,
  sendDesktopNotification,
  getTaskTimingStatus,
} from '../utils/notificationUtils';

interface TodayTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayTasks: Task[];
  categories: CategoryConfig[];
  onEditTask: (task: Task) => void;
}

export const TodayTasksModal: React.FC<TodayTasksModalProps> = ({
  isOpen,
  onClose,
  todayTasks,
  categories,
  onEditTask,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(isNotificationGranted());

  if (!isOpen) return null;

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      if (granted) {
        sendDesktopNotification(
          '🔔 Reminders Activated!',
          'You will receive popup notifications when your scheduled tasks begin today.'
        );
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content today-tasks-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h3 className="modal-title">
              <Calendar className="icon-sm text-primary" /> Today's Schedule ({todayTasks.length})
            </h3>
            <span className="today-date-badge">{todayStr}</span>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* Notification Permission Banner */}
          <div className="notification-permission-banner">
            <div className="banner-left">
              <Bell className="icon-sm text-primary" />
              <div>
                <div className="banner-title">Desktop Notifications</div>
                <div className="banner-sub">Get popup alerts when your scheduled tasks start</div>
              </div>
            </div>
            <button
              type="button"
              className={`btn-notification-toggle ${notificationsEnabled ? 'enabled' : ''}`}
              onClick={handleToggleNotifications}
            >
              {notificationsEnabled ? '🔔 Notifications ON' : '🔕 Enable Popup Reminders'}
            </button>
          </div>

          {/* Today Tasks List */}
          {todayTasks.length === 0 ? (
            <div className="empty-today-state">
              <Clock className="empty-icon" />
              <div className="empty-title">No tasks scheduled for today</div>
              <div className="empty-sub">Add or drag tasks onto today's column on the timetable grid!</div>
            </div>
          ) : (
            <div className="today-tasks-list">
              {todayTasks.map((task) => {
                const catObj = categories.find((c) => c.name === task.category);
                const catColor = catObj?.borderColor || '#3B82F6';
                const catBg = catObj?.color || '#EFF6FF';
                const catText = catObj?.textColor || '#1E40AF';

                const status = getTaskTimingStatus(task);
                const timeRangeStr = task.startTime
                  ? formatTimeRange(task.startTime, task.durationMinutes)
                  : '';

                return (
                  <div
                    key={task.id}
                    className={`today-task-item status-${status.toLowerCase()}`}
                    style={{ borderLeftColor: catColor }}
                    onClick={() => {
                      onClose();
                      onEditTask(task);
                    }}
                  >
                    <div className="item-header">
                      <div className="item-title-group">
                        <span
                          className="category-pill-sm"
                          style={{ backgroundColor: catBg, color: catText, borderColor: catColor }}
                        >
                          {task.category}
                        </span>
                        <h4 className="today-task-title">{task.title}</h4>
                      </div>

                      {/* Status Badge */}
                      {status === 'LIVE' && (
                        <span className="status-badge live">
                          <Radio className="icon-nano pulse-icon" /> LIVE NOW
                        </span>
                      )}
                      {status === 'UPCOMING' && (
                        <span className="status-badge upcoming">
                          <PlayCircle className="icon-nano" /> UPCOMING
                        </span>
                      )}
                      {status === 'COMPLETED' && (
                        <span className="status-badge completed">
                          <CheckCircle2 className="icon-nano" /> COMPLETED
                        </span>
                      )}
                    </div>

                    <div className="item-footer">
                      <span className="time-range-badge">
                        <Clock className="icon-nano" /> {timeRangeStr} ({formatDurationLabel(task.durationMinutes)})
                      </span>
                      {task.description && (
                        <p className="today-task-desc">{task.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <div className="spacer" />
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
