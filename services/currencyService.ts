import { UserSettings, ShopItem } from '../types';
import { saveUserSettings, loadUserSettings } from './storageService';

// Initial Economy State for new users (or migration)
export const INITIAL_ECONOMY = {
    coins: 0,
    inventory: ['default_avatar', 'default_theme'],
    equipped: {
        avatar: 'default_avatar',
        theme: 'default_theme'
    }
};

export const getCoins = (): number => {
    const user = loadUserSettings();
    return user?.coins || 0;
};

export const addCoins = (amount: number): number => {
    const user = loadUserSettings();
    if (!user) return 0;

    user.coins = (user.coins || 0) + amount;
    saveUserSettings(user);
    return user.coins;
};

export const spendCoins = (amount: number): boolean => {
    const user = loadUserSettings();
    if (!user) return false;

    if ((user.coins || 0) < amount) return false;

    user.coins -= amount;
    saveUserSettings(user);
    return true;
};

export const purchaseItem = (item: ShopItem): { success: boolean; message: string } => {
    const user = loadUserSettings();
    if (!user) return { success: false, message: 'User not found' };

    // Check if already owned
    if (user.inventory?.includes(item.id) && item.type !== 'consumable') {
        return { success: false, message: 'Already owned' };
    }

    if ((user.coins || 0) < item.price) {
        return { success: false, message: 'Not enough coins' };
    }

    // Transaction
    user.coins -= item.price;

    // Add to inventory if not consumable (consumables might be used immediately or stored in a separate counter)
    // For now, let's assume consumables are just added to inventory logs or executed immediately.
    // If it's a "Streak Freeze" item, we might want to update the streak data directly using storageService helpers,
    // but for simplicity in this MVP, let's mostly focus on cosmetics.

    if (!user.inventory) user.inventory = [...INITIAL_ECONOMY.inventory];

    if (item.type !== 'consumable') {
        user.inventory.push(item.id);
    }

    saveUserSettings(user);
    return { success: true, message: 'Purchase successful' };
};

export const equipItem = (type: 'avatar' | 'theme', itemId: string): boolean => {
    const user = loadUserSettings();
    if (!user) return false;

    if (!user.inventory?.includes(itemId)) return false;

    if (!user.equipped) user.equipped = { ...INITIAL_ECONOMY.equipped };

    user.equipped[type] = itemId;
    saveUserSettings(user);
    return true;
};
