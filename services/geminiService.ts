import { MacroData } from '../types';

// Together AI configuration
// Together AI configuration
// HARDCODED - bypassing env vars to ensure we use the known working key
const TOGETHER_API_KEY = '5dbbb3a9d05d4fa35ac759a18e99bee8d05c905ea56860f499dbe35e36496e71';
const TOGETHER_API_URL = 'https://api.together.ai/v1/chat/completions';

// Best vision model on Together AI for quality results
const VISION_MODEL = 'meta-llama/Llama-4-Maverick-17B-128E-Instruct';
const TEXT_MODEL = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';

const isApiConfigured = true;

// Helper to call Together AI API
async function callTogetherAI(messages: any[], model: string): Promise<string | null> {
  if (!isApiConfigured) return null;

  try {
    // Determine API URL (Local vs Production)
    // In production, Nginx proxies /api to the backend. Locally we might need full URL if not proxied. 
    // Assuming frontend is served relative to backend or proxy handles it.
    const PROXY_URL = '/api/analyze-food';

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header needed here, server handles it
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together AI Error:', response.status, errorText);

      let errorMessage = "API Error";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorText;
      } catch (e) {
        errorMessage = errorText;
      }

      // Return a valid analysis result describing the error
      return JSON.stringify({
        name: "API Error (See Details)",
        total_calories: 0,
        total_protein: 0,
        total_fat: 0,
        total_carbs: 0,
        components: [],
        confidence: 0,
        insight: `Server Message: ${errorMessage.substring(0, 100)}...`
      });
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Together AI Request Error:', error);
    return null;
  }
}

// Advanced Food Analysis Types
export interface FoodComponent {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodAnalysisResult {
  name: string;
  macros: MacroData;
  portionGrams: number;
  components: FoodComponent[];
  confidence: number;
  insight?: string;
}

// Analyze food image to get name and macros with detailed breakdown
export const analyzeFoodImage = async (base64Image: string, language: string = 'en'): Promise<FoodAnalysisResult | null> => {
  const fallback: FoodAnalysisResult = {
    name: "Manual Entry (Proxy Mode)",
    macros: { calories: 0, protein: 0, fat: 0, carbs: 0 },
    portionGrams: 0,
    components: [],
    confidence: 0,
    insight: "Proxy failed. Check server logs."
  };

  if (!isApiConfigured) {
    // Demo/Mock Data if no key
    return {
      name: language === 'ru' ? "Куриный салат (Демо)" : "Grilled Chicken Salad (Demo)",
      macros: { calories: 450, protein: 42, fat: 18, carbs: 12 },
      portionGrams: 350,
      components: [
        { name: language === 'ru' ? "Куриная грудка" : "Grilled Chicken Breast", grams: 150, calories: 250, protein: 35, fat: 5, carbs: 0 },
        { name: language === 'ru' ? "Зелень" : "Mixed Greens", grams: 100, calories: 30, protein: 2, fat: 0, carbs: 5 },
        { name: language === 'ru' ? "Авокадо" : "Avocado", grams: 75, calories: 120, protein: 1, fat: 10, carbs: 6 },
        { name: language === 'ru' ? "Масло" : "Olive Oil Dressing", grams: 14, calories: 50, protein: 0, fat: 5, carbs: 1 }
      ],
      confidence: 85,
      insight: language === 'ru' ? "Богато белком, мало углеводов." : "High protein, low carb option."
    };
  }

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
          text: `You are a professional nutritionist with 15 years of experience analyzing food portions.

TASK: Analyze this food image and provide ACCURATE nutritional breakdown.

ESTIMATION GUIDELINES:
1. PORTION SIZE: Estimate the actual portion weight in grams. Use these references:
   - Standard dinner plate diameter: ~25cm
   - Tablespoon: ~15g, Teaspoon: ~5g
   - Palm-sized meat: ~100g
   - Fist-sized portion: ~150g
   - Cup of rice/pasta (cooked): ~180g

2. CALORIE ACCURACY: Use these standard values per 100g:
   - Rice (cooked): 130 kcal, 2.7g protein, 0.3g fat, 28g carbs
   - Meat (beef): 250 kcal, 26g protein, 15g fat, 0g carbs
   - Chicken breast: 165 kcal, 31g protein, 3.6g fat, 0g carbs
   - Vegetables: 25-50 kcal average
   - Oil/butter: 900 kcal per 100g (1 tbsp = ~14g = 126 kcal)

3. COMMON DISHES (use these as reference):
   - Плов/Pilaf (300g): ~450 kcal, 18g P, 18g F, 54g C
   - Борщ/Borscht (350ml): ~170 kcal, 10g P, 9g F, 13g C
   - Pasta with sauce (350g): ~500-600 kcal

Language: ${language === 'ru' ? 'Russian (Русский) - output names in Russian' : 'English'}.

Return ONLY valid JSON:
{
  "name": "Dish Name",
  "portion_grams": 0,
  "total_calories": 0,
  "total_protein": 0,
  "total_fat": 0,
  "total_carbs": 0,
  "components": [
    {"name": "Ingredient", "grams": 0, "calories": 0, "protein": 0, "fat": 0, "carbs": 0}
  ],
  "confidence": 0-100,
  "insight": "Brief nutrition tip"
}`
        }
      ]
    }
  ];

  const response = await callTogetherAI(messages, VISION_MODEL);

  if (!response) return fallback;

  try {
    // Extract JSON from response (may have extra text)
    // Use greedy match to capture entire nested JSON object
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    // Try to parse, if it fails due to extra text after JSON, try to find valid JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // If greedy match grabbed too much, try to find balanced braces
      const startIndex = response.indexOf('{');
      if (startIndex === -1) return fallback;

      let braceCount = 0;
      let endIndex = startIndex;
      for (let i = startIndex; i < response.length; i++) {
        if (response[i] === '{') braceCount++;
        if (response[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
      parsed = JSON.parse(response.substring(startIndex, endIndex));
    }
    return {
      name: parsed.name || "Unknown Dish",
      macros: {
        calories: parsed.total_calories || 0,
        protein: parsed.total_protein || 0,
        fat: parsed.total_fat || 0,
        carbs: parsed.total_carbs || 0
      },
      portionGrams: parsed.portion_grams || 0,
      components: parsed.components || [],
      confidence: parsed.confidence || 0,
      insight: parsed.insight
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

// General Chat Response
export const generateChatResponse = async (
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string | null> => {
  if (!isApiConfigured) return null;

  const payload = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  return await callTogetherAI(payload, TEXT_MODEL);
};