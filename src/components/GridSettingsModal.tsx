import React from 'react';
import { X, Settings, Clock, LayoutGrid } from 'lucide-react';
import { minutesToFormattedTime } from '../utils/dateUtils';

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
  { label: '04:00 AM (Early Morning)', value: 4 },
  { label: '05:00 AM', value: 5 },
  { label: '06:00 AM', value: 6 },
  { label: '07:00 AM', value: 7 },
  { label: '08:00 AM (Default)', value: 8 },
  { label: '09:00 AM', value: 9 },
  { label: '10:00 AM', value: 10 },
  { label: '12:00 AM Midnight (00:00)', value: 0 },
];

const SPACING_OPTIONS = [
  { label: 'Compact (48px / hr)', value: 48 },
  { label: 'Standard (64px / hr)', value: 64 },
  { label: 'Spacious (80px / hr)', value: 80 },
  { label: 'Detailed (96px / hr)', value: 96 },
];

function getEndHourOptions(startHour: number) {
  const full24hValue = startHour + 24;
  const commonEndValues = [20, 21, 22, 23, 24, 25, 26, 27, 28];
  const uniqueValues = new Set([...commonEndValues, full24hValue]);

  const sortedValues = Array.from(uniqueValues)
    .filter((v) => v > startHour)
    .sort((a, b) => a - b);

  return sortedValues.map((val) => {
    const formatted = minutesToFormattedTime(val * 60);
    const isFullCycle = val === full24hValue;
    const labelSuffix = isFullCycle
      ? ' ⭐️ (Full 24-Hour Cycle - Upto Morning)'
      : val > 24
      ? ' (Next Morning)'
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

  const endHourOptions = getEndHourOptions(settings.startHour);

  const handleStartHourChange = (newStart: number) => {
    const updatedEnd = settings.endHour <= newStart ? newStart + 24 : settings.endHour;
    onSaveSettings({
      ...settings,
      startHour: newStart,
      endHour: updatedEnd,
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
          {/* Start Hour */}
          <div className="form-group">
            <label className="form-label">
              <Clock className="icon-xs text-primary" />
              Morning Start Time (Your Choice)
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
          </div>

          {/* End Hour */}
          <div className="form-group">
            <label className="form-label">
              <Clock className="icon-xs text-primary" />
              Grid End Time (Upto Morning or Your Choice)
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
