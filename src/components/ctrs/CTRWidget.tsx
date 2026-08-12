import React, { useState } from 'react';
import type { CTRItem } from '../../types/ctrs';
import { CTREditModal } from './CTREditModal';
import { Minus, Plus, Hash, PlusCircle, Settings } from 'lucide-react';

interface CTRWidgetProps {
  ctrs: CTRItem[];
  selectedDateStr: string; // YYYY-MM-DD
  onUpdateValue: (ctrId: string, dateStr: string, val: number) => void;
  onIncrement: (ctrId: string, dateStr: string, delta: number) => void;
  onOpenCreateCTRModal: () => void;
  onSaveCTRDefinition?: (ctrId: string, name: string, colorHex: string) => void;
  onDeleteCTR: (ctrId: string) => void;
}

export const CTRWidget: React.FC<CTRWidgetProps> = ({
  ctrs,
  selectedDateStr,
  onUpdateValue,
  onIncrement,
  onOpenCreateCTRModal,
  onSaveCTRDefinition,
  onDeleteCTR,
}) => {
  const [editingCTR, setEditingCTR] = useState<CTRItem | null>(null);

  return (
    <div className="ctr-widget-container">
      <div className="ctr-widget-header">
        <div className="ctr-header-title">
          <Hash className="icon-sm text-purple" />
          <h3 className="section-title">Daily Counters (CTR)</h3>
          <span className="ctr-date-pill">{selectedDateStr}</span>
        </div>

        <button
          type="button"
          className="btn-secondary btn-xs"
          onClick={onOpenCreateCTRModal}
        >
          <PlusCircle className="icon-nano" />
          <span>New CTR</span>
        </button>
      </div>

      {ctrs.length === 0 ? (
        <div className="empty-ctr-box">
          <p className="empty-text">No daily counters created yet.</p>
          <button
            type="button"
            className="btn-primary btn-xs margin-top-8"
            onClick={onOpenCreateCTRModal}
          >
            <Plus className="icon-nano" />
            <span>Create your first CTR</span>
          </button>
        </div>
      ) : (
        <div className="ctr-cards-grid">
          {ctrs.map((c) => {
            const count = c.dailyValues[selectedDateStr] || 0;

            return (
              <div
                key={c.id}
                className="ctr-card-item"
                style={{ borderLeftColor: c.color }}
              >
                <div className="ctr-card-info">
                  <span className="ctr-dot-badge" style={{ backgroundColor: c.color }} />
                  <span className="ctr-item-name font-bold">{c.name}</span>
                </div>

                <div className="ctr-controls-row">
                  <button
                    type="button"
                    className="ctr-btn btn-minus"
                    onClick={() => onIncrement(c.id, selectedDateStr, -1)}
                    title="Decrease count (Min: 0)"
                  >
                    <Minus className="icon-nano" />
                  </button>

                  <input
                    type="number"
                    className="ctr-count-input font-bold"
                    value={count}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateValue(c.id, selectedDateStr, isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    min={0}
                    title="Click to edit value directly"
                  />

                  <button
                    type="button"
                    className="ctr-btn btn-plus"
                    onClick={() => onIncrement(c.id, selectedDateStr, 1)}
                    title="Increase count"
                  >
                    <Plus className="icon-nano" />
                  </button>

                  <button
                    type="button"
                    className="btn-delete-ctr-nano"
                    onClick={() => setEditingCTR(c)}
                    title="Edit counter settings or delete"
                  >
                    <Settings className="icon-nano text-muted" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit CTR Modal */}
      <CTREditModal
        isOpen={!!editingCTR}
        ctrToEdit={editingCTR}
        onClose={() => setEditingCTR(null)}
        onSave={(id, name, color) => {
          if (onSaveCTRDefinition) onSaveCTRDefinition(id, name, color);
          setEditingCTR(null);
        }}
        onDelete={(id) => {
          onDeleteCTR(id);
          setEditingCTR(null);
        }}
      />
    </div>
  );
};
