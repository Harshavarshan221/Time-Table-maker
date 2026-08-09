import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import type { Task } from '../types/timetable';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  matchCount: number;
  onConfirmSingle: () => void;
  onConfirmAll: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  task,
  matchCount,
  onConfirmSingle,
  onConfirmAll,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header border-none pb-0">
          <div className="flex-center gap-8 text-danger">
            <AlertTriangle className="icon-md" />
            <h3 className="modal-title">Delete Task Options</h3>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body text-center">
          <p className="delete-modal-msg">
            You are about to delete <strong>"{task.title}"</strong>.
            {matchCount > 1 && (
              <span> There are <strong>{matchCount} instances</strong> of this task on your timetable.</span>
            )}
          </p>

          <div className="delete-options-grid">
            <button
              type="button"
              className="btn-delete-option"
              onClick={() => {
                onConfirmSingle();
                onClose();
              }}
            >
              <Trash2 className="icon-xs text-danger" />
              <div className="option-text">
                <span className="option-title">Delete Only This Instance</span>
                <span className="option-sub">Removes only this specific task from the timetable.</span>
              </div>
            </button>

            {matchCount > 1 && (
              <button
                type="button"
                className="btn-delete-option btn-delete-all-option"
                onClick={() => {
                  onConfirmAll();
                  onClose();
                }}
              >
                <Trash2 className="icon-xs text-danger" />
                <div className="option-text">
                  <span className="option-title">Delete All {matchCount} Instances</span>
                  <span className="option-sub">Removes all matching instances across the whole timetable.</span>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="modal-actions justify-center">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
