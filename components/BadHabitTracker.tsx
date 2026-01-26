import React, { useEffect, useState } from 'react';
import { BadHabit } from '../types';
import { loadBadHabits, checkStreakRepair, calculateNextLimit, logBadHabitUsage } from '../services/badHabitService';
import { UserSettings } from '../types';
import { Icons } from './Icons';
import { GLASS_PANEL_LIGHT } from '../constants';

export const BadHabitTracker = ({ settings }: { settings: UserSettings }) => {
    const [habits, setHabits] = useState<BadHabit[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const refresh = () => {
        setHabits(loadBadHabits());
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleLog = (id: string, delta: number) => {
        logBadHabitUsage(id, delta);
        refresh();
    };

    if (habits.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            <h3 className="text-white/70 font-bold ml-1 text-sm uppercase tracking-wider">Bad Habits (Limit Control)</h3>

            {habits.map(habit => {
                const todayStr = new Date().toDateString();
                const todayLog = habit.logs.find(l => l.date === todayStr);
                const usages = todayLog ? todayLog.count : 0;
                const remaining = Math.max(0, habit.limit - usages);
                const percent = Math.min(100, (usages / habit.limit) * 100);

                // Color logic: Green < 50%, Yellow < 80%, Red > 80%
                let color = '#10B981';
                if (percent > 50) color = '#F59E0B'; // Orange
                if (percent > 80) color = '#EF4444'; // Red
                if (usages > habit.limit) color = '#7F1D1D'; // Dark Red (Stabilization mode)

                // @ts-ignore
                const Icon = Icons[habit.icon] || Icons.AlertTriangle;

                return (
                    <div key={habit.id} className={`${GLASS_PANEL_LIGHT} p-4 transition-all`}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg bg-white/5`}>
                                    <Icon size={20} color={color} />
                                </div>
                                <div>
                                    <h4 className="font-bold">{habit.label}</h4>
                                    <p className="text-[10px] text-white/50">
                                        Baseline: {habit.baseline} / Limit: {habit.limit}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-2xl font-mono font-bold" style={{ color }}>{usages}</span>
                                <span className="text-xs text-white/40"> / {habit.limit}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full transition-all duration-500"
                                style={{ width: `${percent}%`, backgroundColor: color }}
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleLog(habit.id, 1)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold active:scale-95 transition"
                                >
                                    +1
                                </button>
                                <button
                                    onClick={() => handleLog(habit.id, -1)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold active:scale-95 transition text-white/50"
                                >
                                    -1
                                </button>
                            </div>

                            {usages > habit.limit && (
                                <span className="text-[10px] text-red-400 font-medium animate-pulse">
                                    Stabilization Mode Active
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
