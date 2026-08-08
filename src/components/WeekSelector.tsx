import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import type { WeekInfo } from '../types/timetable';
import { formatWeekRange, toISODateString, getMonday } from '../utils/dateUtils';

interface WeekSelectorProps {
  currentWeekInfo: WeekInfo;
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeekInfo,
  selectedDate,
  onDateChange,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekInfo.mondayDate);
    prev.setDate(prev.getDate() - 7);
    onDateChange(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekInfo.mondayDate);
    next.setDate(next.getDate() + 7);
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const parts = e.target.value.split('-').map(Number);
      const chosen = new Date(parts[0], parts[1] - 1, parts[2]);
      onDateChange(chosen);
    }
  };

  const triggerDatePicker = () => {
    if (dateInputRef.current) {
      const input = dateInputRef.current;
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.click();
      }
    }
  };

  const isCurrentWeekToday = getMonday(new Date()).getTime() === currentWeekInfo.mondayDate.getTime();

  return (
    <div className="week-selector-container">
      <div className="week-nav-group">
        <button 
          onClick={handlePrevWeek}
          className="btn-nav"
          title="Previous Week"
          aria-label="Previous Week"
        >
          <ChevronLeft className="icon-sm" />
          <span>Previous Week</span>
        </button>

        <div className="week-display-badge">
          <CalendarIcon className="icon-badge" />
          <span className="week-range-text">{formatWeekRange(currentWeekInfo)}</span>
        </div>

        <button 
          onClick={handleNextWeek}
          className="btn-nav"
          title="Next Week"
          aria-label="Next Week"
        >
          <span>Next Week</span>
          <ChevronRight className="icon-sm" />
        </button>
      </div>

      <div className="week-actions-group">
        <button
          onClick={handleToday}
          className={`btn-today ${isCurrentWeekToday ? 'active' : ''}`}
          title="Jump to current week"
        >
          <RotateCcw className="icon-xs" />
          <span>Today</span>
        </button>

        <div className="date-picker-wrapper">
          <button 
            type="button" 
            className="btn-date-picker"
            onClick={triggerDatePicker}
            title="Select specific date"
          >
            <CalendarIcon className="icon-xs" />
            <span>Select Date</span>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            className="date-input-hidden"
            value={toISODateString(selectedDate)}
            onChange={handleDateInputChange}
          />
        </div>
      </div>
    </div>
  );
};
