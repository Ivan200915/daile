// Terra API Integration Service
// Docs: https://docs.tryterra.co

export interface TerraCredentials {
    apiKey: string;
    devId: string;
}

export interface TerraUser {
    userId: string;
    provider: string;
    lastSyncAt: string | null;
    connected: boolean;
}

export interface TerraHealthData {
    steps: number;
    sleepHours: number;
    activeMinutes: number;
    heartRateAvg: number | null;
    caloriesBurned: number;
}

// Available providers
export const TERRA_PROVIDERS = [
    { id: 'APPLE', name: 'Apple Health', icon: '🍎', color: '#FF3B30' },
    { id: 'GOOGLE', name: 'Google Fit', icon: '🟢', color: '#4285F4' },
    { id: 'FITBIT', name: 'Fitbit', icon: '⌚', color: '#00B0B9' },
    { id: 'GARMIN', name: 'Garmin', icon: '🏃', color: '#007DC3' },
    { id: 'SAMSUNG', name: 'Samsung Health', icon: '📱', color: '#1428A0' },
    { id: 'XIAOMI', name: 'Xiaomi Mi Fit', icon: '💪', color: '#FF6700' },
    { id: 'WHOOP', name: 'Whoop', icon: '🔴', color: '#FF3366' },
    { id: 'OURA', name: 'Oura Ring', icon: '💍', color: '#C4A962' },
] as const;

const STORAGE_KEY = 'terra-connection';

// Check if we have Terra credentials configured
const getTerraCredentials = (): TerraCredentials | null => {
    const apiKey = (import.meta as any).env?.VITE_TERRA_API_KEY;
    const devId = (import.meta as any).env?.VITE_TERRA_DEV_ID;

    if (apiKey && devId) {
        return { apiKey, devId };
    }
    return null;
};

// Get stored connection info
export const getConnectedDevice = (): TerraUser | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
};

// Save connection info
export const saveConnectedDevice = (device: TerraUser): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
};

// Remove connection
export const disconnectDevice = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

// Generate Terra Widget Session (requires backend in production)
export const generateWidgetSession = async (userId: string): Promise<string | null> => {
    const credentials = getTerraCredentials();

    if (!credentials) {
        // console.log('Terra: No credentials configured, using demo mode');
        // Return demo URL for testing
        return null;
    }

    try {
        // NOTE: In production, this should go through YOUR backend
        // because you shouldn't expose API keys in frontend
        const response = await fetch('https://api.tryterra.co/v2/auth/generateWidgetSession', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': credentials.apiKey,
                'dev-id': credentials.devId,
            },
            body: JSON.stringify({
                reference_id: userId,
                providers: 'APPLE,GOOGLE,FITBIT,GARMIN,SAMSUNG,XIAOMI',
                language: 'en',
                auth_success_redirect_url: window.location.origin + '/connect-success',
                auth_failure_redirect_url: window.location.origin + '/connect-failed',
            }),
        });

        const data = await response.json();
        return data.url || null;
    } catch (error) {
        console.error('Terra: Failed to generate widget session', error);
        return null;
    }
};

// Fetch health data from Terra (requires backend in production)
export const fetchHealthData = async (terraUserId: string): Promise<TerraHealthData | null> => {
    const credentials = getTerraCredentials();

    if (!credentials) {
        // Demo mode: return simulated data that changes slightly each time
        return generateDemoHealthData();
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(
            `https://api.tryterra.co/v2/daily?user_id=${terraUserId}&start_date=${today}&end_date=${today}`,
            {
                headers: {
                    'x-api-key': credentials.apiKey,
                    'dev-id': credentials.devId,
                },
            }
        );

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const daily = data.data[0];
            return {
                steps: daily.distance_data?.steps || 0,
                sleepHours: (daily.sleep_data?.duration_in_seconds || 0) / 3600,
                activeMinutes: daily.activity_data?.active_duration_seconds
                    ? Math.round(daily.activity_data.active_duration_seconds / 60)
                    : 0,
                heartRateAvg: daily.heart_rate_data?.avg_hr || null,
                caloriesBurned: daily.calories_data?.total_burned_calories || 0,
            };
        }

        return null;
    } catch (error) {
        console.error('Terra: Failed to fetch health data', error);
        return null;
    }
};

// Generate realistic demo data
export const generateDemoHealthData = (): TerraHealthData => {
    const hour = new Date().getHours();

    // Steps increase throughout the day
    const baseSteps = Math.floor((hour / 24) * 10000);
    const steps = baseSteps + Math.floor(Math.random() * 1000);

    // Sleep is fixed in the morning
    const sleepHours = 6.5 + Math.random() * 2; // 6.5 - 8.5 hours

    // Active minutes based on time of day
    const activeMinutes = Math.floor(Math.random() * 30) + (hour > 12 ? 30 : 10);

    return {
        steps: Math.max(steps, 1000),
        sleepHours: Math.round(sleepHours * 10) / 10,
        activeMinutes,
        heartRateAvg: 65 + Math.floor(Math.random() * 20),
        caloriesBurned: Math.floor(steps * 0.04) + 1500,
    };
};

// Simulate device connection (for demo without Terra credentials)
export const simulateConnection = (providerId: string): TerraUser => {
    const provider = TERRA_PROVIDERS.find(p => p.id === providerId);

    const user: TerraUser = {
        userId: `demo_${Date.now()}`,
        provider: providerId,
        lastSyncAt: new Date().toISOString(),
        connected: true,
    };

    saveConnectedDevice(user);
    return user;
};
