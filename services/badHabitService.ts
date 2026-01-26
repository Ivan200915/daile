import { BadHabit, RestorationState, RestorationBranch } from '../types';

const BAD_HABIT_STORAGE_KEY = 'daily_discipline_bad_habits';
const RESTORATION_TREE_KEY = 'daily_discipline_restoration_tree';

// Restoration Tree Config
const BRANCH_CONFIG: Record<string, { name: string; nameRu: string }> = {
    lungs: { name: 'Lungs & Cardio', nameRu: 'Легкие и Кардио' },
    wallet: { name: 'Wallet & Savings', nameRu: 'Финансы' },
    energy: { name: 'Energy & Focus', nameRu: 'Энергия' },
    dopamine: { name: 'Dopamine Control', nameRu: 'Дофамин' },
};

const XP_PER_LEVEL = 100;

export const loadBadHabits = (): BadHabit[] => {
    const stored = localStorage.getItem(BAD_HABIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveBadHabits = (habits: BadHabit[]) => {
    localStorage.setItem(BAD_HABIT_STORAGE_KEY, JSON.stringify(habits));
};

export const loadRestorationState = (): RestorationState => {
    const stored = localStorage.getItem(RESTORATION_TREE_KEY);
    if (stored) return JSON.parse(stored);

    // Initialize default branches
    const branches: Record<string, RestorationBranch> = {};
    Object.keys(BRANCH_CONFIG).forEach(key => {
        branches[key] = {
            id: key,
            name: BRANCH_CONFIG[key].name,
            nameRu: BRANCH_CONFIG[key].nameRu,
            level: 1,
            xp: 0,
            maxXP: XP_PER_LEVEL,
            status: 'withered'
        };
    });
    return { branches };
};

export const saveRestorationState = (state: RestorationState) => {
    localStorage.setItem(RESTORATION_TREE_KEY, JSON.stringify(state));
};

/**
 * Calculates adaptive limit using Weighted Rolling Average.
 * Formula: Limit = Avg(Last 7 Days) * 0.95
 * Stabilization: If usage > limit, next limit = usage (no punishment).
 */
export const calculateNextLimit = (habit: BadHabit, todayUsage: number): number => {
    // 1. Get last 7 days (including today for immediate feedback loop)
    const history = [...habit.logs];
    // Add today tentatively if not present
    if (history.length === 0 || history[history.length - 1].date !== new Date().toDateString()) {
        history.push({ date: new Date().toDateString(), count: todayUsage });
    } else {
        history[history.length - 1].count = todayUsage;
    }

    const last7Days = history.slice(-7).map(l => l.count);
    const avg = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;

    // 2. Logic: If today user EXCEEDED limit, stabilize.
    if (todayUsage > habit.limit) {
        return Math.ceil(todayUsage); // Maintain current usage, don't force drop
    }

    // 3. Logic: If user SUCCEEDED, apply tapering (5% reduction)
    return Math.floor(avg * 0.95) || 1; // Minimum 1 until quit
};

/**
 * Updates XP for restoration branches based on performance.
 * XP = (Baseline - Today) * Multiplier
 */
export const updateRestorationXP = (habit: BadHabit, todayUsage: number) => {
    const state = loadRestorationState();

    // Calculate XP gain (Inversion: Less usage = More XP)
    const gain = Math.max(0, (habit.baseline - todayUsage) * 10);

    if (gain === 0) return state; // No growth if failed baseline

    // Distribution logic (Simplified: All relevant branches grow)
    // In future: map habit categories to specific branches
    Object.keys(state.branches).forEach(key => {
        const branch = state.branches[key];
        branch.xp += gain;

        // Level Up
        if (branch.xp >= branch.maxXP) {
            branch.level++;
            branch.xp -= branch.maxXP;
            branch.maxXP = Math.floor(branch.maxXP * 1.2); // Harder each level

            // Visual evolution
            if (branch.level > 2) branch.status = 'sprouting';
            if (branch.level > 5) branch.status = 'blooming';
            if (branch.level > 10) branch.status = 'thriving';
        }
    });

    saveRestorationState(state);
    return state;
};

export const logBadHabitUsage = (habitId: string, delta: number) => {
    const habits = loadBadHabits();
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return habits;

    const habit = habits[habitIndex];
    const todayStr = new Date().toDateString();

    const logIndex = habit.logs.findIndex(l => l.date === todayStr);
    let todayUsage = 0;

    if (logIndex >= 0) {
        habit.logs[logIndex].count += delta;
        todayUsage = habit.logs[logIndex].count;
    } else {
        habit.logs.push({ date: todayStr, count: delta });
        todayUsage = delta;
    }

    // Recalculate LIMIT for TOMORROW (stored in habit)
    // Note: In a real app, limit usually updates at midnight. 
    // Here we update it dynamic for the *next* day view.
    // For simplicity, we just persist usage. Limit update logic should be a daily job.

    // Save
    habits[habitIndex] = habit;
    saveBadHabits(habits);

    // Process Restoration
    updateRestorationXP(habit, todayUsage);

    return habits;
};

export const checkStreakRepair = (habitId: string): boolean => {
    // Placeholder logic for streak repair
    // In real implementation, this would check if a repair task was completed
    return false;
};
