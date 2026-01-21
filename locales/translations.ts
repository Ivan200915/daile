// Localization - Translations for all supported languages

export type Language = 'en' | 'ru';

export interface Translations {
    // Common
    common: {
        save: string;
        cancel: string;
        next: string;
        done: string;
        close: string;
        add: string;
        delete: string;
        disconnect: string;
        upgrade: string;
    };

    // Onboarding
    onboarding: {
        welcome: string;
        welcomeSubtitle: string;
        start: string;
        chooseGoal: string;
        goals: {
            weightLoss: string;
            moreEnergy: string;
            buildDiscipline: string;
            improveHealth: string;
        };
        pickHabits: string;
        pickHabitsHint: string;
        yourStats: string;
        height: string;
        weight: string;
        skip: string;
        connectHealth: string;
        connectHealthSubtitle: string;
        connectFinish: string;
    };

    // Dashboard
    dashboard: {
        greeting: string;
        meals: string;
        logMeal: string;
        habits: string;
        closeDay: string;
        steps: string;
        sleep: string;
        active: string;
        dayStreak: string;
    };

    // Add Meal
    addMeal: {
        title: string;
        takePhoto: string;
        gallery: string;
        analyzing: string;
        macros: string;
        calories: string;
        protein: string;
        fat: string;
        carbs: string;
        portionSize: string;
        small: string;
        medium: string;
        large: string;
        saveMeal: string;
        types: {
            breakfast: string;
            lunch: string;
            dinner: string;
            snack: string;
        };
    };

    // Check-in
    checkIn: {
        howWasYourDay: string;
        energyLevel: string;
        low: string;
        high: string;
        whatHelped: string;
        tags: {
            goodSleep: string;
            workout: string;
            healthyFood: string;
            meditation: string;
            walking: string;
        };
        dayClosed: string;
        seeYouTomorrow: string;
        dailyInsight: string;
        generatingInsight: string;
    };

    // History
    history: {
        title: string;
        calendar: string;
        stats: string;
        aiCoach: string;
        activity: string;
        lastDays: string;
        less: string;
        more: string;
        current: string;
        longest: string;
        freezes: string;
        freezesHint: string;
        thisWeek: string;
        daysCompleted: string;
        mealsLogged: string;
        avgSteps: string;
        avgSleep: string;
        completionRate: string;
        weeklyAICoach: string;
        weeklyAICoachDesc: string;
        generateReview: string;
        recentInsights: string;
    };

    // Weekly Review
    weeklyReview: {
        title: string;
        insights: string;
        recommendation: string;
        gotIt: string;
    };

    // Settings
    settings: {
        title: string;
        connectedDevices: string;
        connectFitness: string;
        syncsAuto: string;
        dailyGoals: string;
        caloriesGoal: string;
        proteinGoal: string;
        saveGoals: string;
        subscription: string;
        freePlan: string;
        freeFeatures: string;
        yourGoal: string;
        dangerZone: string;
        resetAllData: string;
        resetConfirm: string;
        language: string;
    };

    // Streak Messages
    streakMessages: {
        incredible: string;
        aboveAverage: string;
        goodStart: string;
        keepGoing: string;
        freezeAvailable: string;
        freshStart: string;
    };
}

export const translations: Record<Language, Translations> = {
    en: {
        common: {
            save: 'Save',
            cancel: 'Cancel',
            next: 'Next',
            done: 'Done',
            close: 'Close',
            add: 'Add',
            delete: 'Delete',
            disconnect: 'Disconnect',
            upgrade: 'Upgrade',
        },
        onboarding: {
            welcome: 'Daily Discipline',
            welcomeSubtitle: 'Build lasting habits, one day at a time',
            start: 'Start',
            chooseGoal: 'Choose your goal',
            goals: {
                weightLoss: 'Lose Weight',
                moreEnergy: 'More Energy',
                buildDiscipline: 'Build Discipline',
                improveHealth: 'Improve Health',
            },
            pickHabits: 'Pick your habits',
            pickHabitsHint: 'Select 3-5 habits to track',
            yourStats: 'Your Stats',
            height: 'Height (cm)',
            weight: 'Weight (kg)',
            skip: 'Skip',
            connectHealth: 'Connect Health',
            connectHealthSubtitle: 'Sync your steps, sleep, and activity',
            connectFinish: 'Connect & Finish',
        },
        dashboard: {
            greeting: 'Hello',
            meals: 'Meals',
            logMeal: 'Log Meal',
            habits: 'Habits',
            closeDay: 'Close Day',
            steps: 'Steps',
            sleep: 'Sleep',
            active: 'Active',
            dayStreak: 'day streak',
        },
        addMeal: {
            title: 'Add Meal',
            takePhoto: 'Take Photo',
            gallery: 'Gallery',
            analyzing: 'Analyzing...',
            macros: 'Macros',
            calories: 'Calories',
            protein: 'Protein',
            fat: 'Fat',
            carbs: 'Carbs',
            portionSize: 'Portion Size',
            small: 'Small',
            medium: 'Medium',
            large: 'Large',
            saveMeal: 'Save Meal',
            types: {
                breakfast: 'Breakfast',
                lunch: 'Lunch',
                dinner: 'Dinner',
                snack: 'Snack',
            },
        },
        checkIn: {
            howWasYourDay: 'How was your day?',
            energyLevel: 'Energy Level?',
            low: 'Low',
            high: 'High',
            whatHelped: 'What helped today?',
            tags: {
                goodSleep: 'Good Sleep',
                workout: 'Workout',
                healthyFood: 'Healthy Food',
                meditation: 'Meditation',
                walking: 'Walking',
            },
            dayClosed: 'Day Closed!',
            seeYouTomorrow: 'See you tomorrow.',
            dailyInsight: 'Daily Insight',
            generatingInsight: 'Generating insight...',
        },
        history: {
            title: 'History',
            calendar: 'Calendar',
            stats: 'Stats',
            aiCoach: '🤖 Coach',
            activity: 'Activity',
            lastDays: 'Last 35 days',
            less: 'Less',
            more: 'More',
            current: 'Current',
            longest: 'Longest',
            freezes: 'Freezes',
            freezesHint: 'Freezes protect your streak when you miss a day',
            thisWeek: 'This Week',
            daysCompleted: 'Days Completed',
            mealsLogged: 'Meals Logged',
            avgSteps: 'Avg Steps',
            avgSleep: 'Avg Sleep',
            completionRate: 'Completion Rate',
            weeklyAICoach: 'Weekly AI Coach',
            weeklyAICoachDesc: 'Get personalized insights and recommendations based on your week\'s data',
            generateReview: 'Generate Weekly Review',
            recentInsights: 'Recent Insights',
        },
        weeklyReview: {
            title: 'Weekly Review',
            insights: 'Insights',
            recommendation: 'Recommendation',
            gotIt: 'Got it!',
        },
        settings: {
            title: 'Settings',
            connectedDevices: 'Connected Devices',
            connectFitness: 'Connect Fitness Tracker',
            syncsAuto: 'Syncs steps, sleep, and activity automatically',
            dailyGoals: 'Daily Goals',
            caloriesGoal: 'Calories',
            proteinGoal: 'Protein (g)',
            saveGoals: 'Save Goals',
            subscription: 'Subscription',
            freePlan: 'Free Plan',
            freeFeatures: '3 days history • Basic tracking',
            yourGoal: 'Your Goal',
            dangerZone: 'Danger Zone',
            resetAllData: 'Reset All Data',
            resetConfirm: 'Are you sure? This will delete all your data.',
            language: 'Language',
        },
        streakMessages: {
            incredible: "🔥 Incredible week! You're on fire!",
            aboveAverage: "💪 {days}/7 days — that's above average!",
            goodStart: '👍 Good start! Each day counts.',
            keepGoing: '🌱 Building momentum, keep going!',
            freezeAvailable: '🌱 Keep going! ❄️ {count} freeze(s) available',
            freshStart: '✨ New week, fresh start!',
        },
    },

    ru: {
        common: {
            save: 'Сохранить',
            cancel: 'Отмена',
            next: 'Далее',
            done: 'Готово',
            close: 'Закрыть',
            add: 'Добавить',
            delete: 'Удалить',
            disconnect: 'Отключить',
            upgrade: 'Улучшить',
        },
        onboarding: {
            welcome: 'Daily Discipline',
            welcomeSubtitle: 'Формируй привычки день за днём',
            start: 'Начать',
            chooseGoal: 'Выбери цель',
            goals: {
                weightLoss: 'Похудеть',
                moreEnergy: 'Больше энергии',
                buildDiscipline: 'Развить дисциплину',
                improveHealth: 'Улучшить здоровье',
            },
            pickHabits: 'Выбери привычки',
            pickHabitsHint: 'Выбери 3-5 привычек для отслеживания',
            yourStats: 'Твои данные',
            height: 'Рост (см)',
            weight: 'Вес (кг)',
            skip: 'Пропустить',
            connectHealth: 'Подключить здоровье',
            connectHealthSubtitle: 'Синхронизируй шаги, сон и активность',
            connectFinish: 'Подключить и завершить',
        },
        dashboard: {
            greeting: 'Привет',
            meals: 'Приёмы пищи',
            logMeal: 'Добавить еду',
            habits: 'Привычки',
            closeDay: 'Закрыть день',
            steps: 'Шаги',
            sleep: 'Сон',
            active: 'Активность',
            dayStreak: 'дней подряд',
        },
        addMeal: {
            title: 'Добавить еду',
            takePhoto: 'Сделать фото',
            gallery: 'Галерея',
            analyzing: 'Анализируем...',
            macros: 'Нутриенты',
            calories: 'Калории',
            protein: 'Белок',
            fat: 'Жиры',
            carbs: 'Углеводы',
            portionSize: 'Размер порции',
            small: 'Маленькая',
            medium: 'Средняя',
            large: 'Большая',
            saveMeal: 'Сохранить',
            types: {
                breakfast: 'Завтрак',
                lunch: 'Обед',
                dinner: 'Ужин',
                snack: 'Перекус',
            },
        },
        checkIn: {
            howWasYourDay: 'Как прошёл день?',
            energyLevel: 'Уровень энергии?',
            low: 'Низко',
            high: 'Высоко',
            whatHelped: 'Что помогло сегодня?',
            tags: {
                goodSleep: 'Хороший сон',
                workout: 'Тренировка',
                healthyFood: 'Здоровая еда',
                meditation: 'Медитация',
                walking: 'Прогулка',
            },
            dayClosed: 'День закрыт!',
            seeYouTomorrow: 'Увидимся завтра.',
            dailyInsight: 'Инсайт дня',
            generatingInsight: 'Генерируем инсайт...',
        },
        history: {
            title: 'История',
            calendar: 'Календарь',
            stats: 'Статистика',
            aiCoach: '🤖 Коуч',
            activity: 'Активность',
            lastDays: 'Последние 35 дней',
            less: 'Меньше',
            more: 'Больше',
            current: 'Текущая',
            longest: 'Лучшая',
            freezes: 'Заморозки',
            freezesHint: 'Заморозки защищают серию при пропуске дня',
            thisWeek: 'Эта неделя',
            daysCompleted: 'Дней закрыто',
            mealsLogged: 'Приёмов пищи',
            avgSteps: 'Средние шаги',
            avgSleep: 'Средний сон',
            completionRate: 'Выполнение',
            weeklyAICoach: 'Недельный AI-коуч',
            weeklyAICoachDesc: 'Персональные инсайты и рекомендации на основе твоих данных',
            generateReview: 'Сгенерировать обзор',
            recentInsights: 'Последние инсайты',
        },
        weeklyReview: {
            title: 'Недельный обзор',
            insights: 'Инсайты',
            recommendation: 'Рекомендация',
            gotIt: 'Понятно!',
        },
        settings: {
            title: 'Настройки',
            connectedDevices: 'Подключённые устройства',
            connectFitness: 'Подключить фитнес-трекер',
            syncsAuto: 'Синхронизирует шаги, сон и активность',
            dailyGoals: 'Дневные цели',
            caloriesGoal: 'Калории',
            proteinGoal: 'Белок (г)',
            saveGoals: 'Сохранить цели',
            subscription: 'Подписка',
            freePlan: 'Бесплатный план',
            freeFeatures: 'История 3 дня • Базовый трекинг',
            yourGoal: 'Твоя цель',
            dangerZone: 'Опасная зона',
            resetAllData: 'Сбросить все данные',
            resetConfirm: 'Уверен? Это удалит все твои данные.',
            language: 'Язык',
        },
        streakMessages: {
            incredible: '🔥 Невероятная неделя! Ты в огне!',
            aboveAverage: '💪 {days}/7 дней — это выше среднего!',
            goodStart: '👍 Хорошее начало! Каждый день важен.',
            keepGoing: '🌱 Набираем обороты, продолжай!',
            freezeAvailable: '🌱 Продолжай! ❄️ {count} заморозок доступно',
            freshStart: '✨ Новая неделя, новый старт!',
        },
    },
};
