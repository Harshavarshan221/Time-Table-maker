import React, { useState } from 'react';
import type { Task, WeekInfo, CategoryConfig } from '../types/timetable';
import type { ClassItem } from '../types/classes';
import type { CTRItem } from '../types/ctrs';
import { WeeklyAnalytics } from './WeeklyAnalytics';
import { MonthlyAnalytics } from './MonthlyAnalytics';
import { GraduationCap, CheckSquare, Hash, BarChart2, TrendingUp } from 'lucide-react';

export type MainAnalyticsCategory = 'classes' | 'tasks' | 'ctrs';
export type TaskAnalyticsScope = 'weekly' | 'monthly';

interface AnalyticsViewProps {
  currentWeekInfo: WeekInfo;
  scheduledTasks: Task[];
  classes: ClassItem[];
  ctrs: CTRItem[];
  categories: CategoryConfig[];
  onDateChange: (newDate: Date) => void;
  onNavigateToGrid?: () => void;
  onOpenCreateCTRModal?: () => void;
  onSaveCTRDefinition?: (ctrId: string, name: string, colorHex: string) => void;
  onDeleteCTR?: (ctrId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentWeekInfo,
  scheduledTasks,
  classes,
  ctrs,
  categories,
  onDateChange,
}) => {
  const [mainCategory, setMainCategory] = useState<MainAnalyticsCategory>('tasks');
  const [taskScope, setTaskScope] = useState<TaskAnalyticsScope>('weekly');

  return (
    <div className="analytics-view-wrapper">
      {/* 1. TOP-LEVEL 3-TAB ANALYTICS SELECTOR */}
      <div className="analytics-main-category-bar">
        <div className="main-category-tabs-group">
          <button
            type="button"
            className={`main-cat-tab-btn ${mainCategory === 'classes' ? 'active' : ''}`}
            onClick={() => setMainCategory('classes')}
          >
            <GraduationCap className="icon-xs text-blue" />
            <span>CLASSES</span>
          </button>

          <button
            type="button"
            className={`main-cat-tab-btn ${mainCategory === 'tasks' ? 'active' : ''}`}
            onClick={() => setMainCategory('tasks')}
          >
            <CheckSquare className="icon-xs text-purple" />
            <span>TASKS</span>
          </button>

          <button
            type="button"
            className={`main-cat-tab-btn ${mainCategory === 'ctrs' ? 'active' : ''}`}
            onClick={() => setMainCategory('ctrs')}
          >
            <Hash className="icon-xs text-green" />
            <span>CTRs</span>
          </button>
        </div>
      </div>

      {/* 2. RENDER SELECTED ANALYTICS SYSTEM */}
      <div className="task-analytics-wrapper">
        {/* Sub-Header for Tasks: Weekly vs Monthly */}
        <div className="analytics-scope-bar margin-bottom-16">
          <div className="scope-tabs-group">
            <button
              type="button"
              className={`scope-tab-btn ${taskScope === 'weekly' ? 'active' : ''}`}
              onClick={() => setTaskScope('weekly')}
            >
              <BarChart2 className="icon-xs" />
              <span>Weekly Analytics</span>
            </button>

            <button
              type="button"
              className={`scope-tab-btn ${taskScope === 'monthly' ? 'active' : ''}`}
              onClick={() => setTaskScope('monthly')}
            >
              <TrendingUp className="icon-xs" />
              <span>Monthly Analytics</span>
            </button>
          </div>
        </div>

        {taskScope === 'weekly' ? (
          <WeeklyAnalytics
            currentWeekInfo={currentWeekInfo}
            scheduledTasks={scheduledTasks}
            classes={classes}
            ctrs={ctrs}
            categories={categories}
            mode={mainCategory}
            onDateChange={onDateChange}
          />
        ) : (
          <MonthlyAnalytics
            scheduledTasks={scheduledTasks}
            classes={classes}
            ctrs={ctrs}
            categories={categories}
            mode={mainCategory}
          />
        )}
      </div>
    </div>
  );
};
