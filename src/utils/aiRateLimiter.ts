export interface RateLimitState {
  timestamps: number[];
  cooldownUntil: number | null;
}

const STORAGE_KEY = 'timetable_ai_rate_limit_v1';
const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000;       // 1 minute rolling window
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes cooldown

export const SATIRE_MESSAGES = [
  "Bro 😭 you're spending more time refreshing motivation than doing the actual work.",
  "You've generated enough motivation for today. Now go use some of it. 💀",
  "At this point, the quote generator is doing more work than you are. 😭",
  "10 quotes in a minute? My brother in productivity... PLEASE DO THE TASK. 💀",
  "Maybe the next quote isn't the answer. The next 25 minutes of work might be. 🚀",
];

export function getRateLimitState(): RateLimitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { timestamps: [], cooldownUntil: null };
}

export function saveRateLimitState(state: RateLimitState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/**
 * Format seconds into MM:SS (e.g. 102 -> "01:42")
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Clean up timestamps older than 60s and check if cooldown is currently active.
 */
export function checkRateLimitStatus(): {
  isCoolingDown: boolean;
  secondsRemaining: number;
  currentCount: number;
} {
  const now = Date.now();
  const state = getRateLimitState();

  // Check if active cooldown exists
  if (state.cooldownUntil && state.cooldownUntil > now) {
    const secondsRemaining = Math.ceil((state.cooldownUntil - now) / 1000);
    return {
      isCoolingDown: true,
      secondsRemaining,
      currentCount: state.timestamps.length,
    };
  }

  // Filter timestamps within rolling 60-second window
  const validTimestamps = state.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (validTimestamps.length !== state.timestamps.length || state.cooldownUntil !== null) {
    saveRateLimitState({ timestamps: validTimestamps, cooldownUntil: null });
  }

  return {
    isCoolingDown: false,
    secondsRemaining: 0,
    currentCount: validTimestamps.length,
  };
}

/**
 * Record a new request attempt before making an API call.
 */
export function attemptRequest(): {
  allowed: boolean;
  isCoolingDown: boolean;
  secondsRemaining: number;
  satireMessage?: string;
} {
  const now = Date.now();
  const status = checkRateLimitStatus();

  if (status.isCoolingDown) {
    const satireMessage = SATIRE_MESSAGES[Math.floor(Math.random() * SATIRE_MESSAGES.length)];
    return {
      allowed: false,
      isCoolingDown: true,
      secondsRemaining: status.secondsRemaining,
      satireMessage,
    };
  }

  const state = getRateLimitState();
  const validTimestamps = state.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    // Trigger 2-minute cooldown
    const cooldownUntil = now + COOLDOWN_MS;
    saveRateLimitState({ timestamps: validTimestamps, cooldownUntil });
    const satireMessage = SATIRE_MESSAGES[Math.floor(Math.random() * SATIRE_MESSAGES.length)];

    return {
      allowed: false,
      isCoolingDown: true,
      secondsRemaining: 120,
      satireMessage,
    };
  }

  // Allowed! Add current timestamp
  validTimestamps.push(now);
  saveRateLimitState({ timestamps: validTimestamps, cooldownUntil: null });

  return {
    allowed: true,
    isCoolingDown: false,
    secondsRemaining: 0,
  };
}
