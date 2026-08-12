import { CheckCircle2, XCircle, AlertCircle, Clock, Trash2, X, Copy } from 'lucide-react';
import type { ClassItem, ClassStatus } from '../../types/classes';

interface ClassStatusPopoverProps {
  classItem: ClassItem;
  onSelectStatus: (status: ClassStatus) => void;
  onDeleteClass: () => void;
  onDuplicateClass?: () => void;
  onClose: () => void;
}

export const ClassStatusPopover: React.FC<ClassStatusPopoverProps> = ({
  classItem,
  onSelectStatus,
  onDeleteClass,
  onDuplicateClass,
  onClose,
}) => {
  return (
    <div className="class-popover-overlay" onClick={onClose}>
      <div className="class-popover-card" onClick={(e) => e.stopPropagation()}>
        <div className="popover-header">
          <div className="popover-title-box">
            <span className="class-badge-pill">LECTURE / CLASS</span>
            <h4 className="popover-class-name">{classItem.name}</h4>
            <span className="popover-time-range">
              ⏰ {classItem.startTime} – {classItem.endTime} ({classItem.dateStr})
            </span>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X className="icon-xs" />
          </button>
        </div>

        <div className="popover-body">
          <label className="popover-label">Mark Attendance Status:</label>

          <div className="status-options-grid">
            <button
              type="button"
              className={`status-btn btn-status-scheduled ${classItem.status === 'scheduled' ? 'active' : ''}`}
              onClick={() => {
                onSelectStatus('scheduled');
                onClose();
              }}
            >
              <Clock className="icon-xs" />
              <span>⚪ Scheduled</span>
            </button>

            <button
              type="button"
              className={`status-btn btn-status-attended ${classItem.status === 'attended' ? 'active' : ''}`}
              onClick={() => {
                onSelectStatus('attended');
                onClose();
              }}
            >
              <CheckCircle2 className="icon-xs text-green" />
              <span>🟢 Attended</span>
            </button>

            <button
              type="button"
              className={`status-btn btn-status-missed ${classItem.status === 'missed' ? 'active' : ''}`}
              onClick={() => {
                onSelectStatus('missed');
                onClose();
              }}
            >
              <XCircle className="icon-xs text-red" />
              <span>🔴 Missed</span>
            </button>

            <button
              type="button"
              className={`status-btn btn-status-cancelled ${classItem.status === 'cancelled' ? 'active' : ''}`}
              onClick={() => {
                onSelectStatus('cancelled');
                onClose();
              }}
            >
              <AlertCircle className="icon-xs text-amber" />
              <span>🟡 Cancelled</span>
            </button>
          </div>
        </div>

        <div className="popover-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onDuplicateClass && (
            <button
              type="button"
              className="btn-duplicate-class-action"
              onClick={() => {
                onDuplicateClass();
                onClose();
              }}
              title="Duplicate Class"
            >
              <Copy className="icon-nano text-purple" />
              <span>Duplicate</span>
            </button>
          )}

          <button
            type="button"
            className="btn-delete-class-action"
            onClick={() => {
              onDeleteClass();
              onClose();
            }}
          >
            <Trash2 className="icon-nano text-red" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
