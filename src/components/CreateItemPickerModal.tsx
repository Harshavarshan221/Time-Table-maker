import React from 'react';
import { X, CheckSquare, GraduationCap, Hash, Sparkles } from 'lucide-react';

interface CreateItemPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'task' | 'class' | 'ctr') => void;
}

export const CreateItemPickerModal: React.FC<CreateItemPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content item-picker-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <div className="modal-icon-badge bg-blue">
              <Sparkles className="icon-sm text-blue" />
            </div>
            <div>
              <h3 className="modal-title">What do you want to add?</h3>
              <p className="modal-subtitle">Choose the type of item to create</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X className="icon-xs" />
          </button>
        </div>

        <div className="modal-body gap-12 padding-top-8">
          {/* TASK OPTION */}
          <button
            type="button"
            className="picker-card-option option-task"
            onClick={() => {
              onSelectType('task');
              onClose();
            }}
          >
            <div className="picker-icon-badge bg-blue">
              <CheckSquare className="icon-sm text-blue" />
            </div>
            <div className="picker-info-text">
              <span className="picker-title font-bold">Task</span>
              <span className="picker-desc">Scheduled study item, assignment, or task to complete</span>
            </div>
          </button>

          {/* CLASS OPTION */}
          <button
            type="button"
            className="picker-card-option option-class"
            onClick={() => {
              onSelectType('class');
              onClose();
            }}
          >
            <div className="picker-icon-badge bg-purple">
              <GraduationCap className="icon-sm text-purple" />
            </div>
            <div className="picker-info-text">
              <span className="picker-title font-bold">Class / Lecture</span>
              <span className="picker-desc">College lecture or class to attend (tracks attendance %)</span>
            </div>
          </button>

          {/* CTR COUNTER OPTION */}
          <button
            type="button"
            className="picker-card-option option-ctr"
            onClick={() => {
              onSelectType('ctr');
              onClose();
            }}
          >
            <div className="picker-icon-badge bg-green">
              <Hash className="icon-sm text-green" />
            </div>
            <div className="picker-info-text">
              <span className="picker-title font-bold">Daily Counter (CTR)</span>
              <span className="picker-desc">Numeric goal to count daily (Pushups, LeetCode, Pages Read)</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
