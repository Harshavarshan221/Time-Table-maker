import React, { useRef } from 'react';
import type { Task, WeekInfo, CategoryConfig } from '../types/timetable';
import type { ClassItem } from '../types/classes';
import type { CTRItem } from '../types/ctrs';
import { getCategoryConfig } from '../constants/categories';
import {
  formatWeekRange,
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
  RotateCcw,
  GraduationCap,
  Hash,
} from 'lucide-react';
import { UnifiedAnalyticsBarChart } from './analytics/UnifiedAnalyticsBarChart';
import type { ChartColumnData } from './analytics/UnifiedAnalyticsBarChart';

export type AnalyticsMode = 'tasks' | 'classes' | 'ctrs';

interface WeeklyAnalyticsProps {
  currentWeekInfo: WeekInfo;
  scheduledTasks: Task[];
  classes?: ClassItem[];
  ctrs?: CTRItem[];
  categories: CategoryConfig[];
  mode?: AnalyticsMode;
  onDateChange: (newDate: Date) => void;
}

export const WeeklyAnalytics: React.FC<WeeklyAnalyticsProps> = ({
  currentWeekInfo,
  scheduledTasks,
  classes = [],
  ctrs = [],
  categories,
  mode = 'tasks',
  onDateChange,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const now = new Date();

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
        dateInputRef.current.focus();
      }
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const parts = e.target.value.split('-').map(Number);
      onDateChange(new Date(parts[0], parts[1] - 1, parts[2]));
    }
  };

  const weekIsoDates = currentWeekInfo.days.map((d) => d.isoDate);

  // ==================== 1. TASK MODE PREPARATION ====================
  const rawWeekTasks = scheduledTasks.filter((t) => t.weekId === currentWeekInfo.weekId);
  const weekTasks = rawWeekTasks.filter((t) => {
    const day = currentWeekInfo.days.find((d) => d.dayIndex === t.dayOfWeek);
    const isoDate = day ? day.isoDate : currentWeekInfo.weekId;
    return isAnalyticsEligible(isoDate, t.startTime, t.durationMinutes, 4, now);
  });
  const futureWeekTasksCount = rawWeekTasks.length - weekTasks.length;

  const totalMinutes = weekTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

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

  const maxDayHours = Math.max(...dayTotals.map((d) => d.totalHours), 4);
  const taskYMax = Math.ceil(maxDayHours + 1);
  const taskYTicks = [0, Math.round(taskYMax * 0.25), Math.round(taskYMax * 0.5), Math.round(taskYMax * 0.75), taskYMax];

  const taskColumns: ChartColumnData[] = dayTotals.map(({ day, tasks, totalHours: dayHrs }) => ({
    id: day.isoDate,
    label: day.name,
    subLabel: day.dateStr,
    totalValue: dayHrs,
    isToday: day.isToday,
    segments: tasks.map((task) => {
      const catConfig = getCategoryConfig(categories, task.category);
      return {
        id: task.id,
        title: task.title,
        value: task.durationMinutes / 60,
        color: catConfig.borderColor,
        categoryName: task.category,
      };
    }),
  }));

  const maxDay = [...dayTotals].sort((a, b) => b.totalMinutes - a.totalMinutes)[0];
  const mostActiveDayLabel = maxDay && maxDay.totalMinutes > 0
    ? `${maxDay.day.fullName} (${maxDay.totalHours.toFixed(1)}h)`
    : 'No tasks scheduled';

  const categoryStats: Record<string, number> = {};
  weekTasks.forEach((t) => {
    categoryStats[t.category] = (categoryStats[t.category] || 0) + t.durationMinutes;
  });
  const topCategoryPair = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryPair ? topCategoryPair[0] : 'None';

  // ==================== 2. CLASS MODE PREPARATION ====================
  const subjectMap: Record<string, { attended: number; missed: number; cancelled: number; upcoming: number }> = {};
  
  classes.forEach((c) => {
    if (!subjectMap[c.name]) {
      subjectMap[c.name] = { attended: 0, missed: 0, cancelled: 0, upcoming: 0 };
    }
  });

  classes.forEach((c) => {
    if (!weekIsoDates.includes(c.dateStr)) return;
    const isEligible = isAnalyticsEligible(c.dateStr, c.startTime, 60, 4, now);
    if (!isEligible) {
      subjectMap[c.name].upcoming += 1;
      return;
    }
    if (c.status === 'attended') subjectMap[c.name].attended += 1;
    else if (c.status === 'missed') subjectMap[c.name].missed += 1;
    else if (c.status === 'cancelled') subjectMap[c.name].cancelled += 1;
  });

  const classColumns: ChartColumnData[] = Object.entries(subjectMap)
    .filter(([_, stats]) => stats.attended + stats.missed > 0)
    .map(([name, stats]) => {
      const due = stats.attended + stats.missed;
      const pct = Math.round((stats.attended / due) * 100);
      return {
        id: name,
        label: name,
        subLabel: `${pct}%`,
        totalValue: pct,
        segments: [
          {
            id: `${name}_pct`,
            title: name,
            value: pct,
            color: pct >= 75 ? '#10B981' : pct >= 50 ? '#F97316' : '#EF4444',
          },
        ],
        tooltipTitle: name,
        tooltipLines: [
          `Attendance: ${pct}%`,
          `${stats.attended} attended · ${stats.missed} missed`,
          `Cancelled: ${stats.cancelled} · Upcoming: ${stats.upcoming}`,
        ],
      };
    });

  const classAttendedSum = Object.values(subjectMap).reduce((acc, s) => acc + s.attended, 0);
  const classMissedSum = Object.values(subjectMap).reduce((acc, s) => acc + s.missed, 0);
  const classCancelledSum = Object.values(subjectMap).reduce((acc, s) => acc + s.cancelled, 0);
  const classTotalDue = classAttendedSum + classMissedSum;
  const overallAttendancePct = classTotalDue > 0 ? Math.round((classAttendedSum / classTotalDue) * 100) : 0;

  // ==================== 3. CTR MODE PREPARATION ====================
  const ctrColumns: ChartColumnData[] = ctrs.map((c) => {
    let totalCount = 0;
    const counts: number[] = [];

    currentWeekInfo.days.forEach((day) => {
      const isEligible = isAnalyticsEligible(day.isoDate, '00:00', 0, 4, now);
      if (isEligible) {
        const val = c.dailyValues[day.isoDate] || 0;
        totalCount += val;
        counts.push(val);
      }
    });

    const avg = counts.length > 0 ? totalCount / counts.length : 0;
    const highest = counts.length > 0 ? Math.max(...counts, 0) : 0;

    return {
      id: c.id,
      label: c.name,
      subLabel: `${totalCount}`,
      totalValue: totalCount,
      segments: [
        {
          id: `${c.id}_ctr`,
          title: c.name,
          value: totalCount,
          color: c.color,
        },
      ],
      tooltipTitle: c.name,
      tooltipLines: [
        `Total: ${totalCount}`,
        `Daily average: ${avg.toFixed(1)}`,
        `Highest day: ${highest}`,
      ],
    };
  });

  const maxCTRCount = Math.max(...ctrColumns.map((col) => col.totalValue), 0);
  const ctrYMax = Math.max(10, Math.ceil(maxCTRCount * 1.15));
  const ctrYTicks = [0, Math.round(ctrYMax * 0.25), Math.round(ctrYMax * 0.5), Math.round(ctrYMax * 0.75), ctrYMax];

  const totalCTRActivity = ctrColumns.reduce((sum, col) => sum + col.totalValue, 0);
  const activeCTRsCount = ctrs.length;
  const topCTRCol = [...ctrColumns].sort((a, b) => b.totalValue - a.totalValue)[0];
  const topCTRName = topCTRCol && topCTRCol.totalValue > 0 ? topCTRCol.label : 'None';

  return (
    <div className="analytics-view-container">
      {/* Header Controls */}
      <div className="analytics-header-bar">
        <div className="analytics-title-group">
          <h2 className="analytics-main-title">
            {mode === 'classes' ? 'Class Attendance Analytics' : mode === 'ctrs' ? 'CTR Counter Analytics' : 'Weekly Productivity Analytics'}
          </h2>
          <p className="analytics-subtitle">
            {mode === 'classes' ? 'Attendance distribution by subject' : mode === 'ctrs' ? 'Activity counts by counter' : 'Time distribution by day and category'}
          </p>
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

      {mode === 'tasks' && futureWeekTasksCount > 0 && (
        <div className="future-items-notice-banner margin-bottom-16">
          <CalendarIcon className="icon-xs text-blue" />
          <span>
            <strong>{futureWeekTasksCount} upcoming tasks</strong> are scheduled for future dates/times and are excluded from past productivity calculations.
          </span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="analytics-kpi-grid">
        {mode === 'tasks' ? (
          <>
            <div className="kpi-card">
              <div className="kpi-icon-box blue"><Clock className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Total Time Scheduled</span>
                <span className="kpi-value">{totalHours} <span className="kpi-unit">hrs</span></span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box green"><CheckCircle2 className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Total Tasks</span>
                <span className="kpi-value">{weekTasks.length} <span className="kpi-unit">tasks</span></span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box orange"><TrendingUp className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Most Active Day</span>
                <span className="kpi-value-sm">{mostActiveDayLabel}</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box purple"><Award className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Top Category</span>
                <span className="kpi-value-sm">{topCategory}</span>
              </div>
            </div>
          </>
        ) : mode === 'classes' ? (
          <>
            <div className="kpi-card">
              <div className="kpi-icon-box blue"><GraduationCap className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Overall Attendance</span>
                <span className="kpi-value">{overallAttendancePct}%</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box green"><CheckCircle2 className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Attended Lectures</span>
                <span className="kpi-value">{classAttendedSum}</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box orange"><Clock className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Missed Lectures</span>
                <span className="kpi-value">{classMissedSum}</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box purple"><Award className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Cancelled Lectures</span>
                <span className="kpi-value">{classCancelledSum}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="kpi-card">
              <div className="kpi-icon-box green"><Hash className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Total Activity Count</span>
                <span className="kpi-value">{totalCTRActivity}</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box blue"><Clock className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Active Counters</span>
                <span className="kpi-value">{activeCTRsCount}</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box orange"><Award className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Top Counter</span>
                <span className="kpi-value-sm">{topCTRName}</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box purple"><TrendingUp className="icon-sm" /></div>
              <div className="kpi-content">
                <span className="kpi-label">Weekly Average</span>
                <span className="kpi-value">{(totalCTRActivity / 7).toFixed(1)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Chart & Category Sidebar */}
      <div className="analytics-body-grid">
        {/* Reusable Unified Bar Chart Component */}
        {mode === 'tasks' ? (
          <UnifiedAnalyticsBarChart
            mode="tasks"
            title="Daily Scheduled Task Hours (Stacked by Task)"
            subtitle="Hover over segments to see task details"
            yAxisUnit="hours"
            yAxisMax={taskYMax}
            yTicks={taskYTicks}
            columns={taskColumns}
            emptyMessage="No scheduled tasks for this week."
          />
        ) : mode === 'classes' ? (
          <UnifiedAnalyticsBarChart
            mode="classes"
            title="Class Attendance Percentage"
            subtitle="Attendance percentage per subject (past & due lectures only)"
            yAxisUnit="percentage"
            yAxisMax={100}
            yTicks={[0, 20, 40, 60, 80, 100]}
            columns={classColumns}
            emptyMessage="No class attendance data yet. Schedule and mark classes to see attendance analytics."
          />
        ) : (
          <UnifiedAnalyticsBarChart
            mode="ctrs"
            title="Counter Performance"
            subtitle="Total count per daily counter for selected period"
            yAxisUnit="count"
            yAxisMax={ctrYMax}
            yTicks={ctrYTicks}
            columns={ctrColumns}
            emptyMessage="No counter activity recorded for this period."
          />
        )}

        {/* Right Side Panel: Category / Summary Breakdown */}
        <div className="category-breakdown-card">
          {mode === 'tasks' ? (
            <>
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
                          className="cat-dot"
                          style={{ backgroundColor: catConfig.borderColor }}
                        />
                        <span className="cat-name">{catConfig.name}</span>
                        <span className="cat-val">{catHrs}h ({pct}%)</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
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
            </>
          ) : mode === 'classes' ? (
            <>
              <h3 className="chart-card-title">Subject Summary</h3>
              <p className="sidebar-hint">Attendance breakdown per class</p>

              <div className="category-progress-list">
                {Object.entries(subjectMap).map(([name, stats]) => {
                  const due = stats.attended + stats.missed;
                  const pct = due > 0 ? Math.round((stats.attended / due) * 100) : 0;
                  const color = pct >= 75 ? '#10B981' : pct >= 50 ? '#F97316' : '#EF4444';

                  return (
                    <div key={name} className="category-progress-item">
                      <div className="cat-progress-header">
                        <span className="cat-dot" style={{ backgroundColor: color }} />
                        <span className="cat-name">{name}</span>
                        <span className="cat-val">{pct}% ({stats.attended}/{due})</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h3 className="chart-card-title">Counter Breakdown</h3>
              <p className="sidebar-hint">Performance per counter</p>

              <div className="category-progress-list">
                {ctrs.map((c) => {
                  const total = ctrColumns.find((col) => col.id === c.id)?.totalValue || 0;
                  const pct = totalCTRActivity > 0 ? Math.round((total / totalCTRActivity) * 100) : 0;

                  return (
                    <div key={c.id} className="category-progress-item">
                      <div className="cat-progress-header">
                        <span className="cat-dot" style={{ backgroundColor: c.color }} />
                        <span className="cat-name">{c.name}</span>
                        <span className="cat-val">{total} ({pct}%)</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: c.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
