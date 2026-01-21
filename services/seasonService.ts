// Seasons Service
// Time-limited seasonal challenges with exclusive rewards

export interface Season {
    id: string;
    name: string;
    nameRu: string;
    theme: string;
    emoji: string;
    startDate: string; // ISO date
    endDate: string;
    challenges: SeasonChallenge[];
    rewards: SeasonReward[];
}

export interface SeasonChallenge {
    id: string;
    name: string;
    nameRu: string;
    description: string;
    descriptionRu: string;
    target: number;
    type: 'habits' | 'streak' | 'meals' | 'days_closed' | 'xp';
    xpReward: number;
}

export interface SeasonReward {
    id: string;
    name: string;
    nameRu: string;
    type: 'badge' | 'theme' | 'pet_outfit' | 'title';
    icon: string;
    unlockAt: number; // Points needed
}

export interface SeasonProgress {
    seasonId: string;
    points: number;
    completedChallenges: string[];
    unlockedRewards: string[];
    lastUpdated: string;
}

// Current active season
export const CURRENT_SEASON: Season = {
    id: 'winter_2024',
    name: 'Winter Championship',
    nameRu: 'Зимний чемпионат',
    theme: 'winter',
    emoji: '❄️',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    challenges: [
        {
            id: 'w_streak_7',
            name: '7-Day Warrior',
            nameRu: 'Неделя дисциплины',
            description: 'Maintain a 7-day streak',
            descriptionRu: 'Достигни стрика в 7 дней',
            target: 7,
            type: 'streak',
            xpReward: 200
        },
        {
            id: 'w_habits_50',
            name: 'Habit Master',
            nameRu: 'Мастер привычек',
            description: 'Complete 50 habits',
            descriptionRu: 'Выполни 50 привычек',
            target: 50,
            type: 'habits',
            xpReward: 300
        },
        {
            id: 'w_meals_30',
            name: 'Nutrition Tracker',
            nameRu: 'Трекер питания',
            description: 'Log 30 meals',
            descriptionRu: 'Залогируй 30 приёмов пищи',
            target: 30,
            type: 'meals',
            xpReward: 150
        },
        {
            id: 'w_days_14',
            name: 'Two Weeks Strong',
            nameRu: 'Две недели силы',
            description: 'Close 14 days',
            descriptionRu: 'Закрой 14 дней',
            target: 14,
            type: 'days_closed',
            xpReward: 250
        },
        {
            id: 'w_xp_1000',
            name: 'XP Hunter',
            nameRu: 'Охотник за XP',
            description: 'Earn 1000 XP this season',
            descriptionRu: 'Заработай 1000 XP за сезон',
            target: 1000,
            type: 'xp',
            xpReward: 500
        }
    ],
    rewards: [
        { id: 'badge_winter', name: 'Winter Warrior', nameRu: 'Зимний воин', type: 'badge', icon: '🏔️', unlockAt: 100 },
        { id: 'theme_snow', name: 'Snowfall Theme', nameRu: 'Тема «Снегопад»', type: 'theme', icon: '❄️', unlockAt: 300 },
        { id: 'pet_scarf', name: 'Pet Scarf', nameRu: 'Шарф для питомца', type: 'pet_outfit', icon: '🧣', unlockAt: 500 },
        { id: 'title_champion', name: 'Winter Champion', nameRu: 'Зимний чемпион', type: 'title', icon: '🏆', unlockAt: 1000 }
    ]
};

// Storage
const SEASON_STORAGE_KEY = 'dd_season_progress';

export const loadSeasonProgress = (): SeasonProgress | null => {
    const saved = localStorage.getItem(SEASON_STORAGE_KEY);
    if (!saved) return null;

    const progress = JSON.parse(saved);

    // If different season, reset progress
    if (progress.seasonId !== CURRENT_SEASON.id) {
        return null;
    }

    return progress;
};

export const saveSeasonProgress = (progress: SeasonProgress): void => {
    localStorage.setItem(SEASON_STORAGE_KEY, JSON.stringify({
        ...progress,
        lastUpdated: new Date().toISOString()
    }));
};

export const initSeasonProgress = (): SeasonProgress => {
    const progress: SeasonProgress = {
        seasonId: CURRENT_SEASON.id,
        points: 0,
        completedChallenges: [],
        unlockedRewards: [],
        lastUpdated: new Date().toISOString()
    };
    saveSeasonProgress(progress);
    return progress;
};

// Add points and check for new rewards
export const addSeasonPoints = (points: number): { progress: SeasonProgress; newRewards: SeasonReward[] } => {
    let progress = loadSeasonProgress() || initSeasonProgress();

    progress.points += points;

    const newRewards: SeasonReward[] = [];

    // Check for new unlocked rewards
    for (const reward of CURRENT_SEASON.rewards) {
        if (progress.points >= reward.unlockAt && !progress.unlockedRewards.includes(reward.id)) {
            progress.unlockedRewards.push(reward.id);
            newRewards.push(reward);
        }
    }

    saveSeasonProgress(progress);
    return { progress, newRewards };
};

// Check challenge completion
export const checkSeasonChallenges = (stats: {
    currentStreak: number;
    totalHabits: number;
    totalMeals: number;
    closedDays: number;
    seasonXp: number;
}): { completed: SeasonChallenge[]; points: number } => {
    let progress = loadSeasonProgress() || initSeasonProgress();

    const completed: SeasonChallenge[] = [];
    let points = 0;

    for (const challenge of CURRENT_SEASON.challenges) {
        if (progress.completedChallenges.includes(challenge.id)) continue;

        let value = 0;
        switch (challenge.type) {
            case 'streak': value = stats.currentStreak; break;
            case 'habits': value = stats.totalHabits; break;
            case 'meals': value = stats.totalMeals; break;
            case 'days_closed': value = stats.closedDays; break;
            case 'xp': value = stats.seasonXp; break;
        }

        if (value >= challenge.target) {
            progress.completedChallenges.push(challenge.id);
            completed.push(challenge);
            points += challenge.xpReward;
        }
    }

    if (points > 0) {
        progress.points += points;
        saveSeasonProgress(progress);
    }

    return { completed, points };
};

// Get days remaining in season
export const getSeasonDaysRemaining = (): number => {
    const end = new Date(CURRENT_SEASON.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
};
