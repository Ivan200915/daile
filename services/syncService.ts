import { UserSettings, DailyLog, Habit } from '../types';

// const API_URL = 'http://localhost:3000/api'; // Local Dev
// In production, this should be the Timeweb IP/Domain
// For now, we will use a proxy in vite or just direct URL if CORS allowed.
// Let's assume user runs server locally for testing now or we hardcode the eventual IP if deployed.
// But wait, the user is running the server locally on their machine, so localhost:3000 is correct for now.
const API_URL = 'http://localhost:3000/api';

interface AuthResponse {
    token: string;
    user: { id: number; email: string };
    error?: string;
}

interface SyncData {
    settings?: UserSettings;
    logs?: DailyLog[];
    habits?: Habit[];
    lastSyncedAt?: string;
}

export const syncService = {
    token: localStorage.getItem('auth_token'),

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    },

    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
    },

    async register(email: string, password: string): Promise<AuthResponse> {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.token) this.setToken(data.token);
            return data;
        } catch (e) {
            return { token: '', user: { id: 0, email: '' }, error: 'Network error' };
        }
    },

    async loginTelegram(initData: string): Promise<AuthResponse> {
        try {
            const res = await fetch(`${API_URL}/auth/telegram`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            });
            const data = await res.json();
            if (data.token) this.setToken(data.token);
            return data;
        } catch (e) {
            return { token: '', user: { id: 0, email: '' }, error: 'Network error' };
        }
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.token) this.setToken(data.token);
            return data;
        } catch (e) {
            return { token: '', user: { id: 0, email: '' }, error: 'Network error' };
        }
    },

    async pushData(data: SyncData): Promise<boolean> {
        if (!this.token) return false;
        try {
            const res = await fetch(`${API_URL}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });
            return res.ok;
        } catch (e) {
            console.error('Sync Push Error:', e);
            return false;
        }
    },

    async pullData(): Promise<SyncData | null> {
        if (!this.token) return null;
        try {
            const res = await fetch(`${API_URL}/sync`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error('Sync Pull Error:', e);
            return null;
        }
    }
};
