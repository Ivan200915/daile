import { Challenge, UserSettings } from '../types';

const CHALLENGES_DB: Omit<Challenge, 'id' | 'completed'>[] = [
    { title: 'Hydration Hero', description: 'Drink 2L of water', xp: 50, type: 'water', target: 2000 },
    { title: 'Step Master', description: 'Walk 5,000 steps', xp: 100, type: 'steps', target: 5000 },
    { title: 'Zen Mode', description: 'Meditate for 10 minutes', xp: 75, type: 'mindfulness', target: 10 },
    { title: 'No Sugar', description: 'Avoid sugary snacks all day', xp: 150, type: 'nutrition' } as any,
    { title: 'Cold Shower', description: 'Take a 3-minute cold shower', xp: 120, type: 'health' } as any,
    { title: 'Read a Book', description: 'Read 10 pages', xp: 60, type: 'mindfulness' } as any,
    { title: 'Push-up Pro', description: 'Do 50 push-ups total', xp: 80, type: 'workout', target: 50 },
    { title: 'Digital Detox', description: 'No phone 1h before bed', xp: 100, type: 'health' } as any,
];

// Key for local storage
const CHALLENGE_KEY = 'daily_challenges';
const CHALLENGE_DATE_KEY = 'daily_challenges_date';

export const getDailyChallenges = (userGoal?: string): Challenge[] => {
    const todayStr = new Date().toDateString();
    const storedDate = localStorage.getItem(CHALLENGE_DATE_KEY);
    const storedChallenges = localStorage.getItem(CHALLENGE_KEY);

    // Return stored if valid and from today
    if (storedDate === todayStr && storedChallenges) {
        return JSON.parse(storedChallenges);
    }

    // Generate new challenges
    const shuffled = [...CHALLENGES_DB].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((c, i) => ({
        ...c,
        id: `challenge-${Date.now()}-${i}`,
        completed: false
    }));

    // Save
    localStorage.setItem(CHALLENGE_DATE_KEY, todayStr);
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(selected));

    return selected;
};

export const completeChallenge = (id: string): Challenge[] => {
    const stored = localStorage.getItem(CHALLENGE_KEY);
    if (!stored) return [];

    const challenges: Challenge[] = JSON.parse(stored);
    const updated = challenges.map(c =>
        c.id === id ? { ...c, completed: true } : c
    );

    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(updated));
    return updated;
};
