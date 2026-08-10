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
      { setup: 'When you compile your code on the first try:', punchline: 'Wait... is this legal? 😳', emoji: '🎉' },
      { setup: 'Bro opened the timetable at 8 AM:', punchline: 'And actually started working at 8:01 AM 🗿', emoji: '🏆' },
      { setup: 'Me after finishing 2 tasks before noon:', punchline: 'Call me CEO of Getting Things Done 💼', emoji: '✨' },
    ],
    fallbackMotivations: [
      'Ride this incredible energy! Tackle your highest-priority task first.',
      'You are in peak flow state today. Enjoy the momentum!',
      'When your mind is clear and energy is high, 1 hour of work equals 4 hours of normal effort.',
      'Keep this high-energy vibe going. You\'re setting the bar high today!',
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
      { setup: 'My brain today:', punchline: '"We\'re not rushing, but we\'re definitely not slacking off." 🎯', emoji: '👍' },
      { setup: 'Me looking at today\'s schedule:', punchline: '"This looks completely doable. Let\'s get it!" 💻', emoji: '🚀' },
      { setup: 'Opening VS Code without panicking:', punchline: 'A rare and beautiful feeling 🧘‍♂️', emoji: '💙' },
    ],
    fallbackMotivations: [
      'Steady, consistent effort beats sporadic bursts every time.',
      'Keep the momentum smooth. One clear step at a time.',
      'You have a great balance of calm and focus today. Make it count!',
      'Consistency is your superpower today. Keep building the habit.',
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
      { setup: 'Me sitting at my desk:', punchline: '"I may not be enthusiastic, but the tasks will still get done." 🗿', emoji: '☕️' },
      { setup: 'Brain: Should we procrastinate?', punchline: "Me: Nah, let's just finish this so we can chill guilt-free. 🥱", emoji: '✅' },
      { setup: 'When motivation is missing:', punchline: 'Discipline steps in and says "Move." 🚶‍♂️', emoji: '⚓️' },
    ],
    fallbackMotivations: [
      'You don\'t need fireworks to make progress. Showing up is winning.',
      'Neutral days build the discipline that makes great days happen.',
      'Just do the next 25 minutes. You\'ll be surprised how much gets done on "okay" days.',
      'No big mood required. Just quiet, steady progress.',
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
      { setup: 'When you planned 4 hours of study:', punchline: 'But spent 45 minutes choosing the perfect lofi playlist 🎧', emoji: '☕️' },
      { setup: 'Me after reading 2 lines of documentation:', punchline: 'Time for a well-deserved 3-hour nap 🛏️', emoji: '💀' },
      { setup: 'My body:', punchline: '"Please sleep." My timetable: "LeetCode Hard problem #15" 😭', emoji: '🔋' },
      { setup: 'Coffee attempt #3:', punchline: 'Now I am just tired... but with a faster heartbeat ☕️🏃‍♂️', emoji: '🫠' },
    ],
    fallbackMotivations: [
      'You don\'t need maximum energy. Just give the next 20 minutes a chance.',
      'Lower the bar for starting. Small steps count just as much when you\'re tired.',
      'Do the easiest task on your list first to get low-effort momentum.',
      'Be gentle with yourself today. Quality over quantity when energy is low.',
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
      { setup: 'Progress on tough days:', punchline: 'Completing 1 single task is an absolute championship victory today 🏆', emoji: '✨' },
      { setup: 'Me looking at my tasks today:', punchline: '"Let\'s just do the absolute easiest 15-minute thing and call it a day." 🧸', emoji: '☕️' },
      { setup: 'When nothing goes as planned:', punchline: 'Remember: Your value isn\'t measured by your output every single hour. ❤️', emoji: '🌸' },
      { setup: 'Self care reminder:', punchline: 'Take a breath, grab water, and take it one small step at a time. 💧', emoji: '🕊️' },
    ],
    fallbackMotivations: [
      'Bad days don\'t cancel your long-term progress. Be kind to yourself today.',
      'No pressure. Take it one small task at a time.',
      'Even a 1% effort on a low day keeps your momentum alive.',
      'Give yourself permission to go slow today. Slow progress is still progress.',
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
      { setup: 'My brain with 5 deadlines:', punchline: '"What if we clean our room instead?" 🧹😭', emoji: '🤯' },
      { setup: 'Me opening 40 tabs in Chrome:', punchline: 'Now I am stressed AND my laptop sounds like a jet engine ✈️', emoji: '🔥' },
      { setup: 'Stress level:', punchline: 'High enough to write a 10-page essay on why deadlines should be illegal 📜', emoji: '🫠' },
    ],
    fallbackMotivations: [
      'Pause. Take a deep breath. Pick just ONE thing. That is enough for now.',
      'Stress is just your brain trying to do everything at once. Focus on the next single minute.',
      'Close 35 of those 40 tabs. Pick the single most important task and ignore the rest.',
      'You have handled tough deadlines before. You will handle this one too.',
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
      { setup: 'Me solving LeetCode problems today:', punchline: 'Look at me, I am the Senior Engineer now 💻👑', emoji: '⚡️' },
      { setup: 'Energy level:', punchline: 'Over 9000. Distractions don\'t even stand a chance 💥', emoji: '🏹' },
      { setup: 'When you\'re in the zone:', punchline: 'Even Spotify ads can\'t break your focus 🎵🔥', emoji: '🏆' },
    ],
    fallbackMotivations: [
      'Channel that fire! Take on your hardest task while your energy is peak.',
      'Ride the momentum. One task at a time, nothing can stop you today.',
      'You are unstoppable when you\'re locked in like this. Go get it!',
      'Make today the day you look back on and say: "That\'s when everything changed."',
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
      { setup: 'Me looking at 3 projects due this week:', punchline: '"Maybe I should start a farming startup in the mountains" 🏔️', emoji: '🐑' },
      { setup: 'Too many things to do?', punchline: 'Hide 90% of them. Pick 1 task. Work for 10 minutes. 🎯', emoji: '⚡️' },
      { setup: 'Overwhelm cure:', punchline: 'Write down ONLY 2 tasks on a physical sticky note. Throw everything else away. 📝', emoji: '✅' },
    ],
    fallbackMotivations: [
      'Break the giant task into 5-minute micro tasks. Momentum will take over.',
      'You don\'t have to finish everything today. Just start the next tiny thing.',
      'Shrink your target until it feels impossible to fail. 5 minutes is all you need.',
      'One step at a time. The mountain shrinks with every small step you take.',
    ],
  },
];

export function getEmotionConfig(id: EmotionId): EmotionConfig {
  return EMOTIONS.find((e) => e.id === id) || EMOTIONS[1]; // Default to Good
}
