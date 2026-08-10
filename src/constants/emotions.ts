export type EmotionId =
  | 'great'
  | 'good'
  | 'okay'
  | 'tired'
  | 'low'
  | 'stressed'
  | 'motivated'
  | 'overwhelmed';

export interface EmotionConfig {
  id: EmotionId;
  label: string;
  emoji: string;
  themeColor: string;       // Primary accent color
  bgGradient: string;       // Card background tint
  borderColor: string;      // Border highlight
  textColor: string;        // Text highlight
  vibeTagline: string;      // Playful tagline
  fallbackMemes: Array<{ setup: string; punchline: string; emoji: string }>;
  fallbackMotivations: string[];
}

export const EMOTIONS: EmotionConfig[] = [
  {
    id: 'great',
    label: 'Great',
    emoji: '😄',
    themeColor: '#10B981',
    bgGradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
    borderColor: '#34D399',
    textColor: '#065F46',
    vibeTagline: "You're cooking today! 👨‍🍳🔥",
    fallbackMemes: [
      { setup: 'ME: I have a plan for today', punchline: "LIFE: Okay cool, let's crush every single task 🚀", emoji: '😄' },
      { setup: 'Productivity level right now:', punchline: '100% focused, zero distractions, pure momentum ⚡️', emoji: '🔥' },
    ],
    fallbackMotivations: [
      'Ride this incredible energy! Tackle your highest-priority task first.',
      'You are in peak flow state today. Enjoy the momentum!',
    ],
  },
  {
    id: 'good',
    label: 'Good',
    emoji: '🙂',
    themeColor: '#3B82F6',
    bgGradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    borderColor: '#60A5FA',
    textColor: '#1E40AF',
    vibeTagline: 'Solid vibe today! 🎯',
    fallbackMemes: [
      { setup: 'Productivity has entered the chat', punchline: 'Me: Let\'s quietly make major progress today 👀', emoji: '🙂' },
      { setup: 'When your coffee hits just right:', punchline: 'Ready to clear the task list item by item ☕️', emoji: '✨' },
    ],
    fallbackMotivations: [
      'Steady, consistent effort beats sporadic bursts every time.',
      'Keep the momentum smooth. One clear step at a time.',
    ],
  },
  {
    id: 'okay',
    label: 'Okay',
    emoji: '😐',
    themeColor: '#64748B',
    bgGradient: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    borderColor: '#94A3B8',
    textColor: '#334155',
    vibeTagline: 'Neutral gear. Smooth sailing ⛵️',
    fallbackMemes: [
      { setup: 'ME: Not hyped, not sad', punchline: 'ALSO ME: Just quietly clocking in and getting it done ☕️', emoji: '😐' },
      { setup: 'Energy status:', punchline: '50% battery. Perfectly enough to make solid progress 🔋', emoji: '👍' },
    ],
    fallbackMotivations: [
      'You don\'t need fireworks to make progress. Showing up is winning.',
      'Neutral days build the discipline that makes great days happen.',
    ],
  },
  {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    themeColor: '#8B5CF6',
    bgGradient: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
    borderColor: '#A78BFA',
    textColor: '#5B21B6',
    vibeTagline: 'Low battery. Keep it manageable 🌙',
    fallbackMemes: [
      { setup: 'YOUR BRAIN AT 7 PM:', punchline: '"We could study... or we could stare at the ceiling and call it strategic planning" 😭', emoji: '😴' },
      { setup: 'When you planned 4 hours of work:', punchline: 'But spent 40 minutes choosing the perfect lo-fi playlist 🎧', emoji: '☕️' },
    ],
    fallbackMotivations: [
      'You don\'t need maximum energy. Just give the next 20 minutes a chance.',
      'Lower the bar for starting. Small steps count just as much when you\'re tired.',
    ],
  },
  {
    id: 'low',
    label: 'Low',
    emoji: '😔',
    themeColor: '#EC4899',
    bgGradient: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)',
    borderColor: '#F472B6',
    textColor: '#9D174D',
    vibeTagline: 'Gentle day. Small steps count 🌱',
    fallbackMemes: [
      { setup: 'Today may not be your main-character episode', punchline: 'And that is 100% okay. You are human ❤️', emoji: '🌱' },
      { setup: 'Progress on tough days:', punchline: 'Completing 1 task is an absolute victory today 🏆', emoji: '✨' },
    ],
    fallbackMotivations: [
      'Bad days don\'t cancel your long-term progress. Be kind to yourself today.',
      'No pressure. Take it one small task at a time.',
    ],
  },
  {
    id: 'stressed',
    label: 'Stressed',
    emoji: '😤',
    themeColor: '#F59E0B',
    bgGradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
    borderColor: '#FBBF24',
    textColor: '#92400E',
    vibeTagline: 'One thing at a time. Breathe 🧘‍♂️',
    fallbackMemes: [
      { setup: 'Me looking at my task list like:', punchline: 'Did you personally come here to betray me? 💀', emoji: '😤' },
      { setup: 'When everything feels urgent:', punchline: 'Pause. Take a deep breath. Pick just ONE thing 🌿', emoji: '☕️' },
    ],
    fallbackMotivations: [
      'Pause. Take a deep breath. Pick just ONE thing. That is enough for now.',
      'Stress is just your brain trying to do everything at once. Focus on the next single minute.',
    ],
  },
  {
    id: 'motivated',
    label: 'Motivated',
    emoji: '🔥',
    themeColor: '#EF4444',
    bgGradient: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
    borderColor: '#F87171',
    textColor: '#991B1B',
    vibeTagline: "Let's cook today 🔥🚀",
    fallbackMemes: [
      { setup: 'Bro opened the timetable and suddenly:', punchline: 'Became the CEO of productivity 🗿⚡️', emoji: '🔥' },
      { setup: 'When you hit momentum mode:', punchline: 'Tasks are falling like dominoes 🎯', emoji: '🚀' },
    ],
    fallbackMotivations: [
      'Channel that fire! Take on your hardest task while your energy is peak.',
      'Ride the momentum. One task at a time, nothing can stop you today.',
    ],
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    emoji: '🤯',
    themeColor: '#06B6D4',
    bgGradient: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)',
    borderColor: '#22D3EE',
    textColor: '#155E75',
    vibeTagline: 'Simplify & shrink the target 🎯',
    fallbackMemes: [
      { setup: 'MY TO-DO LIST: [100 items]', punchline: 'MY BRAIN: "Let me organize my desktop wallpaper first" 😭', emoji: '🤯' },
      { setup: 'When the mountain looks too big:', punchline: 'Don\'t look at the mountain. Just look at the next step 🪜', emoji: '💡' },
    ],
    fallbackMotivations: [
      'Break the giant task into 5-minute micro tasks. Momentum will take over.',
      'You don\'t have to finish everything today. Just start the next tiny thing.',
    ],
  },
];

export function getEmotionConfig(id: EmotionId): EmotionConfig {
  return EMOTIONS.find((e) => e.id === id) || EMOTIONS[1]; // Default to Good
}
