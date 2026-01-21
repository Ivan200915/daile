// Gamification Service
// Achievements, XP, Levels, and Challenges

// ==================== ACHIEVEMENTS ====================

export interface Achievement {
    id: string;
    name: string;
    nameRu: string;
    description: string;
    descriptionRu: string;
    icon: string;
    condition: (stats: UserStats) => boolean;
    xpReward: number;
}

export interface UserStats {
    totalDaysLogged: number;
    currentStreak: number;
    longestStreak: number;
    totalHabitsCompleted: number;
    totalMealsLogged: number;
    totalSteps: number;
    level: number;
    xp: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    // Streak achievements
    { id: 'streak_3', name: 'Getting Started', nameRu: 'Начало пути', description: '3-day streak', descriptionRu: '3 дня подряд', icon: '🔥', condition: s => s.currentStreak >= 3, xpReward: 50 },
    { id: 'streak_7', name: 'Week Warrior', nameRu: 'Недельный воин', description: '7-day streak', descriptionRu: '7 дней подряд', icon: '⚡', condition: s => s.currentStreak >= 7, xpReward: 100 },
    { id: 'streak_14', name: 'Two Weeks Strong', nameRu: 'Две недели силы', description: '14-day streak', descriptionRu: '14 дней подряд', icon: '💪', condition: s => s.currentStreak >= 14, xpReward: 200 },
    { id: 'streak_30', name: 'Monthly Master', nameRu: 'Мастер месяца', description: '30-day streak', descriptionRu: '30 дней подряд', icon: '🏆', condition: s => s.currentStreak >= 30, xpReward: 500 },
    { id: 'streak_100', name: 'Century Club', nameRu: 'Клуб сотни', description: '100-day streak', descriptionRu: '100 дней подряд', icon: '👑', condition: s => s.currentStreak >= 100, xpReward: 1000 },

    // Habit achievements
    { id: 'habits_10', name: 'Habit Builder', nameRu: 'Строитель привычек', description: '10 habits done', descriptionRu: '10 привычек выполнено', icon: '✅', condition: s => s.totalHabitsCompleted >= 10, xpReward: 30 },
    { id: 'habits_50', name: 'Habit Hero', nameRu: 'Герой привычек', description: '50 habits done', descriptionRu: '50 привычек выполнено', icon: '🦸', condition: s => s.totalHabitsCompleted >= 50, xpReward: 100 },
    { id: 'habits_100', name: 'Habit Legend', nameRu: 'Легенда привычек', description: '100 habits done', descriptionRu: '100 привычек выполнено', icon: '🌟', condition: s => s.totalHabitsCompleted >= 100, xpReward: 250 },

    // Steps achievements
    { id: 'steps_10k', name: 'First 10K', nameRu: 'Первые 10К', description: '10,000 steps in a day', descriptionRu: '10 000 шагов за день', icon: '👟', condition: s => s.totalSteps >= 10000, xpReward: 50 },
    { id: 'steps_100k', name: 'Marathon Walker', nameRu: 'Марафонец', description: '100K total steps', descriptionRu: '100 000 шагов всего', icon: '🏃', condition: s => s.totalSteps >= 100000, xpReward: 200 },

    // Level achievements
    { id: 'level_5', name: 'Rising Star', nameRu: 'Восходящая звезда', description: 'Reach level 5', descriptionRu: 'Достигни 5 уровня', icon: '⭐', condition: s => s.level >= 5, xpReward: 100 },
    { id: 'level_10', name: 'Disciplined', nameRu: 'Дисциплинированный', description: 'Reach level 10', descriptionRu: 'Достигни 10 уровня', icon: '🎖️', condition: s => s.level >= 10, xpReward: 250 },

    // First time achievements
    { id: 'first_day', name: 'Day One', nameRu: 'Первый день', description: 'Complete your first day', descriptionRu: 'Закрой первый день', icon: '🎯', condition: s => s.totalDaysLogged >= 1, xpReward: 25 },
    { id: 'first_meal', name: 'Food Tracker', nameRu: 'Трекер еды', description: 'Log your first meal', descriptionRu: 'Залогируй первую еду', icon: '🍽️', condition: s => s.totalMealsLogged >= 1, xpReward: 15 },
];

// ==================== XP & LEVELS ====================

// XP required for each level (exponential growth)
export const getXpForLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate level from total XP
export const getLevelFromXp = (xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progress: number } => {
    let level = 1;
    let remainingXp = xp;

    while (remainingXp >= getXpForLevel(level)) {
        remainingXp -= getXpForLevel(level);
        level++;
    }

    const nextLevelXp = getXpForLevel(level);
    const progress = remainingXp / nextLevelXp;

    return { level, currentLevelXp: remainingXp, nextLevelXp, progress };
};

// XP rewards for actions
export const XP_REWARDS = {
    habitComplete: 10,
    dayClose: 25,
    mealLog: 5,
    streakBonus: (streak: number) => Math.min(streak * 5, 50), // Max 50 bonus
    achievementUnlock: 0, // Already included in achievement
};

// ==================== STORAGE ====================

const GAMIFICATION_KEY = 'dd_gamification';

export interface GamificationData {
    xp: number;
    unlockedAchievements: string[];
    stats: UserStats;
    lastUpdated: string;
}

export const getDefaultGamificationData = (): GamificationData => ({
    xp: 0,
    unlockedAchievements: [],
    stats: {
        totalDaysLogged: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalHabitsCompleted: 0,
        totalMealsLogged: 0,
        totalSteps: 0,
        level: 1,
        xp: 0
    },
    lastUpdated: new Date().toISOString()
});

export const loadGamificationData = (): GamificationData => {
    const saved = localStorage.getItem(GAMIFICATION_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return getDefaultGamificationData();
};

export const saveGamificationData = (data: GamificationData) => {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString()
    }));
};

// Add XP and check for level up
export const addXp = (amount: number): { newXp: number; levelUp: boolean; newLevel: number } => {
    const data = loadGamificationData();
    const oldLevel = getLevelFromXp(data.xp).level;
    data.xp += amount;
    data.stats.xp = data.xp;
    const newLevelInfo = getLevelFromXp(data.xp);
    data.stats.level = newLevelInfo.level;
    saveGamificationData(data);

    return {
        newXp: data.xp,
        levelUp: newLevelInfo.level > oldLevel,
        newLevel: newLevelInfo.level
    };
};

// Check for new achievements
export const checkAchievements = (stats: Partial<UserStats>): Achievement[] => {
    const data = loadGamificationData();
    const updatedStats = { ...data.stats, ...stats };
    data.stats = updatedStats;

    const newUnlocks: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
        if (!data.unlockedAchievements.includes(achievement.id) && achievement.condition(updatedStats)) {
            data.unlockedAchievements.push(achievement.id);
            newUnlocks.push(achievement);
            data.xp += achievement.xpReward;
        }
    }

    data.stats.xp = data.xp;
    data.stats.level = getLevelFromXp(data.xp).level;
    saveGamificationData(data);

    return newUnlocks;
};

// ==================== CHALLENGES ====================

export interface Challenge {
    id: string;
    name: string;
    nameRu: string;
    description: string;
    descriptionRu: string;
    icon: string;
    target: number;
    xpReward: number;
    type: 'habits' | 'streak' | 'steps' | 'meals';
}

export const WEEKLY_CHALLENGES: Challenge[] = [
    { id: 'w_habits_7', name: '7 Day Habit Hero', nameRu: '7 дней привычек', description: 'Complete all habits for 7 days', descriptionRu: 'Выполни все привычки 7 дней', icon: '🎯', target: 7, xpReward: 150, type: 'habits' },
    { id: 'w_steps_50k', name: 'Weekly Walker', nameRu: 'Недельный ходок', description: '50K steps this week', descriptionRu: '50К шагов за неделю', icon: '🚶', target: 50000, xpReward: 100, type: 'steps' },
    { id: 'w_meals_14', name: 'Food Logger', nameRu: 'Пищевой дневник', description: 'Log 14 meals this week', descriptionRu: '14 приёмов пищи за неделю', icon: '🍴', target: 14, xpReward: 75, type: 'meals' },
];

export const getCurrentWeeklyChallenge = (): Challenge => {
    // Rotate challenges weekly
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return WEEKLY_CHALLENGES[weekNumber % WEEKLY_CHALLENGES.length];
};
