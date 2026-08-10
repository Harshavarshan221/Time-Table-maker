export interface StyleOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  instruction: string;
}

export type MemeIntensity = 'low' | 'medium' | 'high';
export type MotivationIntensity = 'gentle' | 'medium' | 'extreme';

export interface AIPreferences {
  memeStyle: string;
  memeIntensity: MemeIntensity;
  motivationStyle: string;
  motivationIntensity: MotivationIntensity;
  realPersonName?: string;
}

export const DEFAULT_AI_PREFERENCES: AIPreferences = {
  memeStyle: 'easy_relatable',
  memeIntensity: 'medium',
  motivationStyle: 'relatable',
  motivationIntensity: 'medium',
};

// 🎭 MEME STYLE OPTIONS
export const MEME_STYLES: StyleOption[] = [
  {
    id: 'easy_relatable',
    label: 'Easy & Relatable',
    emoji: '😂',
    description: 'Simple jokes everyone gets',
    instruction: 'Generate a simple, highly relatable everyday joke about studying or procrastination that almost everyone immediately understands.',
  },
  {
    id: 'medium_jokes',
    label: 'Medium Jokes',
    emoji: '🤣',
    description: 'Setup + punchline developed humor',
    instruction: 'Generate a well-structured joke with a clear relatable setup and a funny punchline.',
  },
  {
    id: 'extremely_playful',
    label: 'Extremely Playful',
    emoji: '🤪',
    description: 'Chaotic and exaggerated humor',
    instruction: 'Generate high-energy, chaotic, hilarious, and exaggerated humor with fun emojis.',
  },
  {
    id: 'clever_complex',
    label: 'Clever / Complex',
    emoji: '🧠',
    description: 'Layered, witty, intellectual humor',
    instruction: 'Generate clever, layered, witty, and unexpected humor with wordplay or subtle irony.',
  },
  {
    id: 'sarcastic',
    label: 'Sarcastic',
    emoji: '😏',
    description: 'Playful sarcasm and self-aware humor',
    instruction: 'Generate witty, dry, playful sarcasm about productivity and study habits.',
  },
  {
    id: 'savage',
    label: 'Savage / Dark-ish',
    emoji: '🔥',
    description: 'Slightly savage but harmless playful roast',
    instruction: 'Generate a playful, harmless roast about avoiding tasks while keeping it lighthearted and safe.',
  },
  {
    id: 'wholesome',
    label: 'Wholesome',
    emoji: '🥰',
    description: 'Cute, positive, lighthearted humor',
    instruction: 'Generate cute, encouraging, warm, and positive lighthearted humor.',
  },
  {
    id: 'gen_z',
    label: 'Gen Z / Internet',
    emoji: '🌐',
    description: 'Modern internet meme culture & slang',
    instruction: 'Generate modern internet meme culture humor with casual slang and modern web references.',
  },
];

// 🚀 MOTIVATION STYLE OPTIONS
export const MOTIVATION_STYLES: StyleOption[] = [
  {
    id: 'inspiring',
    label: 'Deeply Inspiring',
    emoji: '💪',
    description: 'Strong, emotional, powerful speech',
    instruction: 'Generate a deeply moving, inspiring, speech-like motivational boost that makes the user want to take immediate action.',
  },
  {
    id: 'relatable',
    label: 'Relatable',
    emoji: '🙂',
    description: 'Simple, realistic motivation',
    instruction: 'Generate realistic, grounded motivation explaining that showing up is enough.',
  },
  {
    id: 'real_life',
    label: 'Real-Life',
    emoji: '🌍',
    description: 'Grounded discipline & consistency',
    instruction: 'Generate practical, real-world advice focused on consistency, habits, and small daily wins.',
  },
  {
    id: 'calm_supportive',
    label: 'Calm / Supportive',
    emoji: '🌱',
    description: 'Gentle encouragement for tough days',
    instruction: 'Generate gentle, reassuring, pressure-free encouragement for when energy is low.',
  },
  {
    id: 'hard_truth',
    label: 'Hard Truth',
    emoji: '🧠',
    description: 'Honest, direct reality check',
    instruction: 'Generate an honest, direct, constructive reality check reminding them that only action creates results.',
  },
  {
    id: 'high_energy',
    label: 'High-Energy',
    emoji: '🔥',
    description: 'Let\'s-go-and-do-it hype',
    instruction: 'Generate excited, high-octane hype and energy to get them moving immediately.',
  },
  {
    id: 'discipline',
    label: 'Discipline',
    emoji: '🛡️',
    description: 'Focus on habit over temporary hype',
    instruction: 'Generate advice emphasizing discipline over temporary motivation.',
  },
  {
    id: 'real_person',
    label: 'Real Person Wisdom',
    emoji: '👤',
    description: 'Ideas inspired by figures like Kalam, Jobs, Kobe',
    instruction: 'Generate wisdom inspired by the work ethic and ideas of great leaders like APJ Abdul Kalam or Kobe Bryant (without fake quotes).',
  },
  {
    id: 'story_lesson',
    label: 'Story / Lesson',
    emoji: '📖',
    description: 'Short real-life lesson or mini story',
    instruction: 'Generate a short 1-sentence real-life lesson or perspective shift followed by a key takeaway.',
  },
  {
    id: 'no_nonsense',
    label: 'No-Nonsense',
    emoji: '⚡',
    description: 'Very short, punchy, and direct',
    instruction: 'Generate an extremely short, punchy, 1-sentence direct action command.',
  },
];

export const INTENSITY_LEVELS = [
  { id: 'low', label: 'Low / Gentle' },
  { id: 'medium', label: 'Medium (Balanced)' },
  { id: 'high', label: 'High / Extreme' },
];
