import { DailyLog } from '../types';

export const exportLogsToCSV = (logs: DailyLog[]) => {
    if (!logs || logs.length === 0) return;

    const headers = ['Date', 'Steps', 'Sleep', 'Active Minutes', 'Mood', 'Energy', 'Meals', 'Habits Completed'];
    const rows = logs.map(log => {
        const habits = log.habits?.filter(h => h.completed).length || 0;
        const meals = log.meals?.length || 0;
        return [
            log.date,
            log.metrics?.steps || 0,
            log.metrics?.sleepHours || 0,
            log.metrics?.activeMinutes || 0,
            log.checkIn?.mood || '',
            log.checkIn?.energy || '',
            meals,
            habits
        ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily_discipline_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
