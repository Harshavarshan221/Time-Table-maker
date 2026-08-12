import React, { useState } from 'react';
import { X, GraduationCap, Calendar, Clock, Repeat, Sparkles } from 'lucide-react';
import type { ClassItem } from '../../types/classes';

import { toISODateString, parseISODateString } from '../../utils/dateUtils';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onCreateClass: (
    newClass: Omit<ClassItem, 'id'>,
    repeatWeekday?: number,
    repeatThisMonth?: boolean
  ) => void;
}

const WEEKDAYS = [
  { id: 0, label: 'Monday' },
  { id: 1, label: 'Tuesday' },
  { id: 2, label: 'Wednesday' },
  { id: 3, label: 'Thursday' },
  { id: 4, label: 'Friday' },
  { id: 5, label: 'Saturday' },
  { id: 6, label: 'Sunday' },
];

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onCreateClass,
}) => {
  const defaultDateStr = toISODateString(selectedDate);
  const defaultWeekday = (selectedDate.getDay() + 6) % 7; // 0 = Mon, ..., 6 = Sun

  const [name, setName] = useState('');
  const [dateStr, setDateStr] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [repeatThisMonth, setRepeatThisMonth] = useState(false);
  const [repeatWeekday, setRepeatWeekday] = useState(defaultWeekday);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateClass(
      {
        name: name.trim(),
        dateStr,
        startTime,
        endTime,
        status: 'scheduled', // White by default!
      },
      repeatWeekday,
      repeatThisMonth
    );

    setName('');
    setRepeatThisMonth(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content class-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <div className="modal-icon-badge bg-blue">
              <GraduationCap className="icon-sm text-blue" />
            </div>
            <div>
              <h3 className="modal-title">Schedule a Class / Lecture</h3>
              <p className="modal-subtitle">Track lecture attendance separately from normal tasks</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X className="icon-xs" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body gap-16">
          <div className="form-group">
            <label className="form-label">Class / Subject Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. DSA Lecture, Operating Systems, Math III"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Date</label>
              <div className="input-with-icon">
                <Calendar className="icon-xs text-muted" />
                <input
                  type="date"
                  className="form-input"
                  value={dateStr}
                  onChange={(e) => {
                    setDateStr(e.target.value);
                    if (e.target.value) {
                      const d = parseISODateString(e.target.value);
                      if (!isNaN(d.getTime())) {
                        setRepeatWeekday((d.getDay() + 6) % 7);
                      }
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Start Time</label>
              <div className="input-with-icon">
                <Clock className="icon-xs text-muted" />
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">End Time</label>
              <div className="input-with-icon">
                <Clock className="icon-xs text-muted" />
                <input
                  type="time"
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Repeat Class Option */}
          <div className="repeat-class-section">
            <label className="checkbox-custom-label">
              <input
                type="checkbox"
                checked={repeatThisMonth}
                onChange={(e) => setRepeatThisMonth(e.target.checked)}
              />
              <div className="flex-align-center gap-2">
                <Repeat className="icon-xs text-purple" />
                <span className="checkbox-text font-bold">Repeat this class for the whole month</span>
              </div>
            </label>

            {repeatThisMonth && (
              <div className="weekday-selector-box margin-top-8">
                <span className="form-help-text margin-bottom-6">
                  Select weekday to repeat on remaining dates this month:
                </span>
                <div className="weekday-chip-grid">
                  {WEEKDAYS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className={`weekday-chip-btn ${repeatWeekday === w.id ? 'active' : ''}`}
                      onClick={() => setRepeatWeekday(w.id)}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Sparkles className="icon-xs" />
              <span>Schedule Class (⚪ White)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
