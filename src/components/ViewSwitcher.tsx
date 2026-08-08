import React from 'react';
import { Calendar, BarChart2 } from 'lucide-react';

export type AppView = 'grid' | 'analytics';

interface ViewSwitcherProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  activeView,
  onViewChange,
}) => {
  return (
    <div className="view-switcher-tabs">
      <button
        className={`view-tab-btn ${activeView === 'grid' ? 'active' : ''}`}
        onClick={() => onViewChange('grid')}
        title="View Weekly Calendar Timetable"
      >
        <Calendar className="icon-xs" />
        <span>Timetable Grid</span>
      </button>

      <button
        className={`view-tab-btn ${activeView === 'analytics' ? 'active' : ''}`}
        onClick={() => onViewChange('analytics')}
        title="View Productivity Analytics"
      >
        <BarChart2 className="icon-xs" />
        <span>Analytics (Weekly / Monthly)</span>
      </button>
    </div>
  );
};
