import React, { useState } from 'react';
import { X, Sparkles, Sliders, Check } from 'lucide-react';
import {
  MEME_STYLES,
  MOTIVATION_STYLES,
  INTENSITY_LEVELS,
  type AIPreferences,
  type MemeIntensity,
  type MotivationIntensity,
} from '../../constants/aiStyleOptions';

interface AIStyleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: AIPreferences;
  onSavePreferences: (newPrefs: AIPreferences) => void;
}

export const AIStyleSelectorModal: React.FC<AIStyleSelectorModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<'meme' | 'motivation'>('meme');
  const [localPrefs, setLocalPrefs] = useState<AIPreferences>(preferences);

  if (!isOpen) return null;

  const handleSelectMemeStyle = (styleId: string) => {
    setLocalPrefs((prev) => ({ ...prev, memeStyle: styleId }));
  };

  const handleSelectMemeIntensity = (intensity: MemeIntensity) => {
    setLocalPrefs((prev) => ({ ...prev, memeIntensity: intensity }));
  };

  const handleSelectMotivationStyle = (styleId: string) => {
    setLocalPrefs((prev) => ({ ...prev, motivationStyle: styleId }));
  };

  const handleSelectMotivationIntensity = (intensity: MotivationIntensity) => {
    setLocalPrefs((prev) => ({ ...prev, motivationIntensity: intensity }));
  };

  const handleSave = () => {
    onSavePreferences(localPrefs);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content custom-vibe-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <div className="modal-icon-badge bg-purple">
              <Sliders className="icon-sm text-purple" />
            </div>
            <div>
              <h3 className="modal-title">Customize AI Personalization</h3>
              <p className="modal-subtitle">Configure how Gemini talks to you (Meme & Motivation are independent)</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X className="icon-xs" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="ai-style-tabs">
          <button
            type="button"
            className={`ai-style-tab-btn ${activeTab === 'meme' ? 'active' : ''}`}
            onClick={() => setActiveTab('meme')}
          >
            <span>🎭 Meme Style</span>
          </button>
          <button
            type="button"
            className={`ai-style-tab-btn ${activeTab === 'motivation' ? 'active' : ''}`}
            onClick={() => setActiveTab('motivation')}
          >
            <span>🚀 Motivation Style</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body gap-16">
          {activeTab === 'meme' ? (
            <div className="style-section">
              <label className="form-label">Choose Meme Style:</label>
              <div className="style-chip-grid">
                {MEME_STYLES.map((m) => {
                  const isSelected = localPrefs.memeStyle === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`style-card-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectMemeStyle(m.id)}
                    >
                      <div className="chip-header">
                        <span className="chip-emoji">{m.emoji}</span>
                        <span className="chip-title">{m.label}</span>
                        {isSelected && <Check className="icon-nano text-primary margin-left-auto" />}
                      </div>
                      <p className="chip-desc">{m.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="intensity-selector margin-top-16">
                <label className="form-label">Meme Humor Intensity:</label>
                <div className="intensity-btn-row">
                  {INTENSITY_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`intensity-btn ${localPrefs.memeIntensity === lvl.id ? 'active' : ''}`}
                      onClick={() => handleSelectMemeIntensity(lvl.id as MemeIntensity)}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="style-section">
              <label className="form-label">Choose Motivation Style:</label>
              <div className="style-chip-grid">
                {MOTIVATION_STYLES.map((m) => {
                  const isSelected = localPrefs.motivationStyle === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`style-card-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectMotivationStyle(m.id)}
                    >
                      <div className="chip-header">
                        <span className="chip-emoji">{m.emoji}</span>
                        <span className="chip-title">{m.label}</span>
                        {isSelected && <Check className="icon-nano text-primary margin-left-auto" />}
                      </div>
                      <p className="chip-desc">{m.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="intensity-selector margin-top-16">
                <label className="form-label">Motivation Intensity:</label>
                <div className="intensity-btn-row">
                  {INTENSITY_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`intensity-btn ${localPrefs.motivationIntensity === lvl.id ? 'active' : ''}`}
                      onClick={() => handleSelectMotivationIntensity(lvl.id as MotivationIntensity)}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            <Sparkles className="icon-xs" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
