// HabitDNA Component
// Visual grid showing habit completion patterns over time

import React, { useState } from 'react';
import { DailyLog } from '../types';
import { AVAILABLE_HABITS } from '../constants';
import { Icons } from './Icons';
import { GLASS_PANEL_LIGHT } from '../constants';

interface HabitDNAProps {
    logs: DailyLog[];
    days?: number;
}

// Color palette for habits
const HABIT_COLORS: { [key: string]: string } = {
    water: '#3B82F6',
    workout: '#EF4444',
    'no-sugar': '#F59E0B',
    meditation: '#8B5CF6',
    steps: '#10B981',
    sleep: '#6366F1',
    vegetables: '#22C55E',
    'no-alcohol': '#EC4899',
    journaling: '#F97316',
    stretch: '#14B8A6',
};

const getHabitColor = (habitId: string): string => {
    return HABIT_COLORS[habitId] || '#00D4AA';
};

const HabitDNA: React.FC<HabitDNAProps> = ({ logs, days = 14 }) => {
    const [selectedCell, setSelectedCell] = useState<{ date: string; habitId: string } | null>(null);

    // Get unique habits from all logs
    const allHabitIds = new Set<string>();
    logs.forEach(log => {
        log.habits?.forEach(h => allHabitIds.add(h.id));
    });
    const habitIds = Array.from(allHabitIds);

    // Get last N days
    const today = new Date();
    const daysList: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        daysList.push(d.toISOString().split('T')[0]);
    }

    // Get habit label
    const getHabitLabel = (id: string): string => {
        const habit = AVAILABLE_HABITS.find(h => h.id === id);
        return habit?.label || id;
    };

    // Get short day label
    const getDayLabel = (dateStr: string): string => {
        const d = new Date(dateStr);
        return d.getDate().toString();
    };

    // Check if habit was completed on a day
    const isCompleted = (date: string, habitId: string): boolean => {
        const log = logs.find(l => l.date === date);
        return log?.habits?.find(h => h.id === habitId)?.completed || false;
    };

    // Calculate streak for habit
    const getHabitStreak = (habitId: string): number => {
        let streak = 0;
        for (let i = daysList.length - 1; i >= 0; i--) {
            if (isCompleted(daysList[i], habitId)) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    // Calculate completion rate
    const getCompletionRate = (habitId: string): number => {
        let completed = 0;
        daysList.forEach(date => {
            if (isCompleted(date, habitId)) completed++;
        });
        return Math.round((completed / daysList.length) * 100);
    };

    if (habitIds.length === 0) {
        return (
            <div className="text-center py-6 text-white/50">
                <p className="text-sm">Начни выполнять привычки, чтобы увидеть свою ДНК!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* DNA Grid */}
            <div className="overflow-x-auto no-scrollbar pb-2">
                <div className="min-w-max">
                    {/* Day labels */}
                    <div className="flex mb-2 pl-24">
                        {daysList.map((date, i) => (
                            <div
                                key={date}
                                className="w-6 text-center text-xs text-white/40"
                            >
                                {getDayLabel(date)}
                            </div>
                        ))}
                    </div>

                    {/* Habit rows */}
                    {habitIds.map(habitId => {
                        const color = getHabitColor(habitId);
                        const streak = getHabitStreak(habitId);
                        const rate = getCompletionRate(habitId);

                        return (
                            <div key={habitId} className="flex items-center mb-2">
                                {/* Habit label */}
                                <div
                                    className="w-20 pr-2 truncate text-xs font-medium"
                                    style={{ color }}
                                >
                                    {getHabitLabel(habitId)}
                                </div>

                                {/* Streak badge */}
                                <div className="w-4 mr-2 text-center">
                                    {streak > 0 && (
                                        <span className="text-xs text-orange-400">{streak}</span>
                                    )}
                                </div>

                                {/* Cells */}
                                <div className="flex">
                                    {daysList.map(date => {
                                        const completed = isCompleted(date, habitId);
                                        const isSelected = selectedCell?.date === date && selectedCell?.habitId === habitId;

                                        return (
                                            <button
                                                key={date}
                                                onClick={() => setSelectedCell(isSelected ? null : { date, habitId })}
                                                className={`w-6 h-6 flex items-center justify-center transition-all duration-200 ${isSelected ? 'scale-125 z-10' : 'hover:scale-110'}`}
                                            >
                                                <div
                                                    className={`rounded-full transition-all duration-300 ${completed ? 'w-4 h-4' : 'w-2 h-2 opacity-30'}`}
                                                    style={{
                                                        backgroundColor: completed ? color : 'rgba(255,255,255,0.2)',
                                                        boxShadow: completed ? `0 0 8px ${color}80` : 'none',
                                                    }}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Rate badge */}
                                <div className="w-10 ml-2 text-right">
                                    <span
                                        className="text-xs font-medium"
                                        style={{ color: rate >= 70 ? '#00D4AA' : rate >= 40 ? '#FFD700' : '#FF6B6B' }}
                                    >
                                        {rate}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected cell info */}
            {selectedCell && (
                <div className={`${GLASS_PANEL_LIGHT} p-3 animate-fade-in`}>
                    <p className="text-sm">
                        <span className="font-medium" style={{ color: getHabitColor(selectedCell.habitId) }}>
                            {getHabitLabel(selectedCell.habitId)}
                        </span>
                        {' — '}
                        <span className="text-white/70">
                            {new Date(selectedCell.date).toLocaleDateString('ru-RU', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                            })}
                        </span>
                        {': '}
                        <span className={isCompleted(selectedCell.date, selectedCell.habitId) ? 'text-[#00D4AA]' : 'text-red-400'}>
                            {isCompleted(selectedCell.date, selectedCell.habitId) ? '✓ Выполнено' : '✗ Пропущено'}
                        </span>
                    </p>
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-white/50 pt-2">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-[#00D4AA]" />
                        <span>Выполнено</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <span>Пропущено</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <Icons.Flame size={12} className="text-orange-400" />
                    <span>Streak</span>
                </div>
            </div>
        </div>
    );
};

export default HabitDNA;
