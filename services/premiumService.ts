// Premium Status Service
// Checks premium status via Telegram ID from your backend

interface PremiumStatus {
    isPremium: boolean;
    expiresAt?: string;
    plan?: string;
}

// Get Telegram user ID from WebApp
export const getTelegramUserId = (): number | null => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id || null;
};

// Check premium status from your backend
export const checkPremiumStatus = async (): Promise<PremiumStatus> => {
    const userId = getTelegramUserId();

    if (!userId) {
        console.warn('No Telegram user ID available');
        return { isPremium: false };
    }

    try {
        // Call your existing backend at app.s7ven.ru
        const response = await fetch(`https://app.s7ven.ru/api/premium/check?telegram_id=${userId}`);

        if (!response.ok) {
            return { isPremium: false };
        }

        const data = await response.json();
        return {
            isPremium: data.is_premium || data.isPremium || false,
            expiresAt: data.expires_at || data.expiresAt,
            plan: data.plan
        };
    } catch (error) {
        console.error('Premium check failed:', error);
        return { isPremium: false };
    }
};

// Cache premium status in localStorage for offline use
export const cachePremiumStatus = (status: PremiumStatus) => {
    localStorage.setItem('dd_premium_status', JSON.stringify({
        ...status,
        cachedAt: new Date().toISOString()
    }));
};

export const getCachedPremiumStatus = (): PremiumStatus | null => {
    const cached = localStorage.getItem('dd_premium_status');
    if (!cached) return null;

    try {
        const data = JSON.parse(cached);
        // Cache valid for 1 hour
        const cachedAt = new Date(data.cachedAt);
        const now = new Date();
        if (now.getTime() - cachedAt.getTime() > 60 * 60 * 1000) {
            return null; // Cache expired
        }
        return data;
    } catch {
        return null;
    }
};

// Main function: check with cache fallback
export const getPremiumStatus = async (): Promise<PremiumStatus> => {
    // Try cached first for instant UI
    const cached = getCachedPremiumStatus();

    // Fetch fresh status in background
    const fresh = await checkPremiumStatus();
    cachePremiumStatus(fresh);

    return fresh;
};
