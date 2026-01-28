export type Screen = 'ONBOARDING' | 'DASHBOARD' | 'ADD_MEAL' | 'CHECK_IN' | 'HISTORY' | 'SOCIAL' | 'SETTINGS' | 'LOOKS' | 'SHOP' | 'COACH';

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

export type HabitType = 'boolean' | 'counter' | 'timer';

export interface Habit {
  id: string;
  label: string;
  labelRu?: string;
  type?: HabitType; // default: boolean
  target?: number; // for counter (e.g., 8 glasses) or timer (e.g., 20 minutes)
  current?: number; // current progress
  unit?: string; // e.g., "glasses", "min"
  unitRu?: string; // Russian unit
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
  // Vacation mode
  vacationModeActive?: boolean;
  vacationStartDate?: string | null; // ISO date
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD - for which day this task is
}

export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  meals: Meal[];
  habits: Habit[];
  metrics: {
    steps: number;
    sleepHours: number;
    activeMinutes: number;
    focusMinutes?: number;
  };
  checkIn?: {
    mood: number; // 1-5
    energy: number; // 1-10
    tags: string[];
    note: string;
  };
  insight?: string;
  gamification?: {
    xp: number;
    challengesCompleted?: string[];
  };
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
  // Economy
  coins: number;
  inventory: string[]; // List of owned item IDs
  equipped: {
    avatar: string; // ID of active avatar
    theme: string; // ID of active theme
  };
  dailyTasks?: DailyTask[]; // Daily tasks for planning
}

export interface ShopItem {
  id: string;
  type: 'avatar' | 'theme' | 'consumable';
  name: string;
  description: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string; // We'll use string identifier for Icons.tsx or emoji
  assetUrl?: string;
  effect?: string;
}

export interface AvailableHabit {
  id: string;
  label: string;
  icon: string;
  category: 'health' | 'fitness' | 'nutrition' | 'mindfulness';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  type: 'water' | 'steps' | 'workout' | 'mindfulness' | 'social' | 'nutrition' | 'health';
  target?: number; // e.g., 2000ml, 5000 steps
}

export interface BadHabit {
  id: string;
  label: string;
  labelRu: string;
  icon: string;
  category: 'health' | 'finance' | 'time' | 'mental';

  // Tapering Mechanics
  limit: number; // Current daily max (Adaptive)
  baseline: number; // Starting average usage
  logs: { date: string; count: number }[]; // History

  // Restoration
  restorationXP: number; // Total XP earned
  currentStreak: number;
}

export interface RestorationBranch {
  id: string;
  name: string;
  nameRu: string;
  level: number;
  xp: number;
  maxXP: number; // XP needed for next level
  status: 'withered' | 'sprouting' | 'blooming' | 'thriving';
}

export interface RestorationState {
  branches: { [key: string]: RestorationBranch };
}