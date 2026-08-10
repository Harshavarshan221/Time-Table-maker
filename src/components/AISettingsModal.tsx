import React, { useState } from 'react';
import { X, Bot, Sparkles, Key, ExternalLink, Check } from 'lucide-react';
import { getStoredGeminiApiKey, saveGeminiApiKey } from '../services/aiMoodService';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState(() => getStoredGeminiApiKey());
  const [isSavedToast, setIsSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(apiKey);
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onKeySaved();
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content ai-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h3 className="modal-title flex-align-center gap-2">
              <Bot className="icon-sm text-primary" />
              Connect Gemini AI Companion
            </h3>
            <p className="modal-subtitle">
              Power real-time AI daily meme generation and personalized motivation for your mood!
            </p>
          </div>
          <button className="btn-modal-close" onClick={onClose} title="Close">
            <X className="icon-sm" />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <div className="form-group">
            <label htmlFor="gemini-key-input" className="form-label flex-align-center gap-2">
              <Key className="icon-xs text-primary" />
              Gemini API Key
            </label>
            <input
              id="gemini-key-input"
              type="password"
              className="form-input"
              placeholder="Paste your Gemini API key (AIzaSy...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoFocus
            />
            <span className="form-hint-text">
              Key is stored locally in your browser and used only to call Gemini API.
            </span>
          </div>

          <div className="ai-key-info-box">
            <Sparkles className="icon-xs text-primary" />
            <div>
              <strong>Need a free API Key?</strong> Get one in 10 seconds from Google AI Studio.
              <br />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="ai-link"
              >
                Get Free Gemini API Key <ExternalLink className="icon-nano" />
              </a>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn-primary flex-align-center gap-2">
              {isSavedToast ? (
                <>
                  <Check className="icon-xs" />
                  <span>Key Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="icon-xs" />
                  <span>Save & Activate AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
