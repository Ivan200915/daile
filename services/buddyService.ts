// AI Buddy Service
// Personalized AI companion for motivation and chat

export interface BuddyMessage {
    id: string;
    role: 'user' | 'buddy';
    content: string;
    timestamp: string;
}

export interface BuddyPersonality {
    name: string;
    emoji: string;
    style: 'coach' | 'friend' | 'mentor' | 'cheerleader';
    traits: string[];
}

// Buddy personalities
export const BUDDY_PERSONALITIES: BuddyPersonality[] = [
    {
        name: 'Коуч',
        emoji: '🏆',
        style: 'coach',
        traits: ['мотивирующий', 'требовательный', 'целеустремлённый']
    },
    {
        name: 'Друг',
        emoji: '🤗',
        style: 'friend',
        traits: ['добрый', 'понимающий', 'поддерживающий']
    },
    {
        name: 'Ментор',
        emoji: '🧙',
        style: 'mentor',
        traits: ['мудрый', 'глубокий', 'вдохновляющий']
    },
    {
        name: 'Болельщик',
        emoji: '🎉',
        style: 'cheerleader',
        traits: ['энергичный', 'весёлый', 'оптимистичный']
    }
];

// Storage
const BUDDY_STORAGE_KEY = 'dd_ai_buddy';
const BUDDY_CHAT_KEY = 'dd_buddy_chat';

export interface BuddyState {
    personality: BuddyPersonality;
    messagesCount: number;
    lastInteraction: string;
}

export const loadBuddyState = (): BuddyState | null => {
    const saved = localStorage.getItem(BUDDY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
};

export const saveBuddyState = (state: BuddyState): void => {
    localStorage.setItem(BUDDY_STORAGE_KEY, JSON.stringify(state));
};

export const loadChatHistory = (): BuddyMessage[] => {
    const saved = localStorage.getItem(BUDDY_CHAT_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveChatHistory = (messages: BuddyMessage[]): void => {
    // Keep only last 50 messages
    const toSave = messages.slice(-50);
    localStorage.setItem(BUDDY_CHAT_KEY, JSON.stringify(toSave));
};

// Initialize buddy with personality
export const initBuddy = (personality: BuddyPersonality): BuddyState => {
    const state: BuddyState = {
        personality,
        messagesCount: 0,
        lastInteraction: new Date().toISOString()
    };
    saveBuddyState(state);

    // Add welcome message
    const welcomeMessage: BuddyMessage = {
        id: `msg_${Date.now()}`,
        role: 'buddy',
        content: getWelcomeMessage(personality),
        timestamp: new Date().toISOString()
    };
    saveChatHistory([welcomeMessage]);

    return state;
};

// Get welcome message based on personality
const getWelcomeMessage = (personality: BuddyPersonality): string => {
    switch (personality.style) {
        case 'coach':
            return `${personality.emoji} Привет, чемпион! Я твой персональный коуч. Вместе мы достигнем твоих целей. Готов начать?`;
        case 'friend':
            return `${personality.emoji} Привет! Рад познакомиться! Я здесь, чтобы поддержать тебя на пути к лучшей версии себя. Как дела?`;
        case 'mentor':
            return `${personality.emoji} Приветствую тебя на пути самосовершенствования. Каждый шаг — это урок. Давай начнём это путешествие вместе.`;
        case 'cheerleader':
            return `${personality.emoji} Йоу! Это будет КРУТО! Я здесь, чтобы праздновать каждую твою победу! Погнали! 🚀`;
        default:
            return 'Привет! Я твой AI-помощник.';
    }
};

// Generate buddy response based on context
export const generateBuddyResponse = (
    userMessage: string,
    personality: BuddyPersonality,
    context: {
        streak: number;
        habitsToday: number;
        totalHabits: number;
        mood?: number;
    }
): string => {
    const lower = userMessage.toLowerCase();

    // Greeting responses
    if (lower.match(/привет|хай|здравствуй|добр/)) {
        return getGreeting(personality, context);
    }

    // Motivation request
    if (lower.match(/мотивац|вдохнов|помоги|трудно|сложно|устал/)) {
        return getMotivation(personality, context);
    }

    // Progress check
    if (lower.match(/как дела|прогресс|статус|успехи/)) {
        return getProgressFeedback(personality, context);
    }

    // Streak related
    if (lower.match(/стрик|streak|подряд|дней/)) {
        return getStreakMessage(personality, context);
    }

    // Habit help
    if (lower.match(/привычк|habit|забыл|пропустил/)) {
        return getHabitAdvice(personality, context);
    }

    // Default response
    return getDefaultResponse(personality);
};

const getGreeting = (p: BuddyPersonality, ctx: any): string => {
    const greetings = {
        coach: [`${p.emoji} Привет, атлет! Готов к новым свершениям?`, `${p.emoji} Чемпион на связи! Какие планы на сегодня?`],
        friend: [`${p.emoji} Привет! Рад тебя видеть! Как ты?`, `${p.emoji} Эй! Хорошего дня тебе! Чем помочь?`],
        mentor: [`${p.emoji} Приветствую. Каждый новый день — новая возможность.`, `${p.emoji} Добро пожаловать. Что на уме?`],
        cheerleader: [`${p.emoji} Йооо! Привееет! Как жизнь?! 🌟`, `${p.emoji} Эй-эй! Мой любимый человек тут! 🎉`]
    };
    const msgs = greetings[p.style];
    return msgs[Math.floor(Math.random() * msgs.length)];
};

const getMotivation = (p: BuddyPersonality, ctx: any): string => {
    const motivations = {
        coach: [
            `${p.emoji} Слушай, я верю в тебя. Ты уже ${ctx.streak} дней подряд держишься — это сила! Не сдавайся!`,
            `${p.emoji} Чемпионами не рождаются — ими становятся. Каждый день ты делаешь шаг вперёд. Продолжай!`
        ],
        friend: [
            `${p.emoji} Эй, я понимаю, бывает тяжело. Но ты справляешься! Я рядом 💪`,
            `${p.emoji} Знаешь что? Ты уже сделал больше, чем многие. Гордись собой!`
        ],
        mentor: [
            `${p.emoji} "Путь в тысячу миль начинается с одного шага." Ты уже идёшь. Не останавливайся.`,
            `${p.emoji} Трудности — это учителя. Каждое преодоление делает тебя сильнее.`
        ],
        cheerleader: [
            `${p.emoji} ТЫ МОЖЕШЬ! ТЫ СПРАВИШЬСЯ! Я в тебя верю на 1000%! 🔥🔥🔥`,
            `${p.emoji} Давай-давай-давай! Ты звезда! 🌟 Покажи всем, на что способен!`
        ]
    };
    const msgs = motivations[p.style];
    return msgs[Math.floor(Math.random() * msgs.length)];
};

const getProgressFeedback = (p: BuddyPersonality, ctx: any): string => {
    const rate = ctx.totalHabits > 0 ? Math.round((ctx.habitsToday / ctx.totalHabits) * 100) : 0;

    if (rate >= 100) {
        return `${p.emoji} ВАУ! 100% выполнено! Ты легенда! 🏆`;
    } else if (rate >= 70) {
        return `${p.emoji} Отлично! ${rate}% привычек сделано. Осталось чуть-чуть!`;
    } else if (rate >= 40) {
        return `${p.emoji} Хороший прогресс! ${rate}% готово. Продолжай в том же духе!`;
    } else {
        return `${p.emoji} Сейчас ${rate}%. Давай добавим ещё пару привычек! Ты можешь!`;
    }
};

const getStreakMessage = (p: BuddyPersonality, ctx: any): string => {
    if (ctx.streak >= 30) {
        return `${p.emoji} ${ctx.streak} дней подряд! Это НЕВЕРОЯТНО! Ты железный человек! 🦾`;
    } else if (ctx.streak >= 7) {
        return `${p.emoji} ${ctx.streak} дней! Целая неделя позади! Так держать! 💪`;
    } else if (ctx.streak > 0) {
        return `${p.emoji} ${ctx.streak} дней стрика! Каждый день на счету. Не останавливайся!`;
    } else {
        return `${p.emoji} Начнём новый стрик сегодня? Первый шаг — самый важный!`;
    }
};

const getHabitAdvice = (p: BuddyPersonality, ctx: any): string => {
    const advices = [
        `${p.emoji} Совет: привяжи новую привычку к существующей. Например, "после чистки зубов — 5 минут медитации".`,
        `${p.emoji} Начни с малого! Лучше 5 минут, чем ничего. Постепенно увеличишь.`,
        `${p.emoji} Не вини себя за пропуски. Важно вернуться на следующий день!`
    ];
    return advices[Math.floor(Math.random() * advices.length)];
};

const getDefaultResponse = (p: BuddyPersonality): string => {
    const defaults = {
        coach: `${p.emoji} Интересно! Расскажи больше. Как я могу помочь тебе достичь цели?`,
        friend: `${p.emoji} Понимаю! Я всегда рядом, если что нужно. 😊`,
        mentor: `${p.emoji} Задумайся над этим глубже. Что ты чувствуешь?`,
        cheerleader: `${p.emoji} Круто! Ты на правильном пути! Рассказывай ещё! 🎯`
    };
    return defaults[p.style];
};

// Add user message and get response
export const chat = (
    userMessage: string,
    context: { streak: number; habitsToday: number; totalHabits: number; mood?: number }
): BuddyMessage => {
    const state = loadBuddyState();
    if (!state) {
        throw new Error('Buddy not initialized');
    }

    const history = loadChatHistory();

    // Add user message
    const userMsg: BuddyMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
    };
    history.push(userMsg);

    // Generate response
    const response = generateBuddyResponse(userMessage, state.personality, context);
    const buddyMsg: BuddyMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'buddy',
        content: response,
        timestamp: new Date().toISOString()
    };
    history.push(buddyMsg);

    // Update state
    state.messagesCount++;
    state.lastInteraction = new Date().toISOString();
    saveBuddyState(state);
    saveChatHistory(history);

    return buddyMsg;
};
