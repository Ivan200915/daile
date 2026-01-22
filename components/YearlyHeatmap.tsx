import React, { useState } from 'react';

interface DailyLog {
    date: string;
    closed?: boolean;
    habits?: { id: string; completed: boolean }[];
    meals?: any[];
    metrics?: {
        steps?: number;
        sleepHours?: number;
        activeMinutes?: number;
    };
    checkIn?: {
        mood?: number;
        energy?: number;
    };
}

interface YearlyHeatmapProps {
    logs: DailyLog[];
    year?: number;
}

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';

export const YearlyHeatmap: React.FC<YearlyHeatmapProps> = ({ logs, year }) => {
    const currentYear = year || new Date().getFullYear();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Generate all days for the year
    const generateYearData = () => {
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);
        const days: { date: string; level: number; dayOfWeek: number; week: number }[] = [];

        let currentDate = new Date(startDate);
        let weekNum = 0;

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const log = logs.find(l => l.date === dateStr);
            const dayOfWeek = currentDate.getDay();

            // Start new week on Sunday
            if (dayOfWeek === 0 && days.length > 0) {
                weekNum++;
            }

            let level = 0;
            if (log?.closed) {
                level = 4;
            } else if (log) {
                const completedHabits = log.habits?.filter(h => h.completed).length || 0;
                const totalHabits = log.habits?.length || 1;
                const ratio = completedHabits / totalHabits;
                level = ratio >= 0.75 ? 3 : ratio >= 0.5 ? 2 : ratio > 0 ? 1 : 0;
            }

            days.push({
                date: dateStr,
                level,
                dayOfWeek,
                week: weekNum
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    const yearData = generateYearData();
    const weeks = Array.from({ length: 53 }, (_, i) => i);

    const getColorForLevel = (level: number) => {
        switch (level) {
            case 4: return 'bg-[#00D4AA]';
            case 3: return 'bg-[#00D4AA]/70';
            case 2: return 'bg-[#00D4AA]/40';
            case 1: return 'bg-[#00D4AA]/20';
            default: return 'bg-white/5';
        }
    };

    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    // Calculate total active days
    const activeDays = yearData.filter(d => d.level > 0).length;
    const totalDays = yearData.length;
    const percentage = Math.round((activeDays / totalDays) * 100);

    return (
        <div className={`${GLASS_PANEL} p-4`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-white/70">{currentYear} Обзор активности</h3>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-white/50">{activeDays} дней ({percentage}%)</span>
                </div>
            </div>

            {/* Month Labels */}
            <div className="flex mb-1 text-[8px] text-white/30">
                {months.map((m, i) => (
                    <div key={i} style={{ width: `${100 / 12}%` }} className="text-center">{m}</div>
                ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-[2px] overflow-x-auto no-scrollbar pb-2">
                {weeks.map((weekNum) => (
                    <div key={weekNum} className="flex flex-col gap-[2px]">
                        {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                            const day = yearData.find(d => d.week === weekNum && d.dayOfWeek === dayOfWeek);
                            if (!day) return <div key={dayOfWeek} className="w-[10px] h-[10px]" />;

                            return (
                                <div
                                    key={day.date}
                                    className={`w-[10px] h-[10px] rounded-[2px] ${getColorForLevel(day.level)} cursor-pointer hover:ring-1 hover:ring-white/50 transition-all`}
                                    title={`${day.date}: ${day.level > 0 ? 'Активен' : 'Неактивен'}`}
                                    onClick={() => setSelectedDate(day.date === selectedDate ? null : day.date)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-white/30">Меньше</span>
                    {[0, 1, 2, 3, 4].map(l => (
                        <div key={l} className={`w-[10px] h-[10px] rounded-[2px] ${getColorForLevel(l)}`} />
                    ))}
                    <span className="text-[10px] text-white/30">Больше</span>
                </div>
            </div>

            {/* Selected Day Details */}
            {selectedDate && (() => {
                const log = logs.find(l => l.date === selectedDate);
                if (!log) return (
                    <div className="mt-3 p-3 bg-white/5 rounded-xl text-sm">
                        <p className="text-white/50">{selectedDate}: Нет данных</p>
                    </div>
                );

                return (
                    <div className="mt-3 p-3 bg-white/5 rounded-xl text-sm space-y-1">
                        <p className="font-semibold">{selectedDate}</p>
                        {log.metrics?.steps && <p className="text-white/60">{log.metrics.steps.toLocaleString()} шагов</p>}
                        {log.metrics?.sleepHours && <p className="text-white/60">{log.metrics.sleepHours}ч сна</p>}
                        {log.checkIn?.mood && <p className="text-white/60">Настроение: {log.checkIn.mood}/5</p>}
                        {log.habits && <p className="text-white/60">{log.habits.filter(h => h.completed).length}/{log.habits.length} привычек</p>}
                    </div>
                );
            })()}
        </div>
    );
};

export default YearlyHeatmap;
