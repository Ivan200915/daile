// Focus Service
// Manages the Pomodoro timer, focus sessions, and related gamification rewards

import { useState, useEffect, useRef } from 'react';
import { addXp } from './gamificationService';

export type FocusMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSession {
    isActive: boolean;
    timeLeft: number; // seconds
    totalTime: number; // initial duration in seconds
    mode: FocusMode;
    task: string;
    startTime?: Date;
}

export interface FocusSettings {
    focusDuration: number; // minutes
    shortBreakDuration: number; // minutes
    longBreakDuration: number; // minutes
}

const DEFAULT_SETTINGS: FocusSettings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
};

// Hook for using the Focus Service
export const useFocusTimer = (onComplete?: (minutes: number) => void) => {
    const [session, setSession] = useState<FocusSession>({
        isActive: false,
        timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
        totalTime: DEFAULT_SETTINGS.focusDuration * 60,
        mode: 'focus',
        task: '',
    });

    const [settings, setSettings] = useState<FocusSettings>(DEFAULT_SETTINGS);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Start the timer
    const startTimer = (taskName: string = '') => {
        if (session.isActive) return;

        setSession(prev => ({
            ...prev,
            isActive: true,
            task: taskName || prev.task,
            startTime: new Date(),
        }));
    };

    // Pause the timer
    const pauseTimer = () => {
        setSession(prev => ({ ...prev, isActive: false }));
    };

    // Stop the timer
    const stopTimer = () => {
        setSession(prev => ({
            ...prev,
            isActive: false,
            timeLeft: getDurationForMode(prev.mode) * 60,
            totalTime: getDurationForMode(prev.mode) * 60,
        }));
    };

    // Switch mode (Focus <-> Break)
    const setMode = (mode: FocusMode) => {
        setSession({
            isActive: false,
            timeLeft: getDurationForMode(mode) * 60,
            totalTime: getDurationForMode(mode) * 60,
            mode,
            task: mode === 'focus' ? session.task : 'Break Time',
        });
    };

    // Helper to get duration
    const getDurationForMode = (mode: FocusMode): number => {
        switch (mode) {
            case 'focus': return settings.focusDuration;
            case 'shortBreak': return settings.shortBreakDuration;
            case 'longBreak': return settings.longBreakDuration;
            default: return 25;
        }
    };

    // Handle completion
    const handleTimerComplete = () => {
        setSession(prev => ({ ...prev, isActive: false }));

        // Reward XP only for focus sessions
        if (session.mode === 'focus') {
            const minutesCompleted = Math.floor(session.totalTime / 60);
            const xpEarned = Math.round(minutesCompleted * 0.5); // 0.5 XP per minute = 12-13 XP for 25m
            addXp(xpEarned);

            if (onComplete) {
                onComplete(minutesCompleted);
            }

            console.log(`Focus session completed! Earned ${xpEarned} XP`);
        }
    };

    // Timer tick effect
    useEffect(() => {
        if (session.isActive && session.timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setSession(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
            }, 1000);
        } else if (session.timeLeft === 0 && session.isActive) {
            // Timer finished
            handleTimerComplete();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [session.isActive, session.timeLeft]);

    // Format time (MM:SS)
    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate progress percent
    const progress = ((session.totalTime - session.timeLeft) / session.totalTime) * 100;

    return {
        session,
        startTimer,
        pauseTimer,
        stopTimer,
        setMode,
        formatTime,
        progress,
    };
};
