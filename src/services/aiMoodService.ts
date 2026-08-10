import { getEmotionConfig, type EmotionId } from '../constants/emotions';

export interface AIMemeResponse {
  setup: string;
  punchline: string;
  emoji: string;
  isAIGenerated: boolean;
}

export interface AIMotivationResponse {
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

/**
 * Format task categories, excluding "Untitled Task" so AI focuses purely on real subject areas.
 */
function buildCategoriesSummary(taskCategories?: string[]): string {
  if (!taskCategories || taskCategories.length === 0) {
    return 'General Productivity & Study';
  }
  const clean = Array.from(
    new Set(
      taskCategories
        .map((c) => c?.trim())
        .filter((c) => c && c !== 'Untitled Task' && c.length > 0)
    )
  );

  return clean.length > 0 ? clean.join(', ') : 'General Productivity & Study';
}

/**
 * Generate Daily Meme Only (Independent Refresh)
 */
export async function generateAIMeme(
  emotionId: EmotionId,
  userDisplayName?: string,
  taskCategories?: string[],
  forceRefresh: boolean = false,
  customApiKey?: string
): Promise<AIMemeResponse> {
  const dateStr = new Date().toISOString().split('T')[0];
  const cacheKey = `timetable_ai_meme_${dateStr}_${emotionId}`;

  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  const config = getEmotionConfig(emotionId);
  const apiKey = customApiKey || getStoredGeminiApiKey();
  const categoriesText = buildCategoriesSummary(taskCategories);

  let result: AIMemeResponse;

  if (!apiKey) {
    result = getFallbackMeme(emotionId);
  } else {
    try {
      const timestampSeed = Date.now();
      const prompt = `You are a hilarious, witty, Duolingo-style student productivity AI companion.
User Name: ${userDisplayName || 'Student'}
Current Emotion: "${config.label}" (${config.emoji})
Scheduled Task Categories Today: ${categoriesText}
Random Seed: ${timestampSeed}

Generate a brand-new, hilarious student meme scenario.
CRITICAL INSTRUCTIONS:
- Do NOT mention "Untitled Task" or tease about unnamed tasks.
- Focus strictly on real student categories like (${categoriesText}), coding, studying, caffeine, 3 AM study sessions, or Spotify playlists.
- Return ONLY raw JSON:
{
  "setup": "1 short relatable student scenario",
  "punchline": "1 funny punchline sentence",
  "emoji": "1 fitting emoji"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 1.0 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          result = {
            setup: parsed.setup || config.fallbackMemes[0].setup,
            punchline: parsed.punchline || config.fallbackMemes[0].punchline,
            emoji: parsed.emoji || config.emoji,
            isAIGenerated: true,
          };
        } else {
          result = getFallbackMeme(emotionId);
        }
      } else {
        result = getFallbackMeme(emotionId);
      }
    } catch (err) {
      result = getFallbackMeme(emotionId);
    }
  }

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {}

  return result;
}

/**
 * Generate Daily Motivation Only (Independent Refresh)
 */
export async function generateAIMotivation(
  emotionId: EmotionId,
  userDisplayName?: string,
  taskCategories?: string[],
  forceRefresh: boolean = false,
  customApiKey?: string
): Promise<AIMotivationResponse> {
  const dateStr = new Date().toISOString().split('T')[0];
  const cacheKey = `timetable_ai_motivation_${dateStr}_${emotionId}`;

  if (!forceRefresh) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  const config = getEmotionConfig(emotionId);
  const apiKey = customApiKey || getStoredGeminiApiKey();
  const categoriesText = buildCategoriesSummary(taskCategories);

  let result: AIMotivationResponse;

  if (!apiKey) {
    result = getFallbackMotivation(emotionId);
  } else {
    try {
      const timestampSeed = Date.now();
      const prompt = `You are a supportive, witty, Duolingo-style student productivity AI companion.
User Name: ${userDisplayName || 'Student'}
Current Emotion: "${config.label}" (${config.emoji})
Scheduled Task Categories Today: ${categoriesText}
Random Seed: ${timestampSeed}

Generate a short motivational boost (1-2 sentences).
CRITICAL INSTRUCTIONS:
- NEVER mention "Untitled Task" or tease about unnamed tasks.
- Focus on encouraging them in their actual categories (${categoriesText}) and building momentum.
- Return ONLY raw JSON:
{
  "motivation": "1-2 inspiring sentences tailored to their emotion and task categories."
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 1.0 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          result = {
            motivation: parsed.motivation || config.fallbackMotivations[0],
            isAIGenerated: true,
          };
        } else {
          result = getFallbackMotivation(emotionId);
        }
      } else {
        result = getFallbackMotivation(emotionId);
      }
    } catch (err) {
      result = getFallbackMotivation(emotionId);
    }
  }

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {}

  return result;
}

function getFallbackMeme(emotionId: EmotionId): AIMemeResponse {
  const config = getEmotionConfig(emotionId);
  const index = Math.floor(Math.random() * config.fallbackMemes.length);
  const item = config.fallbackMemes[index] || config.fallbackMemes[0];
  return {
    setup: item.setup,
    punchline: item.punchline,
    emoji: item.emoji,
    isAIGenerated: false,
  };
}

function getFallbackMotivation(emotionId: EmotionId): AIMotivationResponse {
  const config = getEmotionConfig(emotionId);
  const index = Math.floor(Math.random() * config.fallbackMotivations.length);
  return {
    motivation: config.fallbackMotivations[index] || config.fallbackMotivations[0],
    isAIGenerated: false,
  };
}
