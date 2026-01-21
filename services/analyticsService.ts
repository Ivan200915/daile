// Analytics Service
// Data aggregation, trends, correlations, and insights

import { DailyLog } from '../types';

// Helper to get energy from DailyLog
const getEnergy = (log: DailyLog): number | null => log.checkIn?.energy ?? null;

// ==================== DATA AGGREGATION ====================

export interface WeeklyStats {
    weekStart: string;
    daysCompleted: number;
    habitsCompleted: number;
    totalHabits: number;
    avgEnergy: number;
    avgSteps: number;
    avgSleep: number;
    mealsLogged: number;
}

export interface MonthlyTrend {
    month: string;
    completionRate: number;
    avgEnergy: number;
    totalDays: number;
}

export const aggregateWeeklyStats = (logs: DailyLog[]): WeeklyStats[] => {
    const weeks: Map<string, DailyLog[]> = new Map();

    logs.forEach(log => {
        const date = new Date(log.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeks.has(weekKey)) {
            weeks.set(weekKey, []);
        }
        weeks.get(weekKey)!.push(log);
    });

    const result: WeeklyStats[] = [];
    weeks.forEach((weekLogs, weekStart) => {
        const daysCompleted = weekLogs.filter(l => l.closed).length;
        const habitsCompleted = weekLogs.reduce((sum, l) =>
            sum + (l.habits?.filter(h => h.completed).length || 0), 0);
        const totalHabits = weekLogs.reduce((sum, l) =>
            sum + (l.habits?.length || 0), 0);
        const energyLogs = weekLogs.filter(l => getEnergy(l) !== null);
        const avgEnergy = energyLogs.length > 0
            ? energyLogs.reduce((sum, l) => sum + (getEnergy(l) || 0), 0) / energyLogs.length
            : 0;

        result.push({
            weekStart,
            daysCompleted,
            habitsCompleted,
            totalHabits,
            avgEnergy: Math.round(avgEnergy * 10) / 10,
            avgSteps: 0, // Would need health metrics
            avgSleep: 0,
            mealsLogged: weekLogs.reduce((sum, l) => sum + (l.meals?.length || 0), 0)
        });
    });

    return result.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
};

// ==================== CORRELATIONS ====================

export interface Correlation {
    factor1: string;
    factor2: string;
    correlation: number; // -1 to 1
    insight: string;
    insightRu: string;
}

export const analyzeCorrelations = (logs: DailyLog[]): Correlation[] => {
    const correlations: Correlation[] = [];

    // Filter logs with required data
    const logsWithEnergy = logs.filter(l => getEnergy(l) !== null && l.habits);

    if (logsWithEnergy.length >= 7) {
        // Workout vs Energy correlation
        const workoutDays = logsWithEnergy.filter(l =>
            l.habits?.some(h => h.id === 'workout' && h.completed));
        const nonWorkoutDays = logsWithEnergy.filter(l =>
            !l.habits?.some(h => h.id === 'workout' && h.completed));

        if (workoutDays.length > 0 && nonWorkoutDays.length > 0) {
            const avgWorkoutEnergy = workoutDays.reduce((s, l) => s + (getEnergy(l) || 0), 0) / workoutDays.length;
            const avgNoWorkoutEnergy = nonWorkoutDays.reduce((s, l) => s + (getEnergy(l) || 0), 0) / nonWorkoutDays.length;
            const diff = avgWorkoutEnergy - avgNoWorkoutEnergy;

            if (Math.abs(diff) > 0.5) {
                correlations.push({
                    factor1: 'Workout',
                    factor2: 'Energy',
                    correlation: diff > 0 ? 0.7 : -0.3,
                    insight: diff > 0
                        ? `You have ${Math.round(diff * 10) / 10} more energy on workout days!`
                        : `Workouts might be draining you. Consider lighter exercises.`,
                    insightRu: diff > 0
                        ? `У тебя на ${Math.round(diff * 10) / 10} больше энергии в дни тренировок!`
                        : `Тренировки могут истощать тебя. Попробуй более лёгкие упражнения.`
                });
            }
        }

        // Meditation vs Energy
        const meditationDays = logsWithEnergy.filter(l =>
            l.habits?.some(h => h.id === 'meditation' && h.completed));
        const noMeditationDays = logsWithEnergy.filter(l =>
            !l.habits?.some(h => h.id === 'meditation' && h.completed));

        if (meditationDays.length > 2 && noMeditationDays.length > 2) {
            const avgMedEnergy = meditationDays.reduce((s, l) => s + (getEnergy(l) || 0), 0) / meditationDays.length;
            const avgNoMedEnergy = noMeditationDays.reduce((s, l) => s + (getEnergy(l) || 0), 0) / noMeditationDays.length;
            const diff = avgMedEnergy - avgNoMedEnergy;

            if (diff > 0.3) {
                correlations.push({
                    factor1: 'Meditation',
                    factor2: 'Energy',
                    correlation: 0.6,
                    insight: `Meditation days show higher energy levels.`,
                    insightRu: `В дни медитации у тебя выше уровень энергии.`
                });
            }
        }
    }

    // Habit completion rate trend
    const recentLogs = logs.slice(-14);
    const olderLogs = logs.slice(-28, -14);

    if (recentLogs.length >= 7 && olderLogs.length >= 7) {
        const recentRate = recentLogs.filter(l => l.closed).length / recentLogs.length;
        const olderRate = olderLogs.filter(l => l.closed).length / olderLogs.length;
        const improvement = recentRate - olderRate;

        if (Math.abs(improvement) > 0.1) {
            correlations.push({
                factor1: 'Time',
                factor2: 'Completion',
                correlation: improvement > 0 ? 0.8 : -0.5,
                insight: improvement > 0
                    ? `You improved ${Math.round(improvement * 100)}% in the last 2 weeks!`
                    : `Completion rate dropped. Need a refresh?`,
                insightRu: improvement > 0
                    ? `Ты улучшился на ${Math.round(improvement * 100)}% за последние 2 недели!`
                    : `Показатель выполнения снизился. Нужна перезагрузка?`
            });
        }
    }

    return correlations;
};

// ==================== AI RECOMMENDATIONS ====================

export interface AIRecommendation {
    icon: string;
    title: string;
    titleRu: string;
    description: string;
    descriptionRu: string;
    priority: 'high' | 'medium' | 'low';
}

export const generateRecommendations = (logs: DailyLog[]): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = [];
    const recentLogs = logs.slice(-7);

    if (recentLogs.length < 3) {
        recommendations.push({
            icon: '📊',
            title: 'Log more days',
            titleRu: 'Больше данных',
            description: 'Log at least 7 days for personalized insights',
            descriptionRu: 'Залогируй минимум 7 дней для персонализированных инсайтов',
            priority: 'medium'
        });
        return recommendations;
    }

    // Check workout consistency
    const workoutDays = recentLogs.filter(l =>
        l.habits?.some(h => h.id === 'workout' && h.completed)).length;

    if (workoutDays < 3) {
        recommendations.push({
            icon: '💪',
            title: 'Add more workouts',
            titleRu: 'Больше тренировок',
            description: 'Try to workout at least 3x per week',
            descriptionRu: 'Попробуй тренироваться минимум 3 раза в неделю',
            priority: 'high'
        });
    }

    // Check water intake
    const waterDays = recentLogs.filter(l =>
        l.habits?.some(h => h.id === 'water' && h.completed)).length;

    if (waterDays < 5) {
        recommendations.push({
            icon: '💧',
            title: 'Drink more water',
            titleRu: 'Пей больше воды',
            description: 'Hydration improves energy and focus',
            descriptionRu: 'Гидратация улучшает энергию и концентрацию',
            priority: 'medium'
        });
    }

    // Check if user closes days
    const closedDays = recentLogs.filter(l => l.closed).length;
    if (closedDays < 4) {
        recommendations.push({
            icon: '✅',
            title: 'Close your days',
            titleRu: 'Закрывай дни',
            description: 'Closing days helps build streaks and XP',
            descriptionRu: 'Закрытие дней помогает строить стрики и XP',
            priority: 'high'
        });
    }

    // Check meal logging
    const mealsLogged = recentLogs.reduce((sum, l) => sum + (l.meals?.length || 0), 0);
    if (mealsLogged < 10) {
        recommendations.push({
            icon: '🍽️',
            title: 'Log your meals',
            titleRu: 'Логируй еду',
            description: 'Track meals to understand your nutrition',
            descriptionRu: 'Отслеживай еду для понимания своего питания',
            priority: 'low'
        });
    }

    // Check energy patterns
    const logsWithEnergy = recentLogs.filter(l => getEnergy(l) !== null);
    const avgEnergy = logsWithEnergy.reduce((sum, l) => sum + (getEnergy(l) || 0), 0) /
        (logsWithEnergy.length || 1);

    if (avgEnergy < 5) {
        recommendations.push({
            icon: '⚡',
            title: 'Boost your energy',
            titleRu: 'Повысь энергию',
            description: 'Try meditation, better sleep, or walks',
            descriptionRu: 'Попробуй медитацию, лучший сон или прогулки',
            priority: 'high'
        });
    }

    return recommendations.sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
    });
};

// ==================== EXPORT DATA ====================

export const generateReportData = (logs: DailyLog[], streak: { currentStreak: number; longestStreak: number }) => {
    const last30 = logs.slice(-30);
    const closedDays = last30.filter(l => l.closed).length;
    const totalHabits = last30.reduce((sum, l) => sum + (l.habits?.length || 0), 0);
    const completedHabits = last30.reduce((sum, l) =>
        sum + (l.habits?.filter(h => h.completed).length || 0), 0);
    const mealsLogged = last30.reduce((sum, l) => sum + (l.meals?.length || 0), 0);

    return {
        period: '30 days',
        closedDays,
        completionRate: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        habitsCompleted: completedHabits,
        mealsLogged,
        generatedAt: new Date().toISOString()
    };
};
