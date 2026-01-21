// Unified Health Data Service
// Abstracts data source (Terra, manual input, mock)

import {
    getConnectedDevice,
    fetchHealthData,
    generateDemoHealthData,
    TerraHealthData
} from './terraService';

export interface HealthMetrics {
    steps: number;
    stepsGoal: number;
    stepsProgress: number;

    sleepHours: number;
    sleepGoal: number;
    sleepProgress: number;

    activeMinutes: number;
    activeGoal: number;
    activeProgress: number;

    heartRate: number | null;
    caloriesBurned: number;

    source: 'terra' | 'manual' | 'demo';
    lastUpdated: Date;
}

const GOALS = {
    steps: 10000,
    sleep: 8, // hours
    active: 60, // minutes
};

const STORAGE_KEY = 'health-metrics-today';

// Get today's date key
const getTodayKey = (): string => {
    return new Date().toISOString().split('T')[0];
};

// Convert Terra data to our format
const terraToMetrics = (data: TerraHealthData): HealthMetrics => {
    return {
        steps: data.steps,
        stepsGoal: GOALS.steps,
        stepsProgress: Math.min((data.steps / GOALS.steps) * 100, 100),

        sleepHours: data.sleepHours,
        sleepGoal: GOALS.sleep,
        sleepProgress: Math.min((data.sleepHours / GOALS.sleep) * 100, 100),

        activeMinutes: data.activeMinutes,
        activeGoal: GOALS.active,
        activeProgress: Math.min((data.activeMinutes / GOALS.active) * 100, 100),

        heartRate: data.heartRateAvg,
        caloriesBurned: data.caloriesBurned,

        source: 'terra',
        lastUpdated: new Date(),
    };
};

// Get cached metrics for today
const getCachedMetrics = (): HealthMetrics | null => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);

    // Check if it's from today
    if (data.date !== getTodayKey()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }

    return {
        ...data.metrics,
        lastUpdated: new Date(data.metrics.lastUpdated),
    };
};

// Cache metrics
const cacheMetrics = (metrics: HealthMetrics): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: getTodayKey(),
        metrics,
    }));
};

// Main function to get health metrics
export const getHealthMetrics = async (forceRefresh = false): Promise<HealthMetrics> => {
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
        const cached = getCachedMetrics();
        if (cached) {
            // Check if cache is less than 5 minutes old
            const cacheAge = Date.now() - cached.lastUpdated.getTime();
            if (cacheAge < 5 * 60 * 1000) {
                return cached;
            }
        }
    }

    // Check if device is connected
    const connectedDevice = getConnectedDevice();

    if (connectedDevice?.connected) {
        // Try to fetch from Terra
        const terraData = await fetchHealthData(connectedDevice.userId);

        if (terraData) {
            const metrics = terraToMetrics(terraData);
            metrics.source = 'terra';
            cacheMetrics(metrics);
            return metrics;
        }
    }

    // Fallback to demo data
    const demoData = generateDemoHealthData();
    const metrics = terraToMetrics(demoData);
    metrics.source = 'demo';
    cacheMetrics(metrics);

    return metrics;
};

// Update metrics manually (for manual input feature)
export const updateMetricsManually = (updates: Partial<{
    steps: number;
    sleepHours: number;
    activeMinutes: number;
}>): HealthMetrics => {
    const current = getCachedMetrics() || terraToMetrics(generateDemoHealthData());

    const updated: HealthMetrics = {
        ...current,
        steps: updates.steps ?? current.steps,
        sleepHours: updates.sleepHours ?? current.sleepHours,
        activeMinutes: updates.activeMinutes ?? current.activeMinutes,
        source: 'manual',
        lastUpdated: new Date(),
    };

    // Recalculate progress
    updated.stepsProgress = Math.min((updated.steps / GOALS.steps) * 100, 100);
    updated.sleepProgress = Math.min((updated.sleepHours / GOALS.sleep) * 100, 100);
    updated.activeProgress = Math.min((updated.activeMinutes / GOALS.active) * 100, 100);

    cacheMetrics(updated);
    return updated;
};

// Format display values
export const formatSteps = (steps: number): string => {
    return steps.toLocaleString();
};

export const formatSleep = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatActive = (minutes: number): string => {
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${minutes}m`;
};
