import React, { useState } from 'react';
import { X, Sparkles, Sliders, Check } from 'lucide-react';

interface CustomVibeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: string;
  onSaveStyle: (style: string) => void;
}

export const VIBE_PRESETS = [
  { id: 'default', label: '🎓 Student / College Humor', value: '' },
  { id: 'gym', label: '💪 Gym Bro Hype', value: 'Gym bro hype, pure energy, gains, zero excuses, heavy weights mindset' },
  { id: 'anime', label: '⛩️ Anime Protagonist', value: 'Anime protagonist motivation, training arc, power level rising, never giving up' },
  { id: 'stoic', label: '🧘 Stoic Wisdom', value: 'Stoic philosophy, Marcus Aurelius wisdom, calm discipline, deep inner peace' },
  { id: 'techlead', label: '💻 Sarcastic Senior Tech Lead', value: 'Sarcastic Senior Tech Lead reviewing code, shipping to production, zero bugs' },
  { id: 'pirate', label: '🏴‍☠️ Pirate Captain', value: 'Pirate Captain commanding the ship, sailing to victory, arrr matey' },
];

export const CustomVibeModal: React.FC<CustomVibeModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSaveStyle,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    const found = VIBE_PRESETS.find((p) => p.value === currentStyle);
    return found ? found.id : currentStyle ? 'custom' : 'default';
  });
  const [customInputValue, setCustomInputValue] = useState(currentStyle);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string, value: string) => {
    setSelectedPreset(presetId);
    if (presetId !== 'custom') {
      setCustomInputValue(value);
    }
  };

  const handleSave = () => {
    const finalStyle = selectedPreset === 'custom' ? customInputValue : (VIBE_PRESETS.find(p => p.id === selectedPreset)?.value || '');
    onSaveStyle(finalStyle);
    onClose();
  };

  const handleReset = () => {
    setSelectedPreset('default');
    setCustomInputValue('');
    onSaveStyle('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content custom-vibe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <div className="modal-icon-badge bg-purple">
              <Sliders className="icon-sm text-purple" />
            </div>
            <div>
              <h3 className="modal-title">Customize AI Vibe & Quote Style</h3>
              <p className="modal-subtitle">Tell Gemini how you want your quotes and motivation to sound!</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X className="icon-xs" />
          </button>
        </div>

        <div className="modal-body gap-16">
          <div className="form-group">
            <label className="form-label">Choose a Vibe Style Preset:</label>
            <div className="vibe-preset-grid">
              {VIBE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`preset-chip-btn ${selectedPreset === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(p.id, p.value)}
                >
                  <span>{p.label}</span>
                  {selectedPreset === p.id && <Check className="icon-nano text-primary" />}
                </button>
              ))}
              <button
                type="button"
                className={`preset-chip-btn ${selectedPreset === 'custom' ? 'active' : ''}`}
                onClick={() => setSelectedPreset('custom')}
              >
                <span>✏️ Custom Prompt</span>
                {selectedPreset === 'custom' && <Check className="icon-nano text-primary" />}
              </button>
            </div>
          </div>

          {selectedPreset === 'custom' && (
            <div className="form-group">
              <label className="form-label">Type Your Custom AI Instruction:</label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                placeholder='e.g., "Speak like Gordon Ramsay reviewing my study habits" or "Cyberpunk hacker tone"'
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
              />
              <span className="form-help-text">Gemini will tailor memes and quotes to match your custom prompt!</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset to Default
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            <Sparkles className="icon-xs" />
            <span>Apply Vibe Style</span>
          </button>
        </div>
      </div>
    </div>
  );
};
