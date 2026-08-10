import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { EMOTIONS, type EmotionId } from '../constants/emotions';

interface EmotionCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmotion: (emotionId: EmotionId) => void;
  currentEmotionId?: EmotionId | null;
}

export const EmotionCheckInModal: React.FC<EmotionCheckInModalProps> = ({
  isOpen,
  onClose,
  onSelectEmotion,
  currentEmotionId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop emotion-modal-backdrop" onClick={onClose}>
      <div className="modal-content emotion-checkin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h3 className="modal-title flex-align-center gap-2">
              <Sparkles className="icon-sm text-primary animate-pulse" />
              How are you feeling today?
            </h3>
            <p className="modal-subtitle">Pick the vibe that matches your energy right now.</p>
          </div>
          <button className="btn-modal-close" onClick={onClose} title="Close">
            <X className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          <div className="emotion-grid">
            {EMOTIONS.map((emo) => {
              const isSelected = currentEmotionId === emo.id;
              return (
                <button
                  key={emo.id}
                  type="button"
                  className={`emotion-card-btn ${isSelected ? 'selected' : ''}`}
                  style={{
                    backgroundColor: isSelected ? emo.themeColor : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : emo.textColor,
                    borderColor: emo.borderColor,
                  }}
                  onClick={() => {
                    onSelectEmotion(emo.id);
                    onClose();
                  }}
                >
                  <span className="emotion-emoji-lg">{emo.emoji}</span>
                  <span className="emotion-label-text">{emo.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
