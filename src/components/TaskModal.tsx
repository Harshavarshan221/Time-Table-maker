import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, Calendar, Tag, FileText, ArrowLeftRight, Settings, Copy } from 'lucide-react';
import type { Task, CategoryConfig, WeekInfo } from '../types/timetable';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  onUnschedule?: (taskId: string) => void;
  onDuplicate?: (task: Task) => void;
  taskToEdit?: Task | null;
  currentWeekInfo: WeekInfo;
  categories: CategoryConfig[];
  onOpenCategoryManager?: () => void;
  defaultDayIndex?: number;
  defaultStartTime?: string;
}

const DURATION_OPTIONS = [
  { label: '30 mins', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '2.5 hours', value: 150 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onUnschedule,
  onDuplicate,
  taskToEdit,
  currentWeekInfo,
  categories,
  onOpenCategoryManager,
  defaultDayIndex = 0,
  defaultStartTime = '10:00',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(categories[0]?.name || 'DSA');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [description, setDescription] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(defaultDayIndex);
  const [startTime, setStartTime] = useState(defaultStartTime);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setCategory(taskToEdit.category || categories[0]?.name || 'DSA');
      setDurationMinutes(taskToEdit.durationMinutes || 60);
      setDescription(taskToEdit.description || '');
      setIsScheduled(taskToEdit.dayOfWeek !== undefined && taskToEdit.startTime !== undefined);
      setDayOfWeek(taskToEdit.dayOfWeek ?? defaultDayIndex);
      setStartTime(taskToEdit.startTime ?? defaultStartTime);
    } else {
      setTitle('');
      setCategory(categories[0]?.name || 'DSA');
      setDurationMinutes(120);
      setDescription('');
      setIsScheduled(false);
      setDayOfWeek(defaultDayIndex);
      setStartTime(defaultStartTime);
    }
  }, [taskToEdit, isOpen, defaultDayIndex, defaultStartTime, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      category,
      durationMinutes,
      description: description.trim(),
      dayOfWeek: isScheduled ? dayOfWeek : undefined,
      startTime: isScheduled ? startTime : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <h3 className="modal-title">
              {taskToEdit ? 'Edit Task' : 'Create Task'}
            </h3>
            {taskToEdit && onDuplicate && (
              <button
                type="button"
                className="btn-duplicate-header"
                onClick={() => {
                  onDuplicate(taskToEdit);
                  onClose();
                }}
                title="Duplicate this task"
              >
                <Copy className="icon-xs" />
                <span>Duplicate</span>
              </button>
            )}
          </div>
          <button 
            className="btn-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="icon-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Task Name */}
          <div className="form-group">
            <label className="form-label">Task Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. DSA Practice, React Project, Gym"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Category Selector */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">
                <Tag className="icon-xs" />
                Category
              </label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  className="btn-text-link"
                  onClick={onOpenCategoryManager}
                >
                  <Settings className="icon-nano" />
                  <span>Manage Categories</span>
                </button>
              )}
            </div>

            <div className="category-selector-grid">
              {categories.map((cat) => {
                const isSelected = category === cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-chip ${isSelected ? 'selected' : ''}`}
                    style={{
                      backgroundColor: isSelected ? cat.borderColor : cat.color,
                      color: isSelected ? '#FFFFFF' : cat.textColor,
                      borderColor: cat.borderColor,
                    }}
                    onClick={() => setCategory(cat.name)}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="form-group">
            <label className="form-label">
              <Clock className="icon-xs" />
              Duration
            </label>
            <select
              className="form-select"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scheduling options toggle */}
          <div className="form-group schedule-toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
              />
              <span>Schedule on Timetable directly</span>
            </label>
          </div>

          {isScheduled && (
            <div className="scheduled-fields-column">
              <div className="scheduled-fields-row">
                {/* Specific Calendar Date Selection */}
                <div className="form-group flex-1">
                  <label className="form-label">
                    <Calendar className="icon-xs" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={currentWeekInfo.days[dayOfWeek]?.isoDate || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const parts = e.target.value.split('-').map(Number);
                        const chosen = new Date(parts[0], parts[1] - 1, parts[2]);
                        const dayIdx = (chosen.getDay() + 6) % 7; // Convert Sunday=0 to Mon=0
                        setDayOfWeek(dayIdx);
                      }
                    }}
                  />
                </div>

                {/* Day Selector */}
                <div className="form-group flex-1">
                  <label className="form-label">
                    <Calendar className="icon-xs" />
                    Day of Week
                  </label>
                  <select
                    className="form-select"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  >
                    {currentWeekInfo.days.map((d) => (
                      <option key={d.dayIndex} value={d.dayIndex}>
                        {d.fullName} ({d.dateStr})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Time */}
              <div className="form-group flex-1">
                <label className="form-label">
                  <Clock className="icon-xs" />
                  Start Time
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  step="1800" // 30 mins
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <FileText className="icon-xs" />
              Description (Optional)
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Add optional notes, topics, or goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="modal-actions">
            {taskToEdit && onDelete && (
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => {
                  onDelete(taskToEdit.id);
                  onClose();
                }}
              >
                <Trash2 className="icon-xs" />
                <span>Delete</span>
              </button>
            )}

            {taskToEdit && isScheduled && onUnschedule && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  onUnschedule(taskToEdit.id);
                  onClose();
                }}
                title="Move task to unscheduled sidebar"
              >
                <ArrowLeftRight className="icon-xs" />
                <span>Unschedule</span>
              </button>
            )}

            <div className="spacer" />

            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
