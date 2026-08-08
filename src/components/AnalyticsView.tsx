import React, { useState } from 'react';
import type { Task, WeekInfo, CategoryConfig } from '../types/timetable';
import { WeeklyAnalytics } from './WeeklyAnalytics';
import { MonthlyAnalytics } from './MonthlyAnalytics';
import { BarChart2, TrendingUp } from 'lucide-react';

export type AnalyticsTab = 'weekly' | 'monthly';

interface AnalyticsViewProps {
  currentWeekInfo: WeekInfo;
  scheduledTasks: Task[];
  categories: CategoryConfig[];
  onDateChange: (newDate: Date) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentWeekInfo,
  scheduledTasks,
  categories,
  onDateChange,
}) => {
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('weekly');

  return (
    <div className="analytics-view-wrapper">
      {/* Top Scope Switcher Sub-Header */}
      <div className="analytics-scope-bar">
        <div className="scope-tabs-group">
          <button
            className={`scope-tab-btn ${analyticsTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setAnalyticsTab('weekly')}
          >
            <BarChart2 className="icon-xs" />
            <span>Weekly Analytics</span>
          </button>

          <button
            className={`scope-tab-btn ${analyticsTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setAnalyticsTab('monthly')}
          >
            <TrendingUp className="icon-xs" />
            <span>Monthly Analytics</span>
          </button>
        </div>
      </div>

      {/* Render selected analytics view */}
      {analyticsTab === 'weekly' ? (
        <WeeklyAnalytics
          currentWeekInfo={currentWeekInfo}
          scheduledTasks={scheduledTasks}
          categories={categories}
          onDateChange={onDateChange}
        />
      ) : (
        <MonthlyAnalytics
          scheduledTasks={scheduledTasks}
          categories={categories}
        />
      )}
    </div>
  );
};

