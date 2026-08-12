import React, { useState, useEffect, useRef } from 'react';
import type { CTRItem } from '../../types/ctrs';
import { CTR_PRESET_COLORS } from '../../types/ctrs';
import { Minus, Plus, Hash, PlusCircle, X, ArrowLeft, Check } from 'lucide-react';

interface DateCTRPopoverProps {
  dateStr: string; // YYYY-MM-DD
  dayDisplayStr: string; // e.g. "Aug 12"
  ctrs: CTRItem[];
  onUpdateValue: (ctrId: string, dateStr: string, val: number) => void;
  onIncrement: (ctrId: string, dateStr: string, delta: number) => void;
  onCreateCTR: (name: string, colorHex: string) => void;
  onClose: () => void;
}

type PopoverMode = 'LIST' | 'ADD' | 'CREATE';

export const DateCTRPopover: React.FC<DateCTRPopoverProps> = ({
  dateStr,
  dayDisplayStr,
  ctrs,
  onUpdateValue,
  onIncrement,
  onCreateCTR,
  onClose,
}) => {
  const [mode, setMode] = useState<PopoverMode>('LIST');
  const [activeCtrIds, setActiveCtrIds] = useState<string[]>([]);
  const [newCtrName, setNewCtrName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CTR_PRESET_COLORS[0].hex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync active CTRs for dateStr when ctrs or dateStr changes
  useEffect(() => {
    const active = ctrs
      .filter((c) => c.dailyValues[dateStr] !== undefined)
      .map((c) => c.id);
    
    setActiveCtrIds((prev) => {
      // Keep manually added CTR IDs for this session plus ones with existing values
      const merged = Array.from(new Set([...prev, ...active]));
      return merged;
    });
  }, [dateStr, ctrs]);

  // Click outside listener to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter active CTR items vs available existing CTRs
  const activeCTRItems = ctrs.filter((c) => activeCtrIds.includes(c.id));
  const availableCTRsToAdd = ctrs.filter((c) => !activeCtrIds.includes(c.id));

  const handleAddExistingCTR = (ctrId: string) => {
    setActiveCtrIds((prev) => [...prev, ctrId]);
    // Initialize count to 0 if not set
    const currentVal = ctrs.find((c) => c.id === ctrId)?.dailyValues[dateStr];
    if (currentVal === undefined) {
      onUpdateValue(ctrId, dateStr, 0);
    }
    setMode('LIST');
  };

  const handleCreateNewCTR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCtrName.trim()) return;

    onCreateCTR(newCtrName.trim(), selectedColor);
    setNewCtrName('');
    setMode('LIST');
  };

  return (
    <div
      ref={containerRef}
      className="date-ctr-popover-card"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Popover Header */}
      <div className="date-ctr-header">
        <div className="date-ctr-title">
          <Hash className="icon-xs text-purple" />
          <span>Counters · {dayDisplayStr}</span>
        </div>
        <button
          type="button"
          className="btn-close-popover"
          onClick={onClose}
          title="Close counter popover"
        >
          <X className="icon-nano" />
        </button>
      </div>

      {/* Popover Body Mode Switch */}
      {mode === 'LIST' && (
        <div className="date-ctr-body">
          {activeCTRItems.length === 0 ? (
            <div className="date-ctr-empty">
              <p className="empty-subtext">No counters active for {dayDisplayStr}</p>
            </div>
          ) : (
            <div className="date-ctr-list">
              {activeCTRItems.map((c) => {
                const count = c.dailyValues[dateStr] ?? 0;

                return (
                  <div key={c.id} className="date-ctr-row">
                    <div className="date-ctr-label">
                      <span className="ctr-dot-badge" style={{ backgroundColor: c.color }} />
                      <span className="ctr-name-text" title={c.name}>{c.name}</span>
                    </div>

                    <div className="date-ctr-controls">
                      <button
                        type="button"
                        className="ctr-btn btn-minus"
                        onClick={() => onIncrement(c.id, dateStr, -1)}
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
                          onUpdateValue(c.id, dateStr, isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        min={0}
                        title="Direct count value"
                      />

                      <button
                        type="button"
                        className="ctr-btn btn-plus"
                        onClick={() => onIncrement(c.id, dateStr, 1)}
                        title="Increase count"
                      >
                        <Plus className="icon-nano" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="date-ctr-footer">
            <button
              type="button"
              className="btn-add-ctr-popover"
              onClick={() => setMode('ADD')}
            >
              <PlusCircle className="icon-nano" />
              <span>+ Add CTR</span>
            </button>
          </div>
        </div>
      )}

      {mode === 'ADD' && (
        <div className="date-ctr-body">
          <div className="date-ctr-subnav">
            <button
              type="button"
              className="btn-subnav-back"
              onClick={() => setMode('LIST')}
            >
              <ArrowLeft className="icon-nano" />
              <span>Back</span>
            </button>
            <span className="subnav-title font-bold">Add Counter</span>
          </div>

          <div className="date-ctr-add-section">
            {availableCTRsToAdd.length > 0 && (
              <>
                <p className="section-label">Existing counters</p>
                <div className="existing-ctr-picker-list">
                  {availableCTRsToAdd.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="existing-ctr-item-btn"
                      onClick={() => handleAddExistingCTR(c.id)}
                    >
                      <span className="ctr-dot-badge" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              className="btn-create-new-ctr-trigger"
              onClick={() => setMode('CREATE')}
            >
              <Plus className="icon-nano" />
              <span>+ Create New CTR</span>
            </button>
          </div>
        </div>
      )}

      {mode === 'CREATE' && (
        <div className="date-ctr-body">
          <div className="date-ctr-subnav">
            <button
              type="button"
              className="btn-subnav-back"
              onClick={() => setMode('ADD')}
            >
              <ArrowLeft className="icon-nano" />
              <span>Back</span>
            </button>
            <span className="subnav-title font-bold">New Counter</span>
          </div>

          <form onSubmit={handleCreateNewCTR} className="create-ctr-mini-form">
            <label className="form-mini-label">
              <span>Counter Name</span>
              <input
                type="text"
                className="form-mini-input"
                placeholder="e.g. DSA Medium Questions"
                value={newCtrName}
                onChange={(e) => setNewCtrName(e.target.value)}
                autoFocus
                required
              />
            </label>

            <div className="form-mini-label">
              <span>Color</span>
              <div className="mini-color-picker-row">
                {CTR_PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`mini-color-dot ${selectedColor === preset.hex ? 'selected' : ''}`}
                    style={{ backgroundColor: preset.hex }}
                    onClick={() => setSelectedColor(preset.hex)}
                    title={preset.name}
                  >
                    {selectedColor === preset.hex && <Check className="icon-nano text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mini-form-actions">
              <button
                type="button"
                className="btn-secondary btn-xs"
                onClick={() => setMode('LIST')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary btn-xs"
                disabled={!newCtrName.trim()}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
