export interface NotificationScript {
    id: string;
    en: string;
    ru: string;
    type: 'morning' | 'stabilization' | 'restoration' | 'facilitator';
}

export const NOTIFICATIONS: NotificationScript[] = [
    // 1. Morning Priming (Motivation)
    {
        id: "MP_01",
        type: 'morning',
        en: "☀️ New day, fresh canvas. If you only accomplish ONE high-value task today, what would make you feel proud tonight?",
        ru: "☀️ Новый день, чистый холст. Если ты выполнишь всего ОДНУ ценную задачу сегодня, чем ты будешь гордиться вечером?"
    },
    {
        id: "MP_02",
        type: 'morning',
        en: "🌱 Your discipline tree is ready for sunlight. What is the smallest act of care you can give it this morning?",
        ru: "🌱 Твое дерево дисциплины ждет солнца. Какое самое маленькое действие ты можешь совершить для него этим утром?"
    },
    {
        id: "MP_03",
        type: 'morning',
        en: "⚡ Energy Check: Are you in 'Design Mode' or 'React Mode' today? Choose one intention to regain control.",
        ru: "⚡ Проверка энергии: Ты сегодня в 'Режиме Дизайна' или 'Режиме Реакции'? Выбери одно намерение, чтобы вернуть контроль."
    },

    // 2. Bad Habit Intervention (Stabilization)
    {
        id: "BH_01",
        type: 'stabilization',
        en: "⚠️ Stabilization Mode Active. Don't panic. Your limit has adapted to help you regain ground. Just focus on stopping here.",
        ru: "⚠️ Режим Стабилизации активен. Без паники. Лимит адаптировался, чтобы ты не сорвался. Просто остановись на этом."
    },
    {
        id: "BH_02",
        type: 'stabilization',
        en: "📉 High turbulence detected. Let's not crash. I've set a 'Safe Floor' for tomorrow. Breathe.",
        ru: "📉 Обнаружена турбулентность. Давай не разобьемся. Я установил 'Безопасный уровень' на завтра. Выдохни."
    },

    // 3. Restoration Update (Positive Reinforcement)
    {
        id: "RU_01",
        type: 'restoration',
        en: "🌳 Your Lungs Branch just leveled up! You are building a stronger version of yourself, active cell by cell.",
        ru: "🌳 Ветка 'Легкие' только что повысила уровень! Ты строишь сильную версию себя, клетка за клеткой."
    },
    {
        id: "RU_02",
        type: 'restoration',
        en: "✨ The roots are getting deeper. Maintenance is progress. Keep this streak protected.",
        ru: "✨ Корни становятся глубже. Удержание результата — это тоже прогресс. Защищай этот стрик."
    },

    // 4. Facilitator Prompts (Tiny Habits)
    {
        id: "FP_01",
        type: 'facilitator',
        en: "👟 Too tired to run? Just put on your shoes and stand outside for 1 minute. That counts.",
        ru: "👟 Слишком устал бежать? Просто надень кроссовки и выйди на улицу на 1 минуту. Это считается."
    },
    {
        id: "FP_02",
        type: 'facilitator',
        en: "💧 Glass empty? Just fill it up. You don't have to drink it yet (but you probably will).",
        ru: "💧 Стакан пуст? Просто налей воды. Пить не обязательно (но скорее всего ты выпьешь)."
    }
];

export const getRandomNotification = (type: NotificationScript['type']): NotificationScript => {
    const subset = NOTIFICATIONS.filter(n => n.type === type);
    return subset[Math.floor(Math.random() * subset.length)];
};
