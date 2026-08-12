import React from 'react';
import type { ClassItem } from '../../types/classes';
import { isAnalyticsEligible } from '../../utils/dateUtils';
import { GraduationCap, CheckCircle2, XCircle, AlertCircle, Calendar, CalendarRange } from 'lucide-react';

interface ClassAnalyticsViewProps {
  classes: ClassItem[];
  onNavigateToGrid?: () => void;
}

export const ClassAnalyticsView: React.FC<ClassAnalyticsViewProps> = ({
  classes,
  onNavigateToGrid,
}) => {
  const now = new Date();

  // Filter classes to only include eligible past or current classes for performance statistics
  const eligibleClasses = classes.filter((c) => isAnalyticsEligible(c.dateStr, c.startTime, 60, 4, now));
  const futureClassesCount = classes.length - eligibleClasses.length;

  // Aggregate overall attendance stats from eligible classes
  const attendedCount = eligibleClasses.filter((c) => c.status === 'attended').length;
  const missedCount = eligibleClasses.filter((c) => c.status === 'missed').length;
  const cancelledCount = eligibleClasses.filter((c) => c.status === 'cancelled').length;

  // Formula: Attended / (Attended + Missed) * 100
  const validDenominator = attendedCount + missedCount;
  const overallPercentage =
    validDenominator > 0 ? Math.round((attendedCount / validDenominator) * 100) : 0;

  // Group classes by subject name
  const subjectGroups: Record<
    string,
    { attended: number; missed: number; cancelled: number; scheduled: number }
  > = {};

  classes.forEach((c) => {
    const key = c.name.trim();
    if (!subjectGroups[key]) {
      subjectGroups[key] = { attended: 0, missed: 0, cancelled: 0, scheduled: 0 };
    }

    const isEligible = isAnalyticsEligible(c.dateStr, c.startTime, 60, 4, now);

    if (isEligible) {
      if (c.status === 'attended') subjectGroups[key].attended += 1;
      if (c.status === 'missed') subjectGroups[key].missed += 1;
      if (c.status === 'cancelled') subjectGroups[key].cancelled += 1;
    } else {
      subjectGroups[key].scheduled += 1;
    }
  });

  const subjectList = Object.entries(subjectGroups).map(([name, counts]) => {
    const denom = counts.attended + counts.missed;
    const pct = denom > 0 ? Math.round((counts.attended / denom) * 100) : 0;
    return { name, ...counts, percentage: pct };
  });

  return (
    <div className="class-analytics-container">
      {classes.length === 0 ? (
        <div className="empty-analytics-box card-styled margin-top-20 text-center padding-32">
          <div className="empty-icon-wrapper bg-blue">
            <GraduationCap className="icon-lg text-blue" />
          </div>
          <h3 className="empty-title margin-top-12">No classes scheduled yet</h3>
          <p className="empty-sub">
            Schedule a class or lecture on your timetable to start tracking subject attendance percentages!
          </p>
          {onNavigateToGrid && (
            <button
              type="button"
              className="btn-primary btn-md margin-top-16 inline-flex-center gap-2"
              onClick={onNavigateToGrid}
            >
              <CalendarRange className="icon-xs" />
              <span>Go to Timetable</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Top Stat Badges */}
          <div className="analytics-summary-grid">
            <div className="summary-card card-blue">
              <div className="card-icon-wrapper">
                <GraduationCap className="icon-sm text-blue" />
              </div>
              <div className="card-info">
                <span className="card-label">Overall Attendance</span>
                <span className="card-value font-bold">{overallPercentage}%</span>
                <span className="card-sub">{attendedCount} of {validDenominator} marked lectures</span>
              </div>
            </div>

            <div className="summary-card card-green">
              <div className="card-icon-wrapper">
                <CheckCircle2 className="icon-sm text-green" />
              </div>
              <div className="card-info">
                <span className="card-label">Attended</span>
                <span className="card-value font-bold">{attendedCount}</span>
                <span className="card-sub">Lectures attended</span>
              </div>
            </div>

            <div className="summary-card card-red">
              <div className="card-icon-wrapper">
                <XCircle className="icon-sm text-red" />
              </div>
              <div className="card-info">
                <span className="card-label">Missed</span>
                <span className="card-value font-bold">{missedCount}</span>
                <span className="card-sub">Lectures missed</span>
              </div>
            </div>

            <div className="summary-card card-amber">
              <div className="card-icon-wrapper">
                <AlertCircle className="icon-sm text-amber" />
              </div>
              <div className="card-info">
                <span className="card-label">Cancelled / Off</span>
                <span className="card-value font-bold">{cancelledCount}</span>
                <span className="card-sub">Excluded from % denominator</span>
              </div>
            </div>
          </div>

          {futureClassesCount > 0 && (
            <div className="future-items-notice-banner margin-top-12">
              <Calendar className="icon-xs text-blue" />
              <span>
                <strong>{futureClassesCount} upcoming lectures</strong> are scheduled for future times and are excluded from past attendance calculations.
              </span>
            </div>
          )}

          {/* Per-Subject Breakdown List */}
          <div className="analytics-section-card margin-top-20">
            <div className="section-card-header">
              <h3 className="section-title">
                <GraduationCap className="icon-sm text-primary" /> Subject Attendance Breakdown
              </h3>
              <span className="section-sub-badge">{subjectList.length} Subjects</span>
            </div>

            <div className="subject-attendance-list">
              {subjectList.map((subj) => (
                <div key={subj.name} className="subject-attendance-row">
                  <div className="subject-row-header">
                    <span className="subject-name font-bold">{subj.name}</span>
                    <div className="subject-percentage-badge font-bold">
                      {subj.percentage}%
                    </div>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${subj.percentage >= 75 ? 'bg-green' : subj.percentage >= 50 ? 'bg-amber' : 'bg-red'}`}
                      style={{ width: `${subj.percentage}%` }}
                    />
                  </div>

                  <div className="subject-row-footer">
                    <span className="status-text-green font-bold">{subj.attended} Attended</span>
                    <span className="dot-divider">•</span>
                    <span className="status-text-red font-bold">{subj.missed} Missed</span>
                    {subj.cancelled > 0 && (
                      <>
                        <span className="dot-divider">•</span>
                        <span className="status-text-amber">{subj.cancelled} Cancelled</span>
                      </>
                    )}
                    {subj.scheduled > 0 && (
                      <>
                        <span className="dot-divider">•</span>
                        <span className="status-text-muted">{subj.scheduled} Upcoming</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
