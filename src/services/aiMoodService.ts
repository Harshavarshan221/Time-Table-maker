import { getEmotionConfig, type EmotionId } from '../constants/emotions';

export interface AIMoodResponse {
  meme: {
    setup: string;
    punchline: string;
    emoji: string;
  };
  motivation: string;
  isAIGenerated: boolean;
}

const LOCAL_KEY_STORAGE = 'timetable_user_gemini_api_key';

export function getStoredGeminiApiKey(): string {
  try {
    const userKey = localStorage.getItem(LOCAL_KEY_STORAGE);
    if (userKey && userKey.trim().length > 0) {
      return userKey.trim();
    }
  } catch {}
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(LOCAL_KEY_STORAGE, key.trim());
  } catch (e) {
    console.error('Failed to save Gemini API key:', e);
  }
}

export async function generateAIMoodContent(
  emotionId: EmotionId,
  userDisplayName?: string,
  todayTaskTitles?: string[],
  customApiKey?: string
): Promise<AIMoodResponse> {
  const config = getEmotionConfig(emotionId);
  const apiKey = customApiKey || getStoredGeminiApiKey();

  // If no Gemini API key, return offline fallback immediately
  if (!apiKey) {
    return getFallbackContent(emotionId);
  }

  try {
    const tasksSummary =
      todayTaskTitles && todayTaskTitles.length > 0
        ? `Today's scheduled tasks: ${todayTaskTitles.join(', ')}.`
        : 'No tasks scheduled yet today.';

    const timestampSeed = Date.now();

    const prompt = `You are a hilarious, witty, Duolingo-style student productivity AI companion.
User Name: ${userDisplayName || 'Student'}
Current Emotion: "${config.label}" (${config.emoji})
${tasksSummary}
Random Seed: ${timestampSeed}

Generate a brand-new, hilarious, highly relatable college/student meme text and a short motivational boost.
Requirements:
1. "meme": an object with:
   - "setup": (1 short relatable student scenario e.g. LeetCode, DSA, assignments, coffee, 3 AM study, playlists, Chrome tabs)
   - "punchline": (1 funny punchline sentence)
   - "emoji": (1 fitting emoji)
2. "motivation": (1-2 inspiring sentences tailored to their emotion and tasks. Keep it friendly, witty, and concise!)

Return ONLY valid raw JSON in this exact structure:
{
  "meme": {
    "setup": "...",
    "punchline": "...",
    "emoji": "..."
  },
  "motivation": "..."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error status: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (rawText) {
      const parsed = JSON.parse(rawText);
      if (parsed.meme && parsed.motivation) {
        return {
          meme: {
            setup: parsed.meme.setup || config.fallbackMemes[0].setup,
            punchline: parsed.meme.punchline || config.fallbackMemes[0].punchline,
            emoji: parsed.meme.emoji || config.emoji,
          },
          motivation: parsed.motivation,
          isAIGenerated: true,
        };
      }
    }
  } catch (err) {
    console.warn('Gemini API call failed, falling back to smart library:', err);
  }

  return getFallbackContent(emotionId);
}

function getFallbackContent(emotionId: EmotionId): AIMoodResponse {
  const config = getEmotionConfig(emotionId);
  const memeIndex = Math.floor(Math.random() * config.fallbackMemes.length);
  const motivationIndex = Math.floor(Math.random() * config.fallbackMotivations.length);

  const meme = config.fallbackMemes[memeIndex] || config.fallbackMemes[0];
  const motivation = config.fallbackMotivations[motivationIndex] || config.fallbackMotivations[0];

  return {
    meme,
    motivation,
    isAIGenerated: false,
  };
}
