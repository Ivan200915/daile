// Streak Shield Service
// Streak insurance system - users can buy protection for their streak

export interface StreakShield {
    active: boolean;
    purchaseDate: string | null;
    expiresAt: string | null; // 7 days from purchase
    usedCount: number; // How many times used
    maxUses: number; // Default 1
}

export interface ShieldPurchase {
    id: string;
    price: number; // Stars or rubles
    duration: number; // days
    maxUses: number;
    purchaseDate: string;
}

// Storage
const SHIELD_STORAGE_KEY = 'dd_streak_shield';
const SHIELD_HISTORY_KEY = 'dd_shield_history';

export const loadStreakShield = (): StreakShield => {
    const saved = localStorage.getItem(SHIELD_STORAGE_KEY);
    if (!saved) {
        return {
            active: false,
            purchaseDate: null,
            expiresAt: null,
            usedCount: 0,
            maxUses: 1
        };
    }

    const shield = JSON.parse(saved);

    // Check if expired
    if (shield.expiresAt && new Date(shield.expiresAt) < new Date()) {
        return {
            active: false,
            purchaseDate: null,
            expiresAt: null,
            usedCount: 0,
            maxUses: 1
        };
    }

    return shield;
};

export const saveStreakShield = (shield: StreakShield): void => {
    localStorage.setItem(SHIELD_STORAGE_KEY, JSON.stringify(shield));
};

// Purchase streak shield
export const purchaseStreakShield = (
    price: number,
    durationDays: number = 7,
    maxUses: number = 1
): StreakShield => {
    const now = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + durationDays);

    const shield: StreakShield = {
        active: true,
        purchaseDate: now.toISOString(),
        expiresAt: expires.toISOString(),
        usedCount: 0,
        maxUses
    };

    saveStreakShield(shield);

    // Save to history
    const purchase: ShieldPurchase = {
        id: `shield_${Date.now()}`,
        price,
        duration: durationDays,
        maxUses,
        purchaseDate: now.toISOString()
    };

    const history = loadShieldHistory();
    history.push(purchase);
    localStorage.setItem(SHIELD_HISTORY_KEY, JSON.stringify(history));

    return shield;
};

// Use shield to protect streak
export const useStreakShield = (): { success: boolean; message: string; messageRu: string } => {
    const shield = loadStreakShield();

    if (!shield.active) {
        return {
            success: false,
            message: 'No active shield',
            messageRu: 'Нет активного щита'
        };
    }

    if (shield.usedCount >= shield.maxUses) {
        return {
            success: false,
            message: 'Shield already used',
            messageRu: 'Щит уже использован'
        };
    }

    // Use the shield
    shield.usedCount++;

    if (shield.usedCount >= shield.maxUses) {
        shield.active = false;
    }

    saveStreakShield(shield);

    return {
        success: true,
        message: 'Streak protected!',
        messageRu: 'Стрик защищён!'
    };
};

// Get shield status
export const getShieldStatus = (): {
    hasShield: boolean;
    daysLeft: number;
    usesLeft: number;
} => {
    const shield = loadStreakShield();

    if (!shield.active || !shield.expiresAt) {
        return {
            hasShield: false,
            daysLeft: 0,
            usesLeft: 0
        };
    }

    const now = new Date();
    const expires = new Date(shield.expiresAt);
    const daysLeft = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    const usesLeft = shield.maxUses - shield.usedCount;

    return {
        hasShield: shield.active,
        daysLeft,
        usesLeft
    };
};

// Shield purchase history
export const loadShieldHistory = (): ShieldPurchase[] => {
    const saved = localStorage.getItem(SHIELD_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
};

// Shield pricing tiers
export const SHIELD_TIERS = [
    {
        id: 'basic',
        name: 'Basic Shield',
        nameRu: 'Базовый щит',
        price: 50, // Telegram Stars
        duration: 7,
        maxUses: 1,
        emoji: '🛡️'
    },
    {
        id: 'premium',
        name: 'Premium Shield',
        nameRu: 'Премиум щит',
        price: 120,
        duration: 14,
        maxUses: 2,
        emoji: '⚔️'
    },
    {
        id: 'ultimate',
        name: 'Ultimate Shield',
        nameRu: 'Ультра щит',
        price: 250,
        duration: 30,
        maxUses: 5,
        emoji: '🏰'
    }
];
