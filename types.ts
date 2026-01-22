export type Screen = 'ONBOARDING' | 'DASHBOARD' | 'ADD_MEAL' | 'CHECK_IN' | 'HISTORY' | 'SETTINGS' | 'LOOKS';

export interface MacroData {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  macros: MacroData;
  imageUri?: string; // base64
  timestamp: Date;
}

export interface Habit {
  id: string;
  label: string;
  completed: boolean;
  icon?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completedDaysThisWeek: number;
  missedDaysThisWeek: number;
  lastCompletedDate: string | null; // ISO date YYYY-MM-DD
  freezesAvailable: number; // 0-3 max
  freezesUsed: number; // total used ever
  lastFreezeEarned: string | null; // ISO date when last earned
}

export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  meals: Meal[];
  habits: Habit[];
  metrics: {
    steps: number;
    sleepHours: number;
    activeMinutes: number;
  };
  checkIn?: {
    mood: number; // 1-5
    energy: number; // 1-10
    tags: string[];
    note: string;
  };
  insight?: string;
  closed: boolean;
}

export interface UserSettings {
  name: string;
  goal: string;
  targetCalories: number;
  targetProtein: number;
  height?: number; // cm
  weight?: number; // kg
  gender?: 'male' | 'female';
  selectedHabits: string[]; // habit ids
  onboardingComplete: boolean;
  isPro?: boolean; // subscription status
}

export interface AvailableHabit {
  id: string;
  label: string;
  icon: string;
  category: 'health' | 'fitness' | 'nutrition' | 'mindfulness';
}