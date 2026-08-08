import React, { useState, useRef } from 'react';
import type { Task, WeekInfo, CategoryConfig } from '../types/timetable';
import { getCategoryConfig } from '../constants/categories';
import {
  formatWeekRange,
  formatTimeRange,
  toISODateString,
} from '../utils/dateUtils';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
} from 'lucide-react';

interface WeeklyAnalyticsProps {
  currentWeekInfo: WeekInfo;
  scheduledTasks: Task[];
  categories: CategoryConfig[];
  onDateChange: (newDate: Date) => void;
}

export const WeeklyAnalytics: React.FC<WeeklyAnalyticsProps> = ({
  currentWeekInfo,
  scheduledTasks,
  categories,
  onDateChange,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [hoveredTask, setHoveredTask] = useState<{
    task: Task;
    x: number;
    y: number;
  } | null>(null);

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

  const triggerDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const parts = e.target.value.split('-').map(Number);
      onDateChange(new Date(parts[0], parts[1] - 1, parts[2]));
    }
  };

  // Filter tasks for current visible week
  const weekTasks = scheduledTasks.filter((t) => t.weekId === currentWeekInfo.weekId);

  // Compute metrics
  const totalMinutes = weekTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Calculate day totals
  const dayTotals = currentWeekInfo.days.map((day) => {
    const tasksOnDay = weekTasks.filter((t) => t.dayOfWeek === day.dayIndex);
    const dayMins = tasksOnDay.reduce((sum, t) => sum + t.durationMinutes, 0);
    return {
      day,
      tasks: tasksOnDay,
      totalMinutes: dayMins,
      totalHours: dayMins / 60,
    };
  });

  // Find most active day
  const maxDay = [...dayTotals].sort((a, b) => b.totalMinutes - a.totalMinutes)[0];
  const mostActiveDayLabel = maxDay && maxDay.totalMinutes > 0
    ? `${maxDay.day.fullName} (${maxDay.totalHours.toFixed(1)}h)`
    : 'No tasks scheduled';

  // Category breakdown
  const categoryStats: Record<string, number> = {};
  weekTasks.forEach((t) => {
    categoryStats[t.category] = (categoryStats[t.category] || 0) + t.durationMinutes;
  });

  const topCategoryPair = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryPair ? topCategoryPair[0] : 'None';

  // Chart scaling (y-axis max hours, e.g. at least 8 hours or max + 2)
  const maxDayHours = Math.max(...dayTotals.map((d) => d.totalHours), 4);
  const yAxisMax = Math.ceil(maxDayHours + 1);
  const yTicks = [0, Math.round(yAxisMax * 0.25), Math.round(yAxisMax * 0.5), Math.round(yAxisMax * 0.75), yAxisMax];

  return (
    <div className="analytics-view-container">
      {/* Header Controls */}
      <div className="analytics-header-bar">
        <div className="analytics-title-group">
          <h2 className="analytics-main-title">Weekly Productivity Analytics</h2>
          <p className="analytics-subtitle">Time distribution by day and category</p>
        </div>

        <div className="analytics-controls">
          <div className="week-nav-group">
            <button onClick={handlePrevWeek} className="btn-nav" title="Previous Week">
              <ChevronLeft className="icon-sm" />
            </button>
            <div className="week-display-badge">
              <CalendarIcon className="icon-badge" />
              <span>{formatWeekRange(currentWeekInfo)}</span>
            </div>
            <button onClick={handleNextWeek} className="btn-nav" title="Next Week">
              <ChevronRight className="icon-sm" />
            </button>
          </div>

          <button onClick={handleToday} className="btn-today" title="Jump to current week">
            <RotateCcw className="icon-xs" />
            <span>Today</span>
          </button>

          <div className="date-picker-wrapper">
            <button type="button" className="btn-date-picker" onClick={triggerDatePicker}>
              <CalendarIcon className="icon-xs" />
              <span>Pick Date</span>
            </button>
            <input
              ref={dateInputRef}
              type="date"
              className="date-input-hidden"
              value={toISODateString(currentWeekInfo.mondayDate)}
              onChange={handleDateInputChange}
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box blue">
            <Clock className="icon-sm" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Time Scheduled</span>
            <span className="kpi-value">{totalHours} <span className="kpi-unit">hrs</span></span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box green">
            <CheckCircle2 className="icon-sm" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Tasks</span>
            <span className="kpi-value">{weekTasks.length} <span className="kpi-unit">tasks</span></span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box orange">
            <TrendingUp className="icon-sm" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Most Active Day</span>
            <span className="kpi-value-sm">{mostActiveDayLabel}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box purple">
            <Award className="icon-sm" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Top Category</span>
            <span className="kpi-value-sm">{topCategory}</span>
          </div>
        </div>
      </div>

      {/* Main Chart & Category Sidebar */}
      <div className="analytics-body-grid">
        {/* Stacked Bar Chart Box */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Daily Scheduled Task Hours (Stacked by Task)</h3>
            <span className="chart-legend-hint">Hover over segments to see task details</span>
          </div>

          <div className="bar-chart-container">
            {/* Y-Axis Labels */}
            <div className="y-axis-labels">
              {yTicks.slice().reverse().map((tick) => (
                <div key={tick} className="y-axis-tick">
                  <span>{tick}h</span>
                </div>
              ))}
            </div>

            {/* Bars Area */}
            <div className="chart-bars-area">
              {/* Horizontal Grid lines */}
              <div className="chart-grid-lines">
                {yTicks.slice().reverse().map((tick) => (
                  <div key={tick} className="chart-grid-line" />
                ))}
              </div>

              {/* 7 Daily Stacked Bars */}
              <div className="bars-columns-wrapper">
                {dayTotals.map(({ day, tasks, totalHours: dayHrs }) => (
                  <div key={day.isoDate} className="bar-column-item">
                    <div className="bar-stack-track">
                      {tasks.length === 0 ? (
                        <div className="empty-bar-slot" />
                      ) : (
                        tasks.map((task) => {
                          const catConfig = getCategoryConfig(categories, task.category);
                          const taskHrs = task.durationMinutes / 60;
                          const heightPct = (taskHrs / yAxisMax) * 100;

                          return (
                            <div
                              key={task.id}
                              className="bar-task-segment"
                              style={{
                                height: `${heightPct}%`,
                                backgroundColor: catConfig.borderColor,
                                borderColor: catConfig.borderColor,
                              }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredTask({
                                  task,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top - 8,
                                });
                              }}
                              onMouseLeave={() => setHoveredTask(null)}
                            >
                              {heightPct > 8 && (
                                <span className="segment-title-label">
                                  {task.title}
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* X-Axis Day Label */}
                    <div className={`x-axis-day-label ${day.isToday ? 'today' : ''}`}>
                      <span className="x-day-name">{day.name}</span>
                      <span className="x-day-date">{day.dateStr}</span>
                      <span className="x-day-total">
                        {dayHrs > 0 ? `${dayHrs.toFixed(1)}h` : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Sidebar */}
        <div className="category-breakdown-card">
          <h3 className="chart-card-title">Category Breakdown</h3>
          <p className="sidebar-hint">Time distribution by study category</p>

          <div className="category-progress-list">
            {categories.map((catConfig) => {
              const catMins = categoryStats[catConfig.name] || 0;
              const catHrs = (catMins / 60).toFixed(1);
              const pct = totalMinutes > 0 ? Math.round((catMins / totalMinutes) * 100) : 0;

              return (
                <div key={catConfig.id} className="category-progress-item">
                  <div className="cat-progress-header">
                    <span
                      className="cat-name-badge"
                      style={{ color: catConfig.textColor }}
                    >
                      {catConfig.name}
                    </span>
                    <span className="cat-hours-text">{catHrs} hrs ({pct}%)</span>
                  </div>
                  <div className="cat-progress-bar-bg">
                    <div
                      className="cat-progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: catConfig.borderColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover Tooltip Popup */}
      {hoveredTask && (
        <div
          className="chart-task-tooltip"
          style={{
            left: `${hoveredTask.x}px`,
            top: `${hoveredTask.y}px`,
          }}
        >
          <div className="tooltip-header">
            <span
              className="tooltip-cat-pill"
              style={{
                backgroundColor: getCategoryConfig(categories, hoveredTask.task.category).color,
                color: getCategoryConfig(categories, hoveredTask.task.category).textColor,
                borderColor: getCategoryConfig(categories, hoveredTask.task.category).borderColor,
              }}
            >
              {hoveredTask.task.category}
            </span>
            <span className="tooltip-time">
              {formatTimeRange(hoveredTask.task.startTime || '08:00', hoveredTask.task.durationMinutes)}
            </span>
          </div>

          <h4 className="tooltip-title">{hoveredTask.task.title}</h4>
          <p className="tooltip-duration">
            Duration: {(hoveredTask.task.durationMinutes / 60).toFixed(1)} hours ({hoveredTask.task.durationMinutes} mins)
          </p>
          {hoveredTask.task.description && (
            <p className="tooltip-desc">{hoveredTask.task.description}</p>
          )}
        </div>
      )}
    </div>
  );
};
