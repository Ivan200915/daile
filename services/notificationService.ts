// Telegram Notification Service
// Sends habit reminders and daily summaries via Telegram Bot API

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Send a message to a user via Telegram
export const sendTelegramMessage = async (chatId: number | string, message: string): Promise<boolean> => {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Telegram send error:', error);
        return false;
    }
};

// Habit reminder messages
const REMINDER_MESSAGES = {
    morning: [
        "🌅 Доброе утро! Готов начать день с правильных привычек?",
        "☀️ Новый день — новые возможности! Открой Daily Discipline",
        "🏋️ Время для утренней рутины! Начни с первой привычки"
    ],
    afternoon: [
        "⏰ Не забудь про дневные привычки!",
        "💪 Половина дня позади. Как успехи с привычками?",
        "🎯 Напоминание: проверь свой прогресс в Daily Discipline"
    ],
    evening: [
        "🌙 Пора закрыть день! Отметь выполненные привычки",
        "✨ Вечерняя проверка: все привычки на месте?",
        "📊 Не забудь закрыть день в Daily Discipline!"
    ]
};

export const getRandomReminder = (timeOfDay: 'morning' | 'afternoon' | 'evening'): string => {
    const messages = REMINDER_MESSAGES[timeOfDay];
    return messages[Math.floor(Math.random() * messages.length)];
};

// Schedule types for notifications
export interface NotificationSettings {
    enabled: boolean;
    morningReminder: boolean;  // 9:00
    afternoonReminder: boolean; // 14:00
    eveningReminder: boolean;   // 21:00
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    enabled: true,
    morningReminder: true,
    afternoonReminder: false,
    eveningReminder: true
};

// Save notification settings
export const saveNotificationSettings = (settings: NotificationSettings) => {
    localStorage.setItem('dd_notification_settings', JSON.stringify(settings));
};

export const loadNotificationSettings = (): NotificationSettings => {
    const saved = localStorage.getItem('dd_notification_settings');
    if (saved) {
        return JSON.parse(saved);
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
};
