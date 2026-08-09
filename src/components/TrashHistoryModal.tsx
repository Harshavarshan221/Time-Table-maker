import React from 'react';
import { X, RotateCcw, Trash2, Clock, History, AlertCircle } from 'lucide-react';
import type { Task, CategoryConfig } from '../types/timetable';
import { getCategoryConfig } from '../constants/categories';
import { formatDurationLabel } from '../utils/dateUtils';

export interface DeletedTaskRecord {
  task: Task;
  deletedAt: number;
}

interface TrashHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedTasks: DeletedTaskRecord[];
  categories: CategoryConfig[];
  onRestoreTask: (record: DeletedTaskRecord) => void;
  onRestoreAll: () => void;
  onClearTrash: () => void;
}

export const TrashHistoryModal: React.FC<TrashHistoryModalProps> = ({
  isOpen,
  onClose,
  deletedTasks,
  categories,
  onRestoreTask,
  onRestoreAll,
  onClearTrash,
}) => {
  if (!isOpen) return null;

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content trash-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <h3 className="modal-title flex-center gap-8">
              <History className="icon-sm text-primary" />
              <span>Trash & Recovery History</span>
            </h3>
            <span className="badge-count">{deletedTasks.length} items</span>
          </div>
          <button className="btn-modal-close" onClick={onClose} aria-label="Close">
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {deletedTasks.length === 0 ? (
            <div className="empty-trash-state">
              <AlertCircle className="icon-lg text-muted" />
              <h4>Trash is Empty</h4>
              <p>Deleted tasks will appear here so you can easily recover them anytime.</p>
            </div>
          ) : (
            <>
              <div className="trash-header-actions">
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={onRestoreAll}
                >
                  <RotateCcw className="icon-nano" />
                  <span>Restore All</span>
                </button>
                <button
                  type="button"
                  className="btn-danger-outline-sm"
                  onClick={onClearTrash}
                >
                  <Trash2 className="icon-nano" />
                  <span>Empty Trash</span>
                </button>
              </div>

              <div className="trash-list">
                {deletedTasks.map((record, index) => {
                  const catConfig = getCategoryConfig(categories, record.task.category);
                  return (
                    <div key={`${record.task.id}-${index}`} className="trash-item-card">
                      <div className="trash-item-info">
                        <div className="trash-item-header">
                          <span
                            className="category-pill"
                            style={{ color: catConfig.textColor }}
                          >
                            {record.task.category}
                          </span>
                          <span className="duration-pill">
                            <Clock className="icon-nano" />
                            {formatDurationLabel(record.task.durationMinutes)}
                          </span>
                          <span className="time-ago-text">{formatTimeAgo(record.deletedAt)}</span>
                        </div>
                        <h4 className="trash-item-title">{record.task.title}</h4>
                        {record.task.description && (
                          <p className="trash-item-desc">{record.task.description}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn-restore"
                        onClick={() => onRestoreTask(record)}
                        title="Restore this task"
                      >
                        <RotateCcw className="icon-xs" />
                        <span>Restore</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <div className="spacer" />
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
