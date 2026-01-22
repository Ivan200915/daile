// Share Cards Service
// Generate viral share cards (like umax.app style)

export type ShareCardType = 'streak' | 'achievement' | 'weekly' | 'progress' | 'perfect_day';

export interface ShareCardData {
    type: ShareCardType;
    title: string;
    titleRu: string;
    stats: {
        primary: { value: string; label: string; labelRu: string };
        secondary?: { value: string; label: string; labelRu: string }[];
    };
    imageUri?: string; // For progress cards
    beforeImageUri?: string;
    afterImageUri?: string;
    gradient: [string, string]; // Brand gradient colors
    emoji: string;
}

// Generate share card data
export const generateStreakCard = (streak: number, longestStreak: number): ShareCardData => {
    return {
        type: 'streak',
        title: `${streak}-Day Streak!`,
        titleRu: `Стрик ${streak} дней!`,
        stats: {
            primary: { value: `${streak}`, label: 'Days', labelRu: 'Дней подряд' },
            secondary: [
                { value: `${longestStreak}`, label: 'Best streak', labelRu: 'Лучший стрик' }
            ]
        },
        gradient: ['#FF6B6B', '#FF8E53'],
        emoji: '🔥'
    };
};

export const generateAchievementCard = (
    achievementName: string,
    achievementNameRu: string,
    achievementIcon: string,
    xpEarned: number
): ShareCardData => {
    return {
        type: 'achievement',
        title: `Achievement Unlocked!`,
        titleRu: `Достижение разблокировано!`,
        stats: {
            primary: { value: achievementNameRu, label: achievementName, labelRu: achievementNameRu },
            secondary: [
                { value: `+${xpEarned}`, label: 'XP', labelRu: 'XP' }
            ]
        },
        gradient: ['#FFD700', '#FFA500'],
        emoji: achievementIcon
    };
};

export const generateWeeklySummaryCard = (
    daysCompleted: number,
    habitsCompleted: number,
    totalHabits: number
): ShareCardData => {
    const completionRate = totalHabits > 0 ? Math.round((habitsCompleted / totalHabits) * 100) : 0;

    return {
        type: 'weekly',
        title: 'Weekly Summary',
        titleRu: 'Итоги недели',
        stats: {
            primary: { value: `${completionRate}%`, label: 'Completion', labelRu: 'Выполнено' },
            secondary: [
                { value: `${daysCompleted}/7`, label: 'Days', labelRu: 'Дней' },
                { value: `${habitsCompleted}`, label: 'Habits', labelRu: 'Привычек' }
            ]
        },
        gradient: ['#00D4AA', '#00A896'],
        emoji: '📊'
    };
};

export const generateProgressCard = (
    beforeImageUri: string,
    afterImageUri: string,
    days: number,
    weightChange?: number
): ShareCardData => {
    return {
        type: 'progress',
        title: `${days}-Day Transformation`,
        titleRu: `Трансформация за ${days} дней`,
        stats: {
            primary: { value: `${days}`, label: 'Days', labelRu: 'Дней' },
            secondary: weightChange ? [
                { value: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg`, label: 'Change', labelRu: 'Изменение' }
            ] : []
        },
        beforeImageUri,
        afterImageUri,
        gradient: ['#667eea', '#764ba2'],
        emoji: '💪'
    };
};

export const generatePerfectDayCard = (habits: string[]): ShareCardData => {
    return {
        type: 'perfect_day',
        title: '100% Perfect Day!',
        titleRu: 'Идеальный день!',
        stats: {
            primary: { value: `${habits.length}`, label: 'Habits completed', labelRu: 'Привычек выполнено' },
            secondary: []
        },
        gradient: ['#11998e', '#38ef7d'],
        emoji: '✅'
    };
};

// Generate canvas image from card data
export const generateShareCardImage = async (
    cardData: ShareCardData,
    width: number = 1080,
    height: number = 1920
): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, cardData.gradient[0]);
        gradient.addColorStop(1, cardData.gradient[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Dark overlay for text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);

        // Emoji at top
        ctx.font = 'bold 180px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cardData.emoji, width / 2, 350);

        // Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px Inter, sans-serif';
        ctx.fillText(cardData.titleRu, width / 2, 550);

        // Primary stat
        ctx.font = 'bold 200px Inter, sans-serif';
        ctx.fillText(cardData.stats.primary.value, width / 2, 850);

        ctx.font = '50px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(cardData.stats.primary.labelRu, width / 2, 940);

        // Secondary stats
        if (cardData.stats.secondary && cardData.stats.secondary.length > 0) {
            const startY = 1100;
            const spacing = 120;

            cardData.stats.secondary.forEach((stat, i) => {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 60px Inter, sans-serif';
                ctx.fillText(stat.value, width / 2, startY + i * spacing);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '40px Inter, sans-serif';
                ctx.fillText(stat.labelRu, width / 2, startY + i * spacing + 50);
            });
        }

        // Branding at bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 40px Inter, sans-serif';
        ctx.fillText('Daily Discipline', width / 2, height - 100);

        // Convert to base64
        resolve(canvas.toDataURL('image/png'));
    });
};

// Share to Telegram
export const shareToTelegram = (imageUri: string, text: string) => {
    // Use Telegram WebApp API if available
    if (window.Telegram?.WebApp) {
        // Telegram Mini App share
        window.Telegram.WebApp.shareToStory(imageUri, {
            text,
            widget_link: {
                url: 'https://t.me/DailyDisciplin_bot/app',
                name: 'Open Daily Discipline'
            }
        });
    } else {
        // Fallback: download image
        const link = document.createElement('a');
        link.href = imageUri;
        link.download = 'daily-discipline-card.png';
        link.click();
    }
};
