import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { isSameDay } from '../utils/dateUtils';

interface ScrollableCalendarStripProps {
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
}

export const ScrollableCalendarStrip: React.FC<ScrollableCalendarStripProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Generate 35 days range (2 weeks before, current date, 2 weeks after)
  const days = React.useMemo(() => {
    const list: Date[] = [];
    const base = new Date();
    // 14 days before today
    for (let i = -14; i <= 20; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  // Scroll selected date into center view automatically on change
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedDate]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  const today = new Date();

  return (
    <div className="scrollable-calendar-bar">
      <div className="strip-title-badge">
        <CalendarIcon className="icon-xs text-primary" />
        <span className="strip-label-text">Calendar Navigator</span>
      </div>

      <button
        type="button"
        className="btn-strip-arrow btn-strip-left"
        onClick={handleScrollLeft}
        title="Scroll left"
      >
        <ChevronLeft className="icon-xs" />
      </button>

      <div className="calendar-strip-scroll" ref={scrollContainerRef}>
        {days.map((dateObj) => {
          const isSelected = isSameDay(dateObj, selectedDate);
          const isToday = isSameDay(dateObj, today);

          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

          return (
            <button
              key={dateObj.toISOString()}
              ref={isSelected ? activeItemRef : null}
              type="button"
              className={`calendar-date-card ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
              onClick={() => onDateChange(dateObj)}
            >
              {isToday && <span className="today-dot-indicator" title="Today" />}
              <span className="card-day-name">{dayName}</span>
              <span className="card-day-number">{dayNum}</span>
              <span className="card-month-name">{monthName}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-strip-arrow btn-strip-right"
        onClick={handleScrollRight}
        title="Scroll right"
      >
        <ChevronRight className="icon-xs" />
      </button>
    </div>
  );
};
