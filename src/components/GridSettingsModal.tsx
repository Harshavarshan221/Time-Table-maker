import React from 'react';
import { X, Settings, Clock, LayoutGrid, ToggleLeft } from 'lucide-react';
import { minutesToFormattedTime } from '../utils/dateUtils';

export interface GridSettings {
  startHour: number;
  endHour: number;
  hourHeightPx: number;
  timeFormat?: '12h' | '24h';
}

interface GridSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GridSettings;
  onSaveSettings: (newSettings: GridSettings) => void;
}

const START_HOUR_OPTIONS = [
  { label: '12:00 AM Midnight (00:00)', value: 0 },
  { label: '01:00 AM', value: 1 },
  { label: '02:00 AM', value: 2 },
  { label: '03:00 AM (Early Morning)', value: 3 },
  { label: '04:00 AM (Early Morning)', value: 4 },
  { label: '05:00 AM', value: 5 },
  { label: '06:00 AM', value: 6 },
  { label: '07:00 AM', value: 7 },
  { label: '08:00 AM (Default)', value: 8 },
  { label: '09:00 AM', value: 9 },
  { label: '10:00 AM', value: 10 },
  { label: '11:00 AM', value: 11 },
];

const SPACING_OPTIONS = [
  { label: 'Compact (48px / hr)', value: 48 },
  { label: 'Standard (64px / hr)', value: 64 },
  { label: 'Spacious (80px / hr)', value: 80 },
  { label: 'Detailed (96px / hr)', value: 96 },
];

function getEndHourOptions(startHour: number, timeFormat: '12h' | '24h' = '12h') {
  const full24hValue = startHour + 24;
  const commonEndValues = [18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
  const uniqueValues = new Set([...commonEndValues, full24hValue]);

  const sortedValues = Array.from(uniqueValues)
    .filter((v) => v > startHour && v <= startHour + 24)
    .sort((a, b) => a - b);

  return sortedValues.map((val) => {
    const formatted = minutesToFormattedTime(val * 60, timeFormat);
    const isFullCycle = val === full24hValue;
    const labelSuffix = isFullCycle
      ? ' ⭐️ (Default 24-Hour Full Cycle)'
      : val > 24
      ? ' (Next Day)'
      : '';

    return {
      label: `${formatted}${labelSuffix}`,
      value: val,
    };
  });
}

export const GridSettingsModal: React.FC<GridSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  const currentFormat = settings.timeFormat || '12h';
  const endHourOptions = getEndHourOptions(settings.startHour, currentFormat);

  // When Start Hour changes, AUTOMATICALLY default End Hour to 24 Hours later (same time next morning)
  const handleStartHourChange = (newStart: number) => {
    const default24hEnd = newStart + 24;
    onSaveSettings({
      ...settings,
      startHour: newStart,
      endHour: default24hEnd,
    });
  };

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
          {/* Time Display Format (12h vs 24h) */}
          <div className="form-group">
            <label className="form-label">
              <ToggleLeft className="icon-xs text-primary" />
              Time Display Format
            </label>
            <div className="time-format-toggle-group">
              <button
                type="button"
                className={`btn-format-toggle ${currentFormat === '12h' ? 'active' : ''}`}
                onClick={() => onSaveSettings({ ...settings, timeFormat: '12h' })}
              >
                12-Hour Format (AM / PM)
              </button>
              <button
                type="button"
                className={`btn-format-toggle ${currentFormat === '24h' ? 'active' : ''}`}
                onClick={() => onSaveSettings({ ...settings, timeFormat: '24h' })}
              >
                24-Hour Format (00:00 - 24:00)
              </button>
            </div>
          </div>

          {/* Start Hour */}
          <div className="form-group">
            <label className="form-label">
              <Clock className="icon-xs text-primary" />
              Morning Start Time (Any Hour Choice)
            </label>
            <select
              className="form-select"
              value={settings.startHour}
              onChange={(e) => handleStartHourChange(Number(e.target.value))}
            >
              {START_HOUR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="form-hint-text">
              ✨ Selecting a start time automatically defaults the timetable grid to cover a full 24-hour cycle.
            </span>
          </div>

          {/* End Hour */}
          <div className="form-group">
            <label className="form-label">
              <Clock className="icon-xs text-primary" />
              Grid End Time (Defaults to 24 Hours / Custom)
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
              {endHourOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Spacing / Row Height */}
          <div className="form-group">
            <label className="form-label">
              <LayoutGrid className="icon-xs text-primary" />
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
