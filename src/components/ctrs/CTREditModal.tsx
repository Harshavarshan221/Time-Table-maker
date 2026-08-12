import React, { useState, useEffect } from 'react';
import type { CTRItem } from '../../types/ctrs';
import { CTR_PRESET_COLORS } from '../../types/ctrs';
import { X, Hash, Save, Trash2 } from 'lucide-react';

interface CTREditModalProps {
  isOpen: boolean;
  ctrToEdit: CTRItem | null;
  onClose: () => void;
  onSave: (ctrId: string, name: string, colorHex: string) => void;
  onDelete: (ctrId: string) => void;
}

export const CTREditModal: React.FC<CTREditModalProps> = ({
  isOpen,
  ctrToEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CTR_PRESET_COLORS[0].hex);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (ctrToEdit) {
      setName(ctrToEdit.name);
      setSelectedColor(ctrToEdit.color);
      setShowConfirmDelete(false);
    }
  }, [ctrToEdit]);

  if (!isOpen || !ctrToEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(ctrToEdit.id, name.trim(), selectedColor);
    onClose();
  };

  const handleDeleteConfirm = () => {
    onDelete(ctrToEdit.id);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content ctr-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <div className="modal-icon-badge bg-purple">
              <Hash className="icon-sm text-purple" />
            </div>
            <div>
              <h3 className="modal-title">Edit Counter (CTR)</h3>
              <p className="modal-subtitle">Update name or color (preserves daily counts)</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X className="icon-xs" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body gap-16 padding-top-8">
          <div className="form-group">
            <label className="form-label font-bold">Counter Name:</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DSA Medium Questions"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label font-bold">Color Theme:</label>
            <div className="ctr-color-palette-grid">
              {CTR_PRESET_COLORS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`ctr-color-chip ${selectedColor === preset.hex ? 'active' : ''}`}
                  style={{
                    backgroundColor: `${preset.hex}15`,
                    borderColor: preset.hex,
                    color: preset.hex,
                  }}
                  onClick={() => setSelectedColor(preset.hex)}
                >
                  <span className="ctr-dot-badge" style={{ backgroundColor: preset.hex }} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {showConfirmDelete ? (
            <div className="confirm-delete-alert-box margin-top-8">
              <p className="confirm-text font-bold text-red">
                Are you sure you want to delete "{ctrToEdit.name}"?
              </p>
              <p className="confirm-sub font-nano text-muted">
                This will delete the counter and its daily history. Your timetable tasks will NOT be touched.
              </p>
              <div className="flex-align-center gap-8 margin-top-10">
                <button
                  type="button"
                  className="btn-danger btn-sm flex-1"
                  onClick={handleDeleteConfirm}
                >
                  Yes, Delete CTR
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setShowConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="modal-footer justify-between padding-top-12 border-top">
              <button
                type="button"
                className="btn-delete-class-action"
                onClick={() => setShowConfirmDelete(true)}
              >
                <Trash2 className="icon-nano" />
                <span>Delete CTR</span>
              </button>

              <div className="flex-align-center gap-8">
                <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  <Save className="icon-nano" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
