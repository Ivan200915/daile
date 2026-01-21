// Referral Service
// Generates unique referral codes and tracks referrals

// Get Telegram user ID from WebApp
const getTelegramUserId = (): number | null => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id || null;
};

// Generate a short referral code based on user ID
export const generateReferralCode = (): string => {
    const userId = getTelegramUserId();
    if (!userId) return 'GUEST';

    // Base36 encode for shorter code
    const base = userId.toString(36).toUpperCase();
    return `DD${base}`;
};

// Get referral link
export const getReferralLink = (): string => {
    const code = generateReferralCode();
    // Replace with your actual bot username
    return `https://t.me/DailyDisciplin_bot?start=ref_${code}`;
};

// Check if user was referred (from URL params or start parameter)
export const checkReferralCode = (): string | null => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    const startParam = tg?.initDataUnsafe?.start_param;

    if (startParam && startParam.startsWith('ref_')) {
        return startParam.replace('ref_', '');
    }

    // Also check URL params for web preview
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    return refCode || null;
};

// Track referral signup (call your backend)
export const trackReferral = async (referrerCode: string): Promise<boolean> => {
    const userId = getTelegramUserId();
    if (!userId) return false;

    try {
        const response = await fetch('https://app.s7ven.ru/api/referrals/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                referrer_code: referrerCode,
                referred_user_id: userId
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Referral tracking error:', error);
        return false;
    }
};

// Get referral stats (how many people referred)
export interface ReferralStats {
    totalReferrals: number;
    premiumDaysEarned: number;
    referralCode: string;
    referralLink: string;
}

export const getReferralStats = async (): Promise<ReferralStats> => {
    const userId = getTelegramUserId();
    const code = generateReferralCode();
    const link = getReferralLink();

    if (!userId) {
        return { totalReferrals: 0, premiumDaysEarned: 0, referralCode: code, referralLink: link };
    }

    try {
        const response = await fetch(`https://app.s7ven.ru/api/referrals/stats?telegram_id=${userId}`);
        if (!response.ok) {
            return { totalReferrals: 0, premiumDaysEarned: 0, referralCode: code, referralLink: link };
        }

        const data = await response.json();
        return {
            totalReferrals: data.total_referrals || 0,
            premiumDaysEarned: data.premium_days_earned || 0,
            referralCode: code,
            referralLink: link
        };
    } catch (error) {
        return { totalReferrals: 0, premiumDaysEarned: 0, referralCode: code, referralLink: link };
    }
};
