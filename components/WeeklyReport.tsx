import React from 'react';

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

interface WeeklyReportProps {
    logs: DailyLog[];
}

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl';

export const WeeklyReport: React.FC<WeeklyReportProps> = ({ logs }) => {
    // Get last 7 days
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);

    const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= today;
    });

    // Calculate metrics
    const totalDays = weekLogs.length;
    const closedDays = weekLogs.filter(l => l.closed).length;
    const avgSteps = totalDays > 0
        ? Math.round(weekLogs.reduce((sum, l) => sum + (l.metrics?.steps || 0), 0) / totalDays)
        : 0;
    const avgSleep = totalDays > 0
        ? (weekLogs.reduce((sum, l) => sum + (l.metrics?.sleepHours || 0), 0) / totalDays).toFixed(1)
        : '0';
    const avgMood = totalDays > 0
        ? (weekLogs.reduce((sum, l) => sum + (l.checkIn?.mood || 3), 0) / totalDays).toFixed(1)
        : '3';
    const totalHabits = weekLogs.reduce((sum, l) => sum + (l.habits?.filter(h => h.completed).length || 0), 0);

    // Previous week comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);

    const prevWeekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= prevWeekStart && logDate <= prevWeekEnd;
    });

    const prevAvgSteps = prevWeekLogs.length > 0
        ? Math.round(prevWeekLogs.reduce((sum, l) => sum + (l.metrics?.steps || 0), 0) / prevWeekLogs.length)
        : 0;
    const prevAvgSleep = prevWeekLogs.length > 0
        ? prevWeekLogs.reduce((sum, l) => sum + (l.metrics?.sleepHours || 0), 0) / prevWeekLogs.length
        : 0;

    const stepsTrend = prevAvgSteps > 0 ? ((avgSteps - prevAvgSteps) / prevAvgSteps * 100).toFixed(0) : 0;
    const sleepTrend = prevAvgSleep > 0 ? ((parseFloat(avgSleep) - prevAvgSleep) / prevAvgSleep * 100).toFixed(0) : 0;

    // Best day
    const bestDay = weekLogs.reduce((best, log) => {
        const score = (log.habits?.filter(h => h.completed).length || 0) + (log.closed ? 10 : 0);
        const bestScore = (best?.habits?.filter(h => h.completed).length || 0) + (best?.closed ? 10 : 0);
        return score > bestScore ? log : best;
    }, weekLogs[0]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const TrendArrow = ({ value }: { value: number | string }) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (num > 0) return <span className="text-[#00D4AA]">↑ {Math.abs(num)}%</span>;
        if (num < 0) return <span className="text-red-400">↓ {Math.abs(num)}%</span>;
        return <span className="text-white/50">→</span>;
    };

    return (
        <div className={`${GLASS_PANEL} p-4`}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-white/70">Недельный отчет</h3>
                    <p className="text-xs text-white/40">
                        {weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — {today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-[#00D4AA]">{closedDays}/{totalDays}</p>
                    <p className="text-xs text-white/50">дней закрыто</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`${GLASS_PANEL_LIGHT} p-3`}>
                    <p className="text-xs text-white/50 mb-1">Среднее шагов</p>
                    <p className="text-lg font-bold">{avgSteps.toLocaleString()}</p>
                    <TrendArrow value={stepsTrend} />
                </div>
                <div className={`${GLASS_PANEL_LIGHT} p-3`}>
                    <p className="text-xs text-white/50 mb-1">Среднее сна</p>
                    <p className="text-lg font-bold">{avgSleep}ч</p>
                    <TrendArrow value={sleepTrend} />
                </div>
                <div className={`${GLASS_PANEL_LIGHT} p-3`}>
                    <p className="text-xs text-white/50 mb-1">Среднее настроение</p>
                    <p className="text-lg font-bold">{avgMood}/5</p>
                </div>
                <div className={`${GLASS_PANEL_LIGHT} p-3`}>
                    <p className="text-xs text-white/50 mb-1">Привычек выполнено</p>
                    <p className="text-lg font-bold">{totalHabits}</p>
                </div>
            </div>

            {bestDay && (
                <div className={`${GLASS_PANEL_LIGHT} p-3 flex items-center justify-between`}>
                    <div>
                        <p className="text-xs text-white/50">Лучший день</p>
                        <p className="font-semibold">{formatDate(bestDay.date)}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[#FFD700] text-lg">⭐</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// CSV Export utility
export const exportLogsToCSV = (logs: DailyLog[], filename: string = 'daily-discipline-export') => {
    const headers = ['Date', 'Mood', 'Energy', 'Steps', 'Sleep Hours', 'Active Minutes', 'Habits Completed', 'Total Habits', 'Day Closed'];

    const rows = logs.map(log => [
        log.date,
        log.checkIn?.mood || '',
        log.checkIn?.energy || '',
        log.metrics?.steps || '',
        log.metrics?.sleepHours || '',
        log.metrics?.activeMinutes || '',
        log.habits?.filter(h => h.completed).length || 0,
        log.habits?.length || 0,
        log.closed ? 'Yes' : 'No'
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default WeeklyReport;
