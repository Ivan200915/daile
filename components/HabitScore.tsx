// HabitScore - Consistency measurement beyond streaks
import React from 'react';
import { DailyLog } from '../types';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-[#1C1C1E]/60 backdrop-blur-[30px] border border-white/10 rounded-[28px]';

interface HabitScoreProps {
    logs: DailyLog[];
}

// Calculate habit score based on consistency over last 30 days
function calculateHabitScore(logs: DailyLog[]): { score: number; trend: 'up' | 'down' | 'stable'; details: { completed: number; total: number } } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get logs from last 30 days
    const recentLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= thirtyDaysAgo && logDate <= now;
    });

    // Calculate total habits completed vs total habits tracked
    let totalHabits = 0;
    let completedHabits = 0;

    recentLogs.forEach(log => {
        totalHabits += log.habits.length;
        completedHabits += log.habits.filter(h => h.completed).length;
    });

    // Score is percentage of completed habits (0-100)
    const score = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    // Calculate trend (compare last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const last7 = logs.filter(l => new Date(l.date) >= sevenDaysAgo);
    const prev7 = logs.filter(l => new Date(l.date) >= fourteenDaysAgo && new Date(l.date) < sevenDaysAgo);

    const last7Score = last7.length > 0
        ? last7.reduce((acc, l) => acc + l.habits.filter(h => h.completed).length, 0) / Math.max(1, last7.reduce((acc, l) => acc + l.habits.length, 0))
        : 0;
    const prev7Score = prev7.length > 0
        ? prev7.reduce((acc, l) => acc + l.habits.filter(h => h.completed).length, 0) / Math.max(1, prev7.reduce((acc, l) => acc + l.habits.length, 0))
        : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (last7Score > prev7Score + 0.1) trend = 'up';
    if (last7Score < prev7Score - 0.1) trend = 'down';

    return { score, trend, details: { completed: completedHabits, total: totalHabits } };
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#00D4AA';
    if (score >= 60) return '#FFD700';
    if (score >= 40) return '#FF9500';
    return '#FF6B6B';
}

function getScoreLabel(score: number, isRu: boolean): string {
    if (score >= 90) return isRu ? 'Невероятно!' : 'Incredible!';
    if (score >= 80) return isRu ? 'Отлично' : 'Excellent';
    if (score >= 60) return isRu ? 'Хорошо' : 'Good';
    if (score >= 40) return isRu ? 'Неплохо' : 'Fair';
    return isRu ? 'Можно лучше' : 'Needs work';
}

export const HabitScore = ({ logs }: HabitScoreProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    const { score, trend, details } = calculateHabitScore(logs);
    const color = getScoreColor(score);
    const label = getScoreLabel(score, isRu);

    const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
    const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-white/50';

    return (
        <div className={`${GLASS_PANEL} p-4`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-white/50">
                        {isRu ? 'Habit Score (30 дней)' : 'Habit Score (30 days)'}
                    </p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                        <span className="text-lg text-white/30">/100</span>
                        <span className={`text-lg ${trendColor}`}>{trendIcon}</span>
                    </div>
                    <p className="text-sm" style={{ color }}>{label}</p>
                </div>

                {/* Circular progress indicator */}
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18" cy="18" r="16"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                        />
                        <circle
                            cx="18" cy="18" r="16"
                            fill="none"
                            stroke={color}
                            strokeWidth="3"
                            strokeDasharray={`${score} 100`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold" style={{ color }}>
                            {details.completed}/{details.total}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitScore;
