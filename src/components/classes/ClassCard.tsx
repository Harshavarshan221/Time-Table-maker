import React, { useState } from 'react';
import type { ClassItem, ClassStatus } from '../../types/classes';
import { ClassStatusPopover } from './ClassStatusPopover';

interface ClassCardProps {
  classItem: ClassItem;
  startHour: number;
  hourHeightPx: number;
  onUpdateStatus: (classId: string, status: ClassStatus) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  startHour,
  hourHeightPx,
  onUpdateStatus,
  onDeleteClass,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Calculate top & height positioning
  const [startH, startM] = classItem.startTime.split(':').map(Number);
  const [endH, endM] = classItem.endTime.split(':').map(Number);

  const startMinsTotal = startH * 60 + startM;
  const endMinsTotal = endH * 60 + endM;

  const durationMinutes = Math.max(15, endMinsTotal - startMinsTotal);
  const offsetMinsFromStartHour = startMinsTotal - startHour * 60;

  const topPx = (offsetMinsFromStartHour / 60) * hourHeightPx;
  const heightPx = (durationMinutes / 60) * hourHeightPx;

  // Visual status indicator details
  const getStatusBadge = () => {
    switch (classItem.status) {
      case 'attended':
        return { label: '🟢 Attended', className: 'status-card-attended' };
      case 'missed':
        return { label: '🔴 Missed', className: 'status-card-missed' };
      case 'cancelled':
        return { label: '🟡 Cancelled', className: 'status-card-cancelled' };
      case 'scheduled':
      default:
        return { label: '⚪ Scheduled', className: 'status-card-scheduled' };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <>
      <div
        className={`class-card-item ${statusInfo.className}`}
        style={{
          top: `${topPx}px`,
          height: `${heightPx}px`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsPopoverOpen(true);
        }}
        title={`Click to mark attendance for ${classItem.name} (${classItem.startTime} - ${classItem.endTime})`}
      >
        <div className="class-card-header-row">
          <span className="class-nano-pill">CLASS</span>
          <span className="class-time-text">
            {classItem.startTime} – {classItem.endTime}
          </span>
        </div>

        <div className="class-card-body">
          <h4 className="class-title-text">{classItem.name}</h4>
          <span className="class-status-badge-text">{statusInfo.label}</span>
        </div>
      </div>

      {isPopoverOpen && (
        <ClassStatusPopover
          classItem={classItem}
          onSelectStatus={(status) => onUpdateStatus(classItem.id, status)}
          onDeleteClass={() => onDeleteClass(classItem.id)}
          onClose={() => setIsPopoverOpen(false)}
        />
      )}
    </>
  );
};
