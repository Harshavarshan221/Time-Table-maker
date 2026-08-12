import React from 'react';
import type { ClassItem } from '../../types/classes';
import { GraduationCap, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';

interface ClassAnalyticsViewProps {
  classes: ClassItem[];
}

export const ClassAnalyticsView: React.FC<ClassAnalyticsViewProps> = ({ classes }) => {
  // Aggregate overall attendance stats
  const attendedCount = classes.filter((c) => c.status === 'attended').length;
  const missedCount = classes.filter((c) => c.status === 'missed').length;
  const cancelledCount = classes.filter((c) => c.status === 'cancelled').length;

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
    if (c.status === 'attended') subjectGroups[key].attended += 1;
    if (c.status === 'missed') subjectGroups[key].missed += 1;
    if (c.status === 'cancelled') subjectGroups[key].cancelled += 1;
    if (c.status === 'scheduled') subjectGroups[key].scheduled += 1;
  });

  const subjectList = Object.entries(subjectGroups).map(([name, counts]) => {
    const denom = counts.attended + counts.missed;
    const pct = denom > 0 ? Math.round((counts.attended / denom) * 100) : 0;
    return { name, ...counts, percentage: pct };
  });

  return (
    <div className="class-analytics-container">
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

      {/* Per-Subject Breakdown List */}
      <div className="analytics-section-card margin-top-20">
        <div className="section-card-header">
          <h3 className="section-title">
            <GraduationCap className="icon-sm text-primary" /> Subject Attendance Breakdown
          </h3>
          <span className="section-sub-badge">{subjectList.length} Subjects</span>
        </div>

        {subjectList.length === 0 ? (
          <div className="empty-analytics-box">
            <Calendar className="empty-icon" />
            <p className="empty-title">No classes recorded yet</p>
            <p className="empty-sub">Schedule classes on the timetable to track attendance percentages!</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
