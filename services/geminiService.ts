import { MacroData } from '../types';

// Together AI configuration
const TOGETHER_API_KEY = process.env.API_KEY || '';
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

// Best vision model on Together AI for quality results
const VISION_MODEL = 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8';
const TEXT_MODEL = 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8';

const isApiConfigured = TOGETHER_API_KEY && TOGETHER_API_KEY !== 'no_key' && TOGETHER_API_KEY !== 'dummy';

// Helper to call Together AI API
async function callTogetherAI(messages: any[], model: string): Promise<string | null> {
  if (!isApiConfigured) return null;

  try {
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Together AI Error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Together AI Request Error:', error);
    return null;
  }
}

// Analyze food image to get name and macros
export const analyzeFoodImage = async (base64Image: string): Promise<{ name: string; macros: MacroData } | null> => {
  const fallback = {
    name: "Detected Meal (Demo)",
    macros: { calories: 450, protein: 20, fat: 15, carbs: 55 }
  };

  if (!isApiConfigured) return fallback;

  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${cleanBase64}`
          }
        },
        {
          type: 'text',
          text: `Analyze this food image. Identify the dish and estimate its nutritional content for a standard serving.

Return ONLY valid JSON in this exact format (no other text):
{"name": "dish name", "calories": 0, "protein": 0, "fat": 0, "carbs": 0}

Where calories is total kcal, and protein/fat/carbs are in grams.`
        }
      ]
    }
  ];

  const response = await callTogetherAI(messages, VISION_MODEL);

  if (!response) return fallback;

  try {
    // Extract JSON from response (may have extra text)
    const jsonMatch = response.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      name: parsed.name || "Unknown Dish",
      macros: {
        calories: parsed.calories || 0,
        protein: parsed.protein || 0,
        fat: parsed.fat || 0,
        carbs: parsed.carbs || 0
      }
    };
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return fallback;
  }
};

// Generate a daily insight
export const generateDailyInsight = async (steps: number, sleep: number, meals: number): Promise<string> => {
  const fallback = "Consistency is key to long-term success.";

  if (!isApiConfigured) return fallback;

  const messages = [
    {
      role: 'system',
      content: 'You are a brief health coach. Respond with exactly one short motivating sentence (max 15 words).'
    },
    {
      role: 'user',
      content: `User stats today: ${steps} steps, ${sleep} hours sleep, ${meals} meals logged. Give a quick insight.`
    }
  ];

  const response = await callTogetherAI(messages, TEXT_MODEL);
  return response || fallback;
};

// Weekly review data type
export interface WeeklyReviewData {
  avgSteps: number;
  avgSleep: number;
  avgActive: number;
  totalMeals: number;
  completedDays: number;
  habitCompletionRate: number;
  currentStreak: number;
}

// Generate weekly AI review
export const generateWeeklyReview = async (data: WeeklyReviewData): Promise<{
  summary: string;
  insights: string[];
  recommendation: string;
  grade: string;
}> => {
  const fallback = {
    summary: "Keep building your healthy habits day by day!",
    insights: [
      "Consistency is more important than perfection",
      "Small improvements compound over time",
      "Focus on one habit at a time for best results"
    ],
    recommendation: "Try to increase your step count by 500 steps next week.",
    grade: "B"
  };

  if (!isApiConfigured) return fallback;

  const messages = [
    {
      role: 'system',
      content: 'You are a health coach analyzing weekly data. Respond ONLY with valid JSON, no other text.'
    },
    {
      role: 'user',
      content: `Analyze this week's health data:
- Average Steps: ${data.avgSteps}/day (goal: 10,000)
- Average Sleep: ${data.avgSleep} hours (goal: 8)
- Average Active Minutes: ${data.avgActive} min (goal: 60)
- Meals Logged: ${data.totalMeals}
- Days Completed: ${data.completedDays}/7
- Habit Completion: ${data.habitCompletionRate}%
- Current Streak: ${data.currentStreak} days

Return JSON:
{"summary": "1 sentence overview", "insights": ["insight1", "insight2", "insight3"], "recommendation": "1 actionable tip", "grade": "A/B/C/D"}`
    }
  ];

  const response = await callTogetherAI(messages, TEXT_MODEL);

  if (!response) return fallback;

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || fallback.summary,
      insights: Array.isArray(parsed.insights) ? parsed.insights : fallback.insights,
      recommendation: parsed.recommendation || fallback.recommendation,
      grade: parsed.grade || fallback.grade
    };
  } catch (error) {
    console.error('Weekly Review Parse Error:', error);
    return fallback;
  }
};