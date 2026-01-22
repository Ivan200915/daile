// AI Coach Service - Mock context-aware advice

import { DailyLog, StreakData, Habit } from '../types';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    isTyping?: boolean;
}

const COACH_PERSONA = `
You are the Daily Discipline Coach. Your style is tough but fair, like a Navy SEAL instructor combined with a stoic philosopher.
- Be concise. No fluff.
- Focus on action.
- Use data provided in the context.
- If the user is doing well, acknowledge it briefly but push for more.
- If the user is slacking, call them out directly but offer a way to fix it.
`;

const GREETINGS = {
    morning: [
        "Rise and grind. What's the plan?",
        "New day. Zero excuses. Use it.",
        "Morning. Time to execute.",
        "Don't let this day go to waste. Report in."
    ],
    evening: [
        "Review time. Did you execute?",
        "Day's ending. Did you win it?",
        "Wrap it up. Show me the logs.",
        "No lies. How did today go?"
    ],
    general: [
        "Back again? Good. Let's see what you've done.",
        "Discipline equals freedom. How are we looking?",
        "Report in. What's the status?",
        "No excuses today. What have you accomplished?"
    ]
};

export const getInitialGreeting = (): string => {
    const hour = new Date().getHours();
    let list = GREETINGS.general;

    if (hour >= 5 && hour < 12) list = GREETINGS.morning;
    if (hour >= 20 || hour < 5) list = GREETINGS.evening;

    return list[Math.floor(Math.random() * list.length)];
};

export const getRecommendedQuestions = (logs: DailyLog[]): string[] => {
    const today = logs[logs.length - 1];
    const questions = [
        "Evaluate my progress",
        "How to improve sleep?",
        "I lack motivation"
    ];

    if (today) {
        if (today.metrics.sleepHours < 7) questions.push("Why am I tired?");
        if (today.checkIn && today.checkIn.mood < 3) questions.push("Why is my mood low?");
    }

    return questions;
};

// Mock AI response generation
export const generateCoachResponse = async (
    message: string,
    history: ChatMessage[],
    context: {
        logs: DailyLog[];
        streak: StreakData;
    }
): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMsg = message.toLowerCase();
    const today = context.logs[context.logs.length - 1];

    // 1. Analyze Context
    const incompleteHabits = today?.habits.filter(h => !h.completed).map(h => h.label) || [];
    const completedCount = today?.habits.filter(h => h.completed).length || 0;
    const sleep = today?.metrics.sleepHours || 0;
    const mood = today?.checkIn?.mood || 0;
    const streak = context.streak.currentStreak;

    // KEYWORD LOGIC

    // PROGRESS / EVALUATION
    if (lowerMsg.includes('progress') || lowerMsg.includes('evaluate') || lowerMsg.includes('status')) {
        // Zero Streak / Low Streak
        if (streak < 3) {
            if (incompleteHabits.length > 0) {
                return `You're fragile right now. Only ${streak} days? And today you still haven't done: ${incompleteHabits.join(', ')}. Go do one. Now.`;
            }
            return `You're starting over. Day ${streak}. Don't celebrate. Head down, keep working.`;
        }
        // High Streak
        else if (streak > 7) {
            if (incompleteHabits.length === 0) {
                return `You're a machine. ${streak} days in a row. Today is cleared. Rest, then do it again tomorrow.`;
            }
            return `Solid momentum (${streak} days), but today isn't done. Finish ${incompleteHabits[0]} to keep the chain alive.`;
        }
        return `You're consistent. ${streak} days. Keep pushing.`;
    }

    // SLEEP / FATIGUE
    if (lowerMsg.includes('sleep') || lowerMsg.includes('tired')) {
        if (sleep < 6) {
            return `You slept ${sleep} hours. No wonder you're weak today. Your mood is likely crashing (${mood}/5). Go to bed at 10 PM. No phone.`;
        }
        if (sleep > 8 && mood < 3) {
            return `You slept enough (${sleep}h), but you're still sluggish. It's likely hidden sugar or lack of movement. Go for a walk.`;
        }
        return "Sleep performance looks average. To optimize: 1) No light 1h before bed. 2) Cold room. 3) Magnesium.";
    }

    // MOOD / MOTIVATION
    if (lowerMsg.includes('mood') || lowerMsg.includes('sad') || lowerMsg.includes('motivation')) {
        if (mood < 3 && incompleteHabits.length > 0) {
            return `Your mood is low because you're breaking promises to yourself. You missed ${incompleteHabits[0]}. Do it, and you'll feel better. Action precedes motivation.`;
        }
        return "Motivation is for amateurs. Pros show up when they don't want to. Stop feeling, start doing.";
    }

    // HABITS SPECIFIC
    if (lowerMsg.includes('habit')) {
        if (incompleteHabits.length > 0) {
            return `Target identified: '${incompleteHabits[0]}'. It's pending. Why are you talking to me instead of doing it?`;
        }
        return "All habits cleared for today. Good. Now find something extra. Read 10 pages or stretch.";
    }

    return "I hear you. But talk is cheap. Show me the logs. Go complete a habit right now.";
};
