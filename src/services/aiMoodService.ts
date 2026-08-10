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

export async function generateAIMoodContent(
  emotionId: EmotionId,
  userDisplayName?: string,
  todayTaskTitles?: string[]
): Promise<AIMoodResponse> {
  const config = getEmotionConfig(emotionId);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // If no Gemini API key, return offline fallback immediately
  if (!apiKey) {
    return getFallbackContent(emotionId);
  }

  try {
    const tasksSummary = todayTaskTitles && todayTaskTitles.length > 0
      ? `Today's scheduled tasks: ${todayTaskTitles.join(', ')}.`
      : 'No tasks scheduled yet today.';

    const prompt = `You are a playful, witty, Duolingo-style productivity AI companion.
User Name: ${userDisplayName || 'Friend'}
Current Emotion: "${config.label}" (${config.emoji})
${tasksSummary}

Generate a short JSON object with:
1. "meme": an object with "setup" (1 short relatable sentence), "punchline" (1 short witty sentence), and "emoji" (1 fitting emoji).
2. "motivation": 1-2 inspiring sentences tailored to their emotion and tasks. Keep it friendly and concise!

Return ONLY raw JSON in this exact format:
{
  "meme": {
    "setup": "...",
    "punchline": "...",
    "emoji": "..."
  },
  "motivation": "..."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
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
    console.warn('AI generation unavailable, using fallback content:', err);
  }

  return getFallbackContent(emotionId);
}

function getFallbackContent(emotionId: EmotionId): AIMoodResponse {
  const config = getEmotionConfig(emotionId);
  const randomIndex = Math.floor(Math.random() * config.fallbackMemes.length);
  const meme = config.fallbackMemes[randomIndex] || config.fallbackMemes[0];
  const motivation = config.fallbackMotivations[randomIndex] || config.fallbackMotivations[0];

  return {
    meme,
    motivation,
    isAIGenerated: false,
  };
}
