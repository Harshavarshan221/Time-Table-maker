import React from 'react';
import { X, Settings, Clock, LayoutGrid } from 'lucide-react';

export interface GridSettings {
  startHour: number;
  endHour: number;
  hourHeightPx: number;
}

interface GridSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GridSettings;
  onSaveSettings: (newSettings: GridSettings) => void;
}

const START_HOUR_OPTIONS = [
  { label: '05:00 AM', value: 5 },
  { label: '06:00 AM', value: 6 },
  { label: '07:00 AM', value: 7 },
  { label: '08:00 AM (Default)', value: 8 },
  { label: '09:00 AM', value: 9 },
  { label: '10:00 AM', value: 10 },
];

const END_HOUR_OPTIONS = [
  { label: '08:00 PM (20:00)', value: 20 },
  { label: '09:00 PM (21:00)', value: 21 },
  { label: '10:00 PM (Default)', value: 22 },
  { label: '11:00 PM (23:00)', value: 23 },
  { label: '12:00 AM Midnight (24:00)', value: 24 },
];

const SPACING_OPTIONS = [
  { label: 'Compact (48px / hr)', value: 48 },
  { label: 'Standard (64px / hr)', value: 64 },
  { label: 'Spacious (80px / hr)', value: 80 },
  { label: 'Detailed (96px / hr)', value: 96 },
];

export const GridSettingsModal: React.FC<GridSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content grid-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Settings className="icon-sm" /> Timetable Grid Settings
          </h3>
          <button className="btn-modal-close" onClick={onClose}>
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* Start Hour */}
          <div className="form-group">
            <label className="form-label">
              <Clock className="icon-xs" />
              Grid Start Time (Morning)
            </label>
            <select
              className="form-select"
              value={settings.startHour}
              onChange={(e) =>
                onSaveSettings({
                  ...settings,
                  startHour: Number(e.target.value),
                })
              }
            >
              {START_HOUR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* End Hour */}
          <div className="form-group">
            <label className="form-label">
              <Clock className="icon-xs" />
              Grid End Time (Night)
            </label>
            <select
              className="form-select"
              value={settings.endHour}
              onChange={(e) =>
                onSaveSettings({
                  ...settings,
                  endHour: Number(e.target.value),
                })
              }
            >
              {END_HOUR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Spacing / Row Height */}
          <div className="form-group">
            <label className="form-label">
              <LayoutGrid className="icon-xs" />
              Row Spacing / Resolution
            </label>
            <select
              className="form-select"
              value={settings.hourHeightPx}
              onChange={(e) =>
                onSaveSettings({
                  ...settings,
                  hourHeightPx: Number(e.target.value),
                })
              }
            >
              {SPACING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
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
