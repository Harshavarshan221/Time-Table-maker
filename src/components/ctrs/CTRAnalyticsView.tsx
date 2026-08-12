import React, { useState } from 'react';
import type { CTRItem } from '../../types/ctrs';
import { BarChart2, TrendingUp, Award, Calendar, Hash, PlusCircle } from 'lucide-react';

interface CTRAnalyticsViewProps {
  ctrs: CTRItem[];
  onOpenCreateCTRModal?: () => void;
}

export const CTRAnalyticsView: React.FC<CTRAnalyticsViewProps> = ({
  ctrs,
  onOpenCreateCTRModal,
}) => {
  const [selectedCTRId, setSelectedCTRId] = useState<string>(() =>
    ctrs.length > 0 ? ctrs[0].id : 'all'
  );

  // Generate last 14 days dates for X-axis
  const days: { dateStr: string; label: string }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ dateStr, label });
  }

  const activeCTR = ctrs.find((c) => c.id === selectedCTRId);

  // Compute values for days
  let valuesForDays: { dateStr: string; label: string; count: number }[] = [];

  if (activeCTR) {
    valuesForDays = days.map((d) => ({
      ...d,
      count: activeCTR.dailyValues[d.dateStr] || 0,
    }));
  } else {
    // All CTRs summed per day
    valuesForDays = days.map((d) => {
      const sum = ctrs.reduce((acc, c) => acc + (c.dailyValues[d.dateStr] || 0), 0);
      return { ...d, count: sum };
    });
  }

  const totalCount = valuesForDays.reduce((acc, v) => acc + v.count, 0);
  const avgCount = valuesForDays.length > 0 ? (totalCount / valuesForDays.length).toFixed(1) : '0.0';
  
  const countsArray = valuesForDays.map((v) => v.count);
  const highestDayCount = countsArray.length > 0 ? Math.max(...countsArray, 0) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = valuesForDays.find((v) => v.dateStr === todayStr)?.count || 0;

  return (
    <div className="ctr-analytics-container">
      {ctrs.length === 0 ? (
        <div className="empty-analytics-box card-styled margin-top-20 text-center padding-32">
          <div className="empty-icon-wrapper bg-purple">
            <Hash className="icon-lg text-purple" />
          </div>
          <h3 className="empty-title margin-top-12">No daily counters created yet</h3>
          <p className="empty-sub">
            Create a CTR to track daily numerical metrics like DSA questions, pushups, pages read, etc.
          </p>
          {onOpenCreateCTRModal && (
            <button
              type="button"
              className="btn-primary btn-md margin-top-16 inline-flex-center gap-2"
              onClick={onOpenCreateCTRModal}
            >
              <PlusCircle className="icon-xs" />
              <span>Create First CTR</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Top Bar with Card Title & Dropdown Selector */}
          <div className="analytics-header-card padding-16 border-rounded bg-white shadow-sm margin-bottom-16">
            <div className="ctr-analytics-header-bar">
              <div className="flex-align-center gap-2">
                <Hash className="icon-sm text-purple" />
                <h3 className="section-title">Counter Performance & Trends</h3>
              </div>

              <div className="ctr-selector-dropdown-box flex-align-center gap-2">
                <label className="dropdown-label font-bold text-secondary">Select Counter:</label>
                <select
                  className="form-select ctr-select-input font-bold"
                  value={selectedCTRId}
                  onChange={(e) => setSelectedCTRId(e.target.value)}
                >
                  <option value="all">📊 Compare All Counters</option>
                  {ctrs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="analytics-summary-grid margin-top-16">
            <div className="summary-card card-purple">
              <div className="card-icon-wrapper">
                <BarChart2 className="icon-sm text-purple" />
              </div>
              <div className="card-info">
                <span className="card-label">14-Day Total Count</span>
                <span className="card-value font-bold">{totalCount}</span>
                <span className="card-sub">Total across 14 days</span>
              </div>
            </div>

            <div className="summary-card card-blue">
              <div className="card-icon-wrapper">
                <TrendingUp className="icon-sm text-blue" />
              </div>
              <div className="card-info">
                <span className="card-label">Daily Average</span>
                <span className="card-value font-bold">{avgCount}</span>
                <span className="card-sub">Per day average</span>
              </div>
            </div>

            <div className="summary-card card-green">
              <div className="card-icon-wrapper">
                <Award className="icon-sm text-green" />
              </div>
              <div className="card-info">
                <span className="card-label">Highest Day</span>
                <span className="card-value font-bold">{highestDayCount}</span>
                <span className="card-sub">Peak single-day score</span>
              </div>
            </div>

            <div className="summary-card card-amber">
              <div className="card-icon-wrapper">
                <Calendar className="icon-sm text-amber" />
              </div>
              <div className="card-info">
                <span className="card-label">Today's Count</span>
                <span className="card-value font-bold">{todayCount}</span>
                <span className="card-sub">Recorded today</span>
              </div>
            </div>
          </div>

          {/* Interactive Bar Chart */}
          <div className="analytics-section-card margin-top-20">
            <div className="section-card-header">
              <div className="flex-align-center gap-2">
                <span
                  className="ctr-dot-badge-lg"
                  style={{ backgroundColor: activeCTR ? activeCTR.color : '#8B5CF6' }}
                />
                <h3 className="section-title">
                  {activeCTR ? activeCTR.name : 'All Counters Sum'} (Last 14 Days)
                </h3>
              </div>
            </div>

            <div className="ctr-bar-chart-wrapper">
              {highestDayCount === 0 && (
                <div className="chart-no-activity-notice">
                  <span>No count activity recorded in this 14-day period</span>
                </div>
              )}

              <div className="chart-bars-container">
                {valuesForDays.map((d) => {
                  const heightPercent =
                    highestDayCount > 0
                      ? Math.round((d.count / highestDayCount) * 100)
                      : 0;

                  const isToday = d.dateStr === todayStr;

                  return (
                    <div key={d.dateStr} className={`chart-bar-column ${isToday ? 'is-today' : ''}`}>
                      <span className="bar-count-val">{d.count}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${heightPercent}%`,
                            backgroundColor: activeCTR ? activeCTR.color : '#8B5CF6',
                          }}
                        />
                      </div>
                      <span className="bar-date-label">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
