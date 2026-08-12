import React, { useState } from 'react';
import { X, Hash, Palette, Sparkles } from 'lucide-react';
import { CTR_PRESET_COLORS } from '../../types/ctrs';

interface CTRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCTR: (name: string, colorHex: string) => void;
}

export const CTRModal: React.FC<CTRModalProps> = ({
  isOpen,
  onClose,
  onCreateCTR,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CTR_PRESET_COLORS[0].hex);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateCTR(name.trim(), selectedColor);
    setName('');
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
              <h3 className="modal-title">Create Daily Counter (CTR)</h3>
              <p className="modal-subtitle">Track custom daily metrics (e.g., Pushups, LeetCode Mediums)</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X className="icon-xs" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body gap-16">
          <div className="form-group">
            <label className="form-label">Counter Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. DSA Medium Questions, Pushups, Pages Read"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label flex-align-center gap-2">
              <Palette className="icon-xs text-muted" />
              <span>Choose Color Badge:</span>
            </label>

            <div className="ctr-color-palette-grid">
              {CTR_PRESET_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className={`ctr-color-chip ${selectedColor === col.hex ? 'active' : ''}`}
                  style={{
                    backgroundColor: col.bgHex,
                    borderColor: col.borderHex,
                    color: col.textHex,
                  }}
                  onClick={() => setSelectedColor(col.hex)}
                >
                  <span className="ctr-color-dot" style={{ backgroundColor: col.hex }} />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Sparkles className="icon-xs" />
              <span>Create Counter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
