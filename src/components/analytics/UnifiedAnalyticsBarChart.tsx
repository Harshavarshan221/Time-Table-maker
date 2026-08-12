import React, { useState } from 'react';

export type AnalyticsChartMode = 'tasks' | 'classes' | 'ctrs';

export interface ChartSegmentData {
  id: string;
  title: string;
  value: number; // hrs for tasks, pct for classes, count for ctrs
  color: string;
  categoryName?: string;
  tooltipExtra?: string;
}

export interface ChartColumnData {
  id: string;
  label: string; // e.g. "Mon", "DSA", "Pushups"
  subLabel?: string; // e.g. "Aug 12", "80%", "Total: 40"
  totalValue: number;
  isToday?: boolean;
  segments: ChartSegmentData[];
  tooltipTitle?: string;
  tooltipLines?: string[];
}

export interface UnifiedAnalyticsBarChartProps {
  mode: AnalyticsChartMode;
  title: string;
  subtitle?: string;
  yAxisUnit: 'hours' | 'percentage' | 'count';
  yAxisMax: number;
  yTicks: number[];
  columns: ChartColumnData[];
  emptyMessage?: string;
}

export const UnifiedAnalyticsBarChart: React.FC<UnifiedAnalyticsBarChartProps> = ({
  mode,
  title,
  subtitle,
  yAxisUnit,
  yAxisMax,
  yTicks,
  columns,
  emptyMessage = 'No activity recorded for this period.',
}) => {
  const [hoveredColumn, setHoveredColumn] = useState<{
    col: ChartColumnData;
    segment?: ChartSegmentData;
    x: number;
    y: number;
  } | null>(null);

  const formatTickLabel = (tick: number) => {
    if (yAxisUnit === 'percentage') return `${tick}%`;
    if (yAxisUnit === 'hours') return `${tick}h`;
    return `${tick}`;
  };

  const hasData = columns.some((col) => col.totalValue > 0 || col.segments.length > 0);

  return (
    <div className="chart-card unified-analytics-chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">{title}</h3>
          {subtitle && <span className="chart-legend-hint">{subtitle}</span>}
        </div>
      </div>

      {!hasData ? (
        <div className="chart-no-activity-notice margin-top-12 margin-bottom-12">
          <span>{emptyMessage}</span>
        </div>
      ) : (
        <div className="bar-chart-container">
          {/* Y-Axis Labels */}
          <div className="y-axis-labels">
            {yTicks.slice().reverse().map((tick) => (
              <div key={tick} className="y-axis-tick">
                <span>{formatTickLabel(tick)}</span>
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

            {/* Column Bars Wrapper */}
            <div className="bars-columns-wrapper">
              {columns.map((col) => {
                const totalHeightPct = yAxisMax > 0 ? Math.min(100, (col.totalValue / yAxisMax) * 100) : 0;

                return (
                  <div key={col.id} className="bar-column-item">
                    <div className="bar-stack-track">
                      {col.segments.length === 0 ? (
                        <div className="empty-bar-slot" />
                      ) : mode === 'tasks' ? (
                        /* Stacked segments for Tasks */
                        col.segments.map((seg) => {
                          const segPct = yAxisMax > 0 ? (seg.value / yAxisMax) * 100 : 0;
                          return (
                            <div
                              key={seg.id}
                              className="bar-task-segment"
                              style={{
                                height: `${segPct}%`,
                                backgroundColor: seg.color,
                                borderColor: seg.color,
                              }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredColumn({
                                  col,
                                  segment: seg,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top - 8,
                                });
                              }}
                              onMouseLeave={() => setHoveredColumn(null)}
                            >
                              {segPct > 8 && (
                                <span className="segment-title-label">{seg.title}</span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        /* Single unified bar for Classes and CTRs */
                        <div
                          className="bar-single-column-segment"
                          style={{
                            height: `${totalHeightPct}%`,
                            backgroundColor: col.segments[0]?.color || 'var(--primary)',
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredColumn({
                              col,
                              segment: col.segments[0],
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setHoveredColumn(null)}
                        >
                          {totalHeightPct > 12 && (
                            <span className="segment-title-label">
                              {col.subLabel || `${col.totalValue}`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* X-Axis Column Label */}
                    <div className={`x-axis-day-label ${col.isToday ? 'today' : ''}`}>
                      <span className="x-day-name font-bold" title={col.label}>{col.label}</span>
                      {col.subLabel && <span className="x-day-date">{col.subLabel}</span>}
                      {mode === 'tasks' && (
                        <span className="x-day-total">
                          {col.totalValue > 0 ? `${col.totalValue.toFixed(1)}h` : '-'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Tooltip */}
      {hoveredColumn && (
        <div
          className="chart-tooltip-floating"
          style={{
            position: 'fixed',
            left: `${hoveredColumn.x}px`,
            top: `${hoveredColumn.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div className="tooltip-card">
            <h5 className="tooltip-title">
              {hoveredColumn.segment?.title || hoveredColumn.col.tooltipTitle || hoveredColumn.col.label}
            </h5>
            {hoveredColumn.col.tooltipLines ? (
              hoveredColumn.col.tooltipLines.map((line, idx) => (
                <p key={idx} className="tooltip-detail">{line}</p>
              ))
            ) : hoveredColumn.segment ? (
              <>
                <p className="tooltip-detail">
                  Value:{' '}
                  <strong>
                    {hoveredColumn.segment.value}
                    {yAxisUnit === 'hours' ? ' hrs' : yAxisUnit === 'percentage' ? '%' : ''}
                  </strong>
                </p>
                {hoveredColumn.segment.categoryName && (
                  <p className="tooltip-category">Category: {hoveredColumn.segment.categoryName}</p>
                )}
                {hoveredColumn.segment.tooltipExtra && (
                  <p className="tooltip-detail">{hoveredColumn.segment.tooltipExtra}</p>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
