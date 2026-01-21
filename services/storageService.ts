import { DailyLog, UserSettings, StreakData, Habit } from '../types';

const STORAGE_KEYS = {
    USER_SETTINGS: 'daily-discipline-user',
    DAILY_LOGS: 'daily-discipline-logs',
    STREAK: 'daily-discipline-streak',
};

// Get today's date as ISO string YYYY-MM-DD
export const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

// User Settings
export const saveUserSettings = (settings: UserSettings): void => {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
};

export const loadUserSettings = (): UserSettings | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    return data ? JSON.parse(data) : null;
};

// Daily Logs
export const saveDailyLog = (log: DailyLog): void => {
    const logs = loadAllDailyLogs();
    const existingIndex = logs.findIndex(l => l.date === log.date);

    if (existingIndex >= 0) {
        logs[existingIndex] = log;
    } else {
        logs.push(log);
    }

    // Keep only last 30 days for free tier
    const sorted = logs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(sorted));
};

export const loadAllDailyLogs = (): DailyLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    return data ? JSON.parse(data) : [];
};

export const loadTodayLog = (): DailyLog | null => {
    const logs = loadAllDailyLogs();
    const today = getTodayDate();
    return logs.find(l => l.date === today) || null;
};

export const getOrCreateTodayLog = (defaultHabits: Habit[]): DailyLog => {
    const existing = loadTodayLog();
    if (existing) return existing;

    return {
        date: getTodayDate(),
        meals: [],
        habits: defaultHabits.map(h => ({ ...h, completed: false })),
        metrics: {
            steps: Math.floor(Math.random() * 5000) + 4000, // Mock: 4000-9000
            sleepHours: Math.round((Math.random() * 3 + 5) * 10) / 10, // Mock: 5-8 hours
            activeMinutes: Math.floor(Math.random() * 60) + 15, // Mock: 15-75 min
        },
        closed: false,
    };
};

// Streak calculations with Freeze support
export const calculateStreak = (logs: DailyLog[], currentFreezes: number = 0): StreakData => {
    const today = new Date();
    const todayStr = getTodayDate();

    // Get last 7 days
    const last7Days: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7Days.push(d.toISOString().split('T')[0]);
    }

    // Count completed days this week
    const completedDaysThisWeek = last7Days.filter(dateStr => {
        const log = logs.find(l => l.date === dateStr);
        return log?.closed;
    }).length;

    // Calculate current streak (with freeze support)
    let currentStreak = 0;
    let missedDays = 0;
    let freezesUsedNow = 0;
    let lastCompletedDate: string | null = null;

    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const log = sortedLogs.find(l => l.date === dateStr);

        if (log?.closed) {
            if (!lastCompletedDate) lastCompletedDate = dateStr;
            currentStreak++;
            missedDays = 0;
        } else {
            missedDays++;
            // Use freeze if available (max 2 grace + freezes)
            const totalAllowed = 2 + Math.min(currentFreezes - freezesUsedNow, 1);
            if (missedDays > totalAllowed) {
                break;
            }
            if (missedDays > 2 && currentFreezes > freezesUsedNow) {
                freezesUsedNow++;
            }
        }
    }

    // Calculate longest streak from history
    let longestStreak = 0;
    let tempStreak = 0;
    let tempMissed = 0;

    for (let i = 0; i < 90; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const log = logs.find(l => l.date === dateStr);

        if (log?.closed) {
            tempStreak++;
            tempMissed = 0;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempMissed++;
            if (tempMissed > 2) {
                tempStreak = 0;
                tempMissed = 0;
            }
        }
    }

    // Check if user earned a new freeze (every 7 consecutive days)
    const freezesEarned = Math.floor(currentStreak / 7);
    const freezesAvailable = Math.min(currentFreezes + (freezesEarned > 0 ? 1 : 0) - freezesUsedNow, 3);

    return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        completedDaysThisWeek,
        missedDaysThisWeek: 7 - completedDaysThisWeek,
        lastCompletedDate,
        freezesAvailable: Math.max(freezesAvailable, 0),
        freezesUsed: freezesUsedNow,
        lastFreezeEarned: freezesEarned > 0 ? todayStr : null,
    };
};

// Check if user should earn a freeze (call after closing day)
export const checkAndAwardFreeze = (streak: StreakData): { awarded: boolean; newTotal: number } => {
    // Award freeze every 7 days of streak, max 3
    if (streak.currentStreak > 0 && streak.currentStreak % 7 === 0) {
        const newTotal = Math.min(streak.freezesAvailable + 1, 3);
        return { awarded: true, newTotal };
    }
    return { awarded: false, newTotal: streak.freezesAvailable };
};

// Generate motivational message based on streak
export const getStreakMessage = (streak: StreakData): string => {
    const { completedDaysThisWeek, currentStreak, freezesAvailable } = streak;

    if (completedDaysThisWeek >= 6) {
        return "🔥 Incredible week! You're on fire!";
    } else if (completedDaysThisWeek >= 4) {
        return `💪 ${completedDaysThisWeek}/7 days — that's above average!`;
    } else if (completedDaysThisWeek >= 2) {
        return "👍 Good start! Each day counts.";
    } else if (currentStreak > 0) {
        if (freezesAvailable > 0) {
            return `🌱 Keep going! ❄️ ${freezesAvailable} freeze${freezesAvailable > 1 ? 's' : ''} available`;
        }
        return "🌱 Building momentum, keep going!";
    }
    return "✨ New week, fresh start!";
};

// Get weekly summary for AI review
export const getWeeklySummary = (logs: DailyLog[]): {
    avgSteps: number;
    avgSleep: number;
    avgActive: number;
    totalMeals: number;
    completedDays: number;
    habitCompletionRate: number;
} => {
    const today = new Date();
    const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays < 7;
    });

    if (weekLogs.length === 0) {
        return { avgSteps: 0, avgSleep: 0, avgActive: 0, totalMeals: 0, completedDays: 0, habitCompletionRate: 0 };
    }

    const avgSteps = Math.round(weekLogs.reduce((sum, l) => sum + (l.metrics?.steps || 0), 0) / weekLogs.length);
    const avgSleep = Math.round(weekLogs.reduce((sum, l) => sum + (l.metrics?.sleepHours || 0), 0) / weekLogs.length * 10) / 10;
    const avgActive = Math.round(weekLogs.reduce((sum, l) => sum + (l.metrics?.activeMinutes || 0), 0) / weekLogs.length);
    const totalMeals = weekLogs.reduce((sum, l) => sum + (l.meals?.length || 0), 0);
    const completedDays = weekLogs.filter(l => l.closed).length;

    const totalHabits = weekLogs.reduce((sum, l) => sum + (l.habits?.length || 0), 0);
    const completedHabits = weekLogs.reduce((sum, l) => sum + (l.habits?.filter(h => h.completed).length || 0), 0);
    const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    return { avgSteps, avgSleep, avgActive, totalMeals, completedDays, habitCompletionRate };
};

// Clear all data (for settings)
export const clearAllData = (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
};
