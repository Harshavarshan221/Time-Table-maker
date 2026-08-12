import React, { useState, useRef } from 'react';
import type { Task, CategoryConfig } from '../types/timetable';
import { getCategoryConfig } from '../constants/categories';
import {
  formatMonthYear,
  getWeeksInMonth,
  toISODateString,
  isAnalyticsEligible,
} from '../utils/dateUtils';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface MonthlyAnalyticsProps {
  scheduledTasks: Task[];
  categories: CategoryConfig[];
}

export const MonthlyAnalytics: React.FC<MonthlyAnalyticsProps> = ({
  scheduledTasks,
  categories,
}) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const dateInputRef = useRef<HTMLInputElement>(null);
  const now = new Date();

  const [hoveredSegment, setHoveredSegment] = useState<{
    weekLabel: string;
    category: string;
    hours: number;
    tasksCount: number;
    x: number;
    y: number;
  } | null>(null);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const triggerDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const parts = e.target.value.split('-').map(Number);
      setCurrentYear(parts[0]);
      setCurrentMonth(parts[1] - 1);
    }
  };

  // Get all weeks overlapping this month
  const weeks = getWeeksInMonth(currentYear, currentMonth);

  // Filter tasks to only include eligible past or current tasks for performance statistics
  const eligibleMonthlyTasks = scheduledTasks.filter((t) => {
    // Determine target ISO date string from task weekId and dayOfWeek
    const monday = new Date(t.weekId);
    if (isNaN(monday.getTime())) return false;
    const taskDate = new Date(monday);
    if (t.dayOfWeek !== undefined) {
      taskDate.setDate(monday.getDate() + t.dayOfWeek);
    }
    const isoDate = toISODateString(taskDate);
    return isAnalyticsEligible(isoDate, t.startTime, t.durationMinutes, 4, now);
  });

  const futureMonthlyTasksCount = scheduledTasks.length - eligibleMonthlyTasks.length;

  // Calculate statistics per week
  const weekDataList = weeks.map((weekInfo, idx) => {
    const weekTasks = eligibleMonthlyTasks.filter((t) => t.weekId === weekInfo.weekId);

    // Group tasks by category
    const catMinsMap: Record<string, { mins: number; tasks: Task[] }> = {};
    weekTasks.forEach((t) => {
      if (!catMinsMap[t.category]) {
        catMinsMap[t.category] = { mins: 0, tasks: [] };
      }
      catMinsMap[t.category].mins += t.durationMinutes;
      catMinsMap[t.category].tasks.push(t);
    });

    const totalMins = weekTasks.reduce((sum, t) => sum + t.durationMinutes, 0);

    return {
      weekIndex: idx + 1,
      weekInfo,
      weekTasks,
      totalMins,
      totalHours: totalMins / 60,
      catMinsMap,
    };
  });

  // Calculate overall monthly metrics
  const totalMonthlyMins = weekDataList.reduce((sum, w) => sum + w.totalMins, 0);
  const totalMonthlyHours = (totalMonthlyMins / 60).toFixed(1);
  const totalMonthlyTasks = weekDataList.reduce((sum, w) => sum + w.weekTasks.length, 0);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyAverageHours = (totalMonthlyMins / 60 / daysInMonth).toFixed(1);

  // Category totals for month
  const monthlyCategoryTotals: Record<string, number> = {};
  weekDataList.forEach((w) => {
    Object.entries(w.catMinsMap).forEach(([cat, data]) => {
      monthlyCategoryTotals[cat] = (monthlyCategoryTotals[cat] || 0) + data.mins;
    });
  });

  const topCategoryPair = Object.entries(monthlyCategoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryPair ? topCategoryPair[0] : 'None';

  // Y-axis max hours for weekly bars
  const maxWeeklyHours = Math.max(...weekDataList.map((w) => w.totalHours), 10);
  const yAxisMax = Math.ceil(maxWeeklyHours + 2);
  const yTicks = [0, Math.round(yAxisMax * 0.25), Math.round(yAxisMax * 0.5), Math.round(yAxisMax * 0.75), yAxisMax];

  return (
    <div className="analytics-view-container">
      {/* Header Controls */}
      <div className="analytics-header-bar">
        <div className="analytics-title-group">
          <h2 className="analytics-main-title">Monthly Productivity Analytics</h2>
          <p className="analytics-subtitle">Weekly progress and category totals for the month</p>
        </div>

        <div className="analytics-controls">
          <div className="week-nav-group">
            <button onClick={handlePrevMonth} className="btn-nav" title="Previous Month">
              <ChevronLeft className="icon-sm" />
            </button>
            <div className="week-display-badge">
              <CalendarIcon className="icon-badge" />
              <span>{formatMonthYear(currentYear, currentMonth)}</span>
            </div>
            <button onClick={handleNextMonth} className="btn-nav" title="Next Month">
              <ChevronRight className="icon-sm" />
            </button>
          </div>

          <div className="date-picker-wrapper">
            <button type="button" className="btn-date-picker" onClick={triggerDatePicker}>
              <CalendarIcon className="icon-xs" />
              <span>Pick Month Date</span>
            </button>
            <input
              ref={dateInputRef}
              type="date"
              className="date-input-hidden"
              value={toISODateString(new Date(currentYear, currentMonth, 1))}
              onChange={handleDateInputChange}
            />
          </div>
        </div>
      </div>

      {futureMonthlyTasksCount > 0 && (
        <div className="future-items-notice-banner margin-bottom-16">
          <CalendarIcon className="icon-xs text-blue" />
          <span>
            <strong>{futureMonthlyTasksCount} upcoming tasks</strong> are scheduled for future dates/times and are excluded from past productivity calculations.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box blue">
            <Clock className="icon-sm" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Monthly Hours</span>
            <span className="kpi-value">{totalMonthlyHours} <span className="kpi-unit">hrs</span></span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box green">
            <CheckCircle2 className="icon-sm" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Tasks Planned</span>
            <span className="kpi-value">{totalMonthlyTasks} <span className="kpi-unit">tasks</span></span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box orange">
            <TrendingUp className="icon-sm" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Daily Average</span>
            <span className="kpi-value">{dailyAverageHours} <span className="kpi-unit">hrs/day</span></span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box purple">
            <Award className="icon-sm" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Top Month Category</span>
            <span className="kpi-value-sm">{topCategory}</span>
          </div>
        </div>
      </div>

      {/* Main Chart & Category Summary */}
      <div className="analytics-body-grid">
        {/* Stacked Weekly Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Weekly Scheduled Hours (Stacked by Category)</h3>
            <span className="chart-legend-hint">Hover over category segments for details</span>
          </div>

          <div className="bar-chart-container">
            {/* Y Axis Labels */}
            <div className="y-axis-labels">
              {yTicks.slice().reverse().map((tick) => (
                <div key={tick} className="y-axis-tick">
                  <span>{tick}h</span>
                </div>
              ))}
            </div>

            {/* Bars Area */}
            <div className="chart-bars-area">
              <div className="chart-grid-lines">
                {yTicks.slice().reverse().map((tick) => (
                  <div key={tick} className="chart-grid-line" />
                ))}
              </div>

              <div className="bars-columns-wrapper">
                {weekDataList.map((weekItem) => {
                  const monDate = weekItem.weekInfo.mondayDate;
                  const sunDate = weekItem.weekInfo.sundayDate;
                  const weekDateRangeLabel = `${monDate.getDate()} - ${sunDate.getDate()} ${monDate.toLocaleString('default', { month: 'short' })}`;

                  return (
                    <div key={weekItem.weekInfo.weekId} className="bar-column-item">
                      <div className="bar-stack-track">
                        {weekItem.totalMins === 0 ? (
                          <div className="empty-bar-slot" />
                        ) : (
                          Object.entries(weekItem.catMinsMap).map(([catName, catData]) => {
                            const catConfig = getCategoryConfig(categories, catName);
                            const catHrs = catData.mins / 60;
                            const heightPct = (catHrs / yAxisMax) * 100;

                            return (
                              <div
                                key={catName}
                                className="bar-task-segment"
                                style={{
                                  height: `${heightPct}%`,
                                  backgroundColor: catConfig.borderColor,
                                  borderColor: catConfig.borderColor,
                                }}
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredSegment({
                                    weekLabel: `Week ${weekItem.weekIndex} (${weekDateRangeLabel})`,
                                    category: catName,
                                    hours: catHrs,
                                    tasksCount: catData.tasks.length,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 8,
                                  });
                                }}
                                onMouseLeave={() => setHoveredSegment(null)}
                              >
                                {heightPct > 8 && (
                                  <span className="segment-title-label">
                                    {catName}
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="x-axis-day-label">
                        <span className="x-day-name">Week {weekItem.weekIndex}</span>
                        <span className="x-day-date">{weekDateRangeLabel}</span>
                        <span className="x-day-total">
                          {weekItem.totalHours > 0 ? `${weekItem.totalHours.toFixed(1)}h` : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Category Totals */}
        <div className="category-breakdown-card">
          <h3 className="chart-card-title">Monthly Category Hours</h3>
          <p className="sidebar-hint">Total hours per category in {formatMonthYear(currentYear, currentMonth)}</p>

          <div className="category-progress-list">
            {categories.map((catConfig) => {
              const catMins = monthlyCategoryTotals[catConfig.name] || 0;
              const catHrs = (catMins / 60).toFixed(1);
              const pct = totalMonthlyMins > 0 ? Math.round((catMins / totalMonthlyMins) * 100) : 0;

              return (
                <div key={catConfig.id} className="category-progress-item">
                  <div className="cat-progress-header">
                    <span className="cat-name-badge" style={{ color: catConfig.textColor }}>
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

      {/* Tooltip Popup */}
      {hoveredSegment && (
        <div
          className="chart-task-tooltip"
          style={{
            left: `${hoveredSegment.x}px`,
            top: `${hoveredSegment.y}px`,
          }}
        >
          <div className="tooltip-header">
            <span
              className="tooltip-cat-pill"
              style={{
                backgroundColor: getCategoryConfig(categories, hoveredSegment.category).color,
                color: getCategoryConfig(categories, hoveredSegment.category).textColor,
                borderColor: getCategoryConfig(categories, hoveredSegment.category).borderColor,
              }}
            >
              {hoveredSegment.category}
            </span>
            <span className="tooltip-time">{hoveredSegment.weekLabel}</span>
          </div>

          <h4 className="tooltip-title">{hoveredSegment.category}: {hoveredSegment.hours.toFixed(1)} hrs</h4>
          <p className="tooltip-duration">
            Total {hoveredSegment.tasksCount} task(s) in this week
          </p>
        </div>
      )}
    </div>
  );
};
