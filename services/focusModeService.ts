// Focus Mode Service
// Pomodoro timer integrated with habit tracking

export interface FocusSession {
    id: string;
    habitId: string | null;
    habitName: string | null;
    startTime: string;
    endTime: string | null;
    duration: number; // minutes
    type: 'focus' | 'break';
    completed: boolean;
}

export interface FocusSettings {
    focusDuration: number; // default 25 minutes
    shortBreak: number; // default 5 minutes
    longBreak: number; // default 15 minutes
    sessionsUntilLongBreak: number; // default 4
    soundEnabled: boolean;
    notificationsEnabled: boolean;
}

export interface FocusStats {
    totalSessions: number;
    totalMinutes: number;
    completedToday: number;
    currentStreak: number; // consecutive days with focus sessions
}

// Storage keys
const FOCUS_SETTINGS_KEY = 'dd_focus_settings';
const FOCUS_SESSIONS_KEY = 'dd_focus_sessions';
const FOCUS_STATS_KEY = 'dd_focus_stats';

// Default settings
const DEFAULT_SETTINGS: FocusSettings = {
    focusDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    notificationsEnabled: true
};

// Load settings
export const loadFocusSettings = (): FocusSettings => {
    const saved = localStorage.getItem(FOCUS_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

// Save settings
export const saveFocusSettings = (settings: FocusSettings): void => {
    localStorage.setItem(FOCUS_SETTINGS_KEY, JSON.stringify(settings));
};

// Load sessions
export const loadFocusSessions = (): FocusSession[] => {
    const saved = localStorage.getItem(FOCUS_SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
};

// Save sessions
export const saveFocusSessions = (sessions: FocusSession[]): void => {
    localStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(sessions));
};

// Start new focus session
export const startFocusSession = (
    duration: number,
    habitId?: string,
    habitName?: string
): FocusSession => {
    const session: FocusSession = {
        id: `focus_${Date.now()}`,
        habitId: habitId || null,
        habitName: habitName || null,
        startTime: new Date().toISOString(),
        endTime: null,
        duration,
        type: 'focus',
        completed: false
    };

    const sessions = loadFocusSessions();
    sessions.push(session);
    saveFocusSessions(sessions);

    return session;
};

// Complete focus session
export const completeFocusSession = (sessionId: string): FocusSession | null => {
    const sessions = loadFocusSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) return null;

    session.completed = true;
    session.endTime = new Date().toISOString();
    saveFocusSessions(sessions);

    // Update stats
    updateFocusStats();

    return session;
};

// Start break
export const startBreak = (duration: number): FocusSession => {
    const session: FocusSession = {
        id: `break_${Date.now()}`,
        habitId: null,
        habitName: null,
        startTime: new Date().toISOString(),
        endTime: null,
        duration,
        type: 'break',
        completed: false
    };

    const sessions = loadFocusSessions();
    sessions.push(session);
    saveFocusSessions(sessions);

    return session;
};

// Get today's sessions
export const getTodaySessions = (): FocusSession[] => {
    const sessions = loadFocusSessions();
    const today = new Date().toISOString().split('T')[0];

    return sessions.filter(s => s.startTime.startsWith(today));
};

// Calculate stats
export const updateFocusStats = (): FocusStats => {
    const sessions = loadFocusSessions();
    const focusSessions = sessions.filter(s => s.type === 'focus' && s.completed);

    const totalMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const today = getTodaySessions().filter(s => s.type === 'focus' && s.completed);

    // Calculate streak
    let streak = 0;
    const dates = new Set(sessions.map(s => s.startTime.split('T')[0]));
    const sortedDates = Array.from(dates).sort().reverse();

    for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);

        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            streak++;
        } else {
            break;
        }
    }

    const stats: FocusStats = {
        totalSessions: focusSessions.length,
        totalMinutes,
        completedToday: today.length,
        currentStreak: streak
    };

    localStorage.setItem(FOCUS_STATS_KEY, JSON.stringify(stats));
    return stats;
};

// Load stats
export const loadFocusStats = (): FocusStats => {
    const saved = localStorage.getItem(FOCUS_STATS_KEY);
    if (saved) return JSON.parse(saved);

    return updateFocusStats();
};

// Get next break type
export const getNextBreakType = (): 'short' | 'long' => {
    const today = getTodaySessions().filter(s => s.type === 'focus' && s.completed);
    const settings = loadFocusSettings();

    return today.length % settings.sessionsUntilLongBreak === 0 ? 'long' : 'short';
};

// Get recommended next duration
export const getNextDuration = (): { duration: number; type: 'focus' | 'break'; breakType?: 'short' | 'long' } => {
    const lastSession = getTodaySessions().slice(-1)[0];
    const settings = loadFocusSettings();

    if (!lastSession || lastSession.type === 'break') {
        return {
            duration: settings.focusDuration,
            type: 'focus'
        };
    }

    const breakType = getNextBreakType();
    const breakDuration = breakType === 'long' ? settings.longBreak : settings.shortBreak;

    return {
        duration: breakDuration,
        type: 'break',
        breakType
    };
};
