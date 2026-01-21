import { GoogleGenAI, Type } from "@google/genai";
import { Meal, MacroData } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze food image to get name and macros
export const analyzeFoodImage = async (base64Image: string): Promise<{ name: string; macros: MacroData } | null> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: "image/jpeg",
            },
          },
          {
            text: "Identify this dish. Return JSON with fields: name (string), calories (number), protein (number, grams), fat (number, grams), carbs (number, grams). Estimate based on a standard serving size visible."
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
          },
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Food Analysis Error:", error);
    // Fallback mock data if API fails or key is missing
    return {
      name: "Detected Meal",
      macros: { calories: 450, protein: 20, fat: 15, carbs: 55 }
    };
  }
};

// Generate a daily insight
export const generateDailyInsight = async (steps: number, sleep: number, meals: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Stats Today: ${steps} steps, ${sleep} hours sleep, ${meals} meals logged. 
      Generate a single, short, motivating one-sentence insight or correlation (max 15 words). 
      Example: "On days with 7k+ steps, you sleep 20min longer."`,
    });
    return response.text || "Consistency is key to long-term success.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Great job staying active today!";
  }
};

// Generate weekly AI review
export interface WeeklyReviewData {
  avgSteps: number;
  avgSleep: number;
  avgActive: number;
  totalMeals: number;
  completedDays: number;
  habitCompletionRate: number;
  currentStreak: number;
}

export const generateWeeklyReview = async (data: WeeklyReviewData): Promise<{
  summary: string;
  insights: string[];
  recommendation: string;
  grade: string;
}> => {
  try {
    const prompt = `You are a health coach. Analyze this week's data and provide feedback in JSON format.

Weekly Stats:
- Average Steps: ${data.avgSteps}/day (goal: 10,000)
- Average Sleep: ${data.avgSleep} hours (goal: 8)
- Average Active Minutes: ${data.avgActive} min (goal: 60)
- Meals Logged: ${data.totalMeals}
- Days Completed: ${data.completedDays}/7
- Habit Completion: ${data.habitCompletionRate}%
- Current Streak: ${data.currentStreak} days

Return JSON with:
- summary: 1 sentence overview (max 20 words)
- insights: array of 3 specific observations/correlations (each max 15 words)
- recommendation: 1 actionable tip for next week (max 20 words)
- grade: letter grade A/B/C/D based on overall performance`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING },
            grade: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Weekly Review Error:", error);
    // Fallback
    return {
      summary: "Keep building your healthy habits day by day!",
      insights: [
        "Consistency is more important than perfection",
        "Small improvements compound over time",
        "Focus on one habit at a time for best results"
      ],
      recommendation: "Try to increase your step count by 500 steps next week.",
      grade: "B"
    };
  }
};