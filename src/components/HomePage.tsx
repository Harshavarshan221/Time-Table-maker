import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  BarChart2,
  PlusCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Flame,
  Bot,
  Layers,
  History,
} from 'lucide-react';
import type { Task, CategoryConfig } from '../types/timetable';
import { getEmotionConfig, type EmotionId, EMOTIONS } from '../constants/emotions';
import {
  generateAIMeme,
  generateAIMotivation,
  type AIMemeResponse,
  type AIMotivationResponse,
} from '../services/aiMoodService';
import { EmotionCheckInModal } from './EmotionCheckInModal';
import { formatTimeRange, formatDurationLabel } from '../utils/dateUtils';
import type { User } from 'firebase/auth';

interface HomePageProps {
  currentUser: User | null;
  selectedDate: Date;
  todayTasks: Task[];
  allScheduledTasks: Task[];
  categories: CategoryConfig[];
  currentEmotionId: EmotionId | null;
  onSelectEmotion: (emotionId: EmotionId) => void;
  onNavigateToGrid: () => void;
  onNavigateToAnalytics: () => void;
  onOpenCreateTaskModal: () => void;
  onOpenTrashModal: () => void;
  onEditTask: (task: Task) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  selectedDate,
  todayTasks,
  categories,
  currentEmotionId,
  onSelectEmotion,
  onNavigateToGrid,
  onNavigateToAnalytics,
  onOpenCreateTaskModal,
  onOpenTrashModal,
  onEditTask,
}) => {
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  const [aiMeme, setAiMeme] = useState<AIMemeResponse | null>(null);
  const [isLoadingMeme, setIsLoadingMeme] = useState(false);

  const [aiMotivation, setAiMotivation] = useState<AIMotivationResponse | null>(null);
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Friend';
  const emotionConfig = currentEmotionId ? getEmotionConfig(currentEmotionId) : null;

  // Determine greeting based on current hour
  const currentHour = new Date().getHours();
  const greetingTime =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Format today date text
  const dateFormatted = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate Today's Progress
  const totalTasks = todayTasks.length;
  const currentMins = new Date().getHours() * 60 + new Date().getMinutes();
  const completedTasks = todayTasks.filter((t) => {
    if (!t.startTime) return false;
    const [h, m] = t.startTime.split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + (t.durationMinutes || 60);
    return currentMins >= endMins;
  }).length;

  const progressPercentage =
    totalTasks > 0 ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0;

  // Extract task categories, avoiding reliance on "Untitled Task"
  const taskCategories = todayTasks.map((t) => t.category);

  // Independent Meme Refresh
  const fetchMeme = (emotionId: EmotionId, forceRefresh: boolean = false) => {
    setIsLoadingMeme(true);
    generateAIMeme(emotionId, userName, taskCategories, forceRefresh).then((res) => {
      setAiMeme(res);
      setIsLoadingMeme(false);
    });
  };

  // Independent Motivation Refresh
  const fetchMotivation = (emotionId: EmotionId, forceRefresh: boolean = false) => {
    setIsLoadingMotivation(true);
    generateAIMotivation(emotionId, userName, taskCategories, forceRefresh).then((res) => {
      setAiMotivation(res);
      setIsLoadingMotivation(false);
    });
  };

  // Generate AI Content whenever emotion or user changes
  useEffect(() => {
    if (!currentEmotionId) {
      setAiMeme(null);
      setAiMotivation(null);
      return;
    }

    fetchMeme(currentEmotionId, false);
    fetchMotivation(currentEmotionId, false);
  }, [currentEmotionId, userName, todayTasks.length]);

  return (
    <div className="home-page-container">
      {/* 1. HERO GREETING BANNER */}
      <section className="home-hero-section">
        <div className="hero-greeting-box">
          <div className="greeting-pill-badge">
            <Sparkles className="icon-nano text-primary" />
            <span>Daily AI Companion</span>
          </div>
          <h2 className="hero-greeting-title">
            {greetingTime}, <span className="highlight-name">{userName}</span> 👋
          </h2>
          <p className="hero-greeting-sub">
            Ready to make today count? Check in with your vibe and let's tackle your schedule.
          </p>
        </div>

        <div className="hero-right-actions">
          <div className="hero-date-badge">
            <Calendar className="icon-xs" />
            <span>{dateFormatted}</span>
          </div>
        </div>
      </section>

      {/* 2. DAILY MOOD SECTION */}
      <section className="home-section mood-section">
        {emotionConfig ? (
          <div
            className="current-mood-card"
            style={{
              background: emotionConfig.bgGradient,
              borderColor: emotionConfig.borderColor,
            }}
          >
            <div className="mood-card-header">
              <span className="mood-badge-label" style={{ color: emotionConfig.textColor }}>
                TODAY'S MOOD
              </span>
              <div className="mood-header-actions">
                <button
                  type="button"
                  className="btn-change-mood"
                  onClick={() => setIsCheckInModalOpen(true)}
                >
                  <RefreshCw className="icon-nano" />
                  <span>Change Mood</span>
                </button>
              </div>
            </div>

            <div className="mood-display-body">
              <span className="mood-emoji-display">{emotionConfig.emoji}</span>
              <div className="mood-text-info">
                <h3 className="mood-title-text" style={{ color: emotionConfig.textColor }}>
                  {emotionConfig.label}
                </h3>
                <p className="mood-tagline" style={{ color: emotionConfig.textColor }}>
                  {emotionConfig.vibeTagline}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="inline-checkin-banner">
            <div className="checkin-banner-title">
              <Sparkles className="icon-sm text-primary" />
              <h3>How are you feeling today? 🌱</h3>
            </div>
            <p className="checkin-banner-sub">Pick the vibe that matches your energy right now.</p>

            <div className="inline-emotion-chips">
              {EMOTIONS.map((emo) => (
                <button
                  key={emo.id}
                  type="button"
                  className="inline-chip-btn"
                  style={{
                    borderColor: emo.borderColor,
                    backgroundColor: '#FFFFFF',
                    color: emo.textColor,
                  }}
                  onClick={() => onSelectEmotion(emo.id)}
                >
                  <span className="chip-emoji">{emo.emoji}</span>
                  <span className="chip-label">{emo.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. AI MEME & MOTIVATION SECTION (If mood is selected) */}
      {emotionConfig && (
        <section className="home-section ai-vibe-grid">
          {/* AI MEME CARD (Independent Reload Button) */}
          <div className="ai-card meme-card">
            <div className="card-badge-header">
              <span className="badge-pill meme-pill">
                <Bot className="icon-nano" /> YOUR DAILY VIBE
              </span>
              <div className="flex-align-center gap-2">
                <button
                  type="button"
                  className="btn-regen-sm"
                  onClick={() => fetchMeme(currentEmotionId, true)}
                  disabled={isLoadingMeme}
                  title="Generate another meme"
                >
                  <RefreshCw className={`icon-nano ${isLoadingMeme ? 'spin-icon' : ''}`} />
                </button>
              </div>
            </div>

            {isLoadingMeme ? (
              <div className="ai-loading-placeholder">
                <RefreshCw className="icon-sm spin-icon text-primary" />
                <span>Generating custom meme vibe...</span>
              </div>
            ) : aiMeme ? (
              <div className="meme-content-box">
                <div className="meme-emoji-hero">{aiMeme.emoji}</div>
                <div className="meme-text-block">
                  <div className="meme-setup">{aiMeme.setup}</div>
                  <div className="meme-punchline">{aiMeme.punchline}</div>
                </div>
              </div>
            ) : null}
          </div>

          {/* AI MOTIVATION CARD (Independent Reload Button) */}
          <div className="ai-card motivation-card">
            <div className="card-badge-header">
              <span className="badge-pill motivation-pill">
                <Flame className="icon-nano" /> A LITTLE PUSH 🚀
              </span>
              <div className="flex-align-center gap-2">
                <button
                  type="button"
                  className="btn-regen-sm"
                  onClick={() => fetchMotivation(currentEmotionId, true)}
                  disabled={isLoadingMotivation}
                  title="Generate another motivation quote"
                >
                  <RefreshCw className={`icon-nano ${isLoadingMotivation ? 'spin-icon' : ''}`} />
                </button>
              </div>
            </div>

            {isLoadingMotivation ? (
              <div className="ai-loading-placeholder">
                <RefreshCw className="icon-sm spin-icon text-primary" />
                <span>Getting your motivation ready...</span>
              </div>
            ) : aiMotivation ? (
              <div className="motivation-content-box">
                <blockquote className="motivation-quote">
                  "{aiMotivation.motivation}"
                </blockquote>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* 4. TODAY'S MISSIONS & SCHEDULE SUMMARY */}
      <section className="home-section schedule-summary-section">
        <div className="section-header-row">
          <div className="section-title-group">
            <h3 className="section-title">
              <Clock className="icon-sm text-primary" /> Today's Missions 🚀
            </h3>
            <span className="section-count-badge">{totalTasks} tasks</span>
          </div>

          <button
            type="button"
            className="btn-link-action"
            onClick={onNavigateToGrid}
          >
            <span>View Full Timetable Grid</span>
            <ArrowRight className="icon-xs" />
          </button>
        </div>

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div className="progress-card">
            <div className="progress-label-row">
              <span className="progress-title">Today's Progress</span>
              <span className="progress-percentage">{progressPercentage}% Complete</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Compact Schedule Tasks List */}
        {totalTasks === 0 ? (
          <div className="empty-schedule-card">
            <Layers className="empty-icon" />
            <div className="empty-title">No tasks scheduled for today yet</div>
            <p className="empty-sub">Open the timetable or click "Add Task" to plan your day!</p>
            <button
              type="button"
              className="btn-primary btn-sm margin-top-12"
              onClick={onOpenCreateTaskModal}
            >
              <PlusCircle className="icon-xs" />
              <span>Create New Task</span>
            </button>
          </div>
        ) : (
          <div className="compact-tasks-list">
            {todayTasks.map((task) => {
              const catObj = categories.find((c) => c.name === task.category);
              const catColor = catObj?.borderColor || '#3B82F6';
              const catBg = catObj?.color || '#EFF6FF';
              const catText = catObj?.textColor || '#1E40AF';

              const timeRangeStr = task.startTime
                ? formatTimeRange(task.startTime, task.durationMinutes)
                : '';

              return (
                <div
                  key={task.id}
                  className="compact-task-item"
                  style={{ borderLeftColor: catColor }}
                  onClick={() => onEditTask(task)}
                >
                  <div className="item-time-col">
                    <span className="time-text">{timeRangeStr}</span>
                    <span className="duration-text">({formatDurationLabel(task.durationMinutes)})</span>
                  </div>

                  <div className="item-info-col">
                    <span
                      className="category-pill-nano"
                      style={{ backgroundColor: catBg, color: catText, borderColor: catColor }}
                    >
                      {task.category}
                    </span>
                    <h4 className="compact-task-title">{task.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. QUICK ACTIONS GRID */}
      <section className="home-section quick-actions-section">
        <h3 className="section-title margin-bottom-12">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button
            type="button"
            className="action-card-btn action-grid"
            onClick={onNavigateToGrid}
          >
            <div className="action-icon-badge icon-bg-blue">
              <Calendar className="icon-sm" />
            </div>
            <div className="action-text-box">
              <span className="action-title">Weekly Timetable</span>
              <span className="action-sub">Open interactive grid</span>
            </div>
          </button>

          <button
            type="button"
            className="action-card-btn action-add"
            onClick={onOpenCreateTaskModal}
          >
            <div className="action-icon-badge icon-bg-green">
              <PlusCircle className="icon-sm" />
            </div>
            <div className="action-text-box">
              <span className="action-title">Add Task</span>
              <span className="action-sub">Create new item</span>
            </div>
          </button>

          <button
            type="button"
            className="action-card-btn action-analytics"
            onClick={onNavigateToAnalytics}
          >
            <div className="action-icon-badge icon-bg-purple">
              <BarChart2 className="icon-sm" />
            </div>
            <div className="action-text-box">
              <span className="action-title">Analytics</span>
              <span className="action-sub">Track study habits</span>
            </div>
          </button>

          <button
            type="button"
            className="action-card-btn action-trash"
            onClick={onOpenTrashModal}
          >
            <div className="action-icon-badge icon-bg-amber">
              <History className="icon-sm" />
            </div>
            <div className="action-text-box">
              <span className="action-title">Trash & History</span>
              <span className="action-sub">Restore deleted tasks</span>
            </div>
          </button>
        </div>
      </section>

      {/* Emotion Selection Modal */}
      <EmotionCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onSelectEmotion={onSelectEmotion}
        currentEmotionId={currentEmotionId}
      />
    </div>
  );
};
