import React, { useState } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { ShopItem, UserSettings } from '../types';
import { ShopItemCard } from './ShopItemCard';
import { useLanguage } from '../locales/LanguageContext';
import { purchaseItem, equipItem } from '../services/currencyService';
import { playSound } from '../services/soundService';
import { triggerHaptic } from '../services/hapticService';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';

// Mock Catalog
const CATALOG: ShopItem[] = [
    // Avatars
    { id: 'avatar_ninja', type: 'avatar', name: 'Cyber Ninja', description: 'Stealth, speed, and discipline.', price: 500, rarity: 'rare', icon: '🥷' },
    { id: 'avatar_robot', type: 'avatar', name: 'Golden Droid', description: 'Maximum efficiency focused.', price: 1000, rarity: 'epic', icon: '🤖' },
    { id: 'avatar_lion', type: 'avatar', name: 'Neon Lion', description: 'King of the concrete jungle.', price: 2500, rarity: 'legendary', icon: '🦁' },

    // Themes
    { id: 'theme_neon', type: 'theme', name: 'Neon City', description: 'Dark mode with vibrant cyber accents.', price: 200, rarity: 'rare', icon: '🌃' },
    { id: 'theme_gold', type: 'theme', name: 'Royal Gold', description: 'Luxury status for the disciplined.', price: 5000, rarity: 'legendary', icon: '👑' },

    // Consumables (Buffs)
    { id: 'buff_freeze', type: 'consumable', name: 'Streak Freeze', description: 'Protect your streak for one day.', price: 300, rarity: 'common', icon: '🧊', effect: 'add_freeze' }
];

interface ShopScreenProps {
    user: UserSettings;
    onUpdateUser: (user: UserSettings) => void;
    onClose: () => void;
}

export const ShopScreen = ({ user, onUpdateUser, onClose }: ShopScreenProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const [activeTab, setActiveTab] = useState<'all' | 'avatar' | 'theme' | 'consumable'>('all');

    const filteredItems = activeTab === 'all' ? CATALOG : CATALOG.filter(i => i.type === activeTab);

    const handleBuy = (item: ShopItem) => {
        const result = purchaseItem(item);
        if (result.success) {
            playSound('level_up'); // using levelUp as success sound for now
            triggerHaptic('success');
            // Refresh parent state logic is assumed to be handled by parent re-render or callback
            // We need to pass the updated user object back up or force a reload
            // Ideally onUpdateUser would fetch latest from storage.
            // For this UI component, let's blindly assume parent refresh for now or trigger it.
            onUpdateUser({ ...user, coins: user.coins - item.price, inventory: [...(user.inventory || []), item.id] });
        } else {
            triggerHaptic('heavy'); // Error vibration
            // Ideally show toast
            alert(result.message);
        }
    };

    const handleEquip = (item: ShopItem) => {
        if (item.type === 'consumable') return; // Cannot equip consumables

        const success = equipItem(item.type as 'avatar' | 'theme', item.id);
        if (success) {
            triggerHaptic('selection');
            onUpdateUser({
                ...user,
                equipped: {
                    ...user.equipped,
                    [item.type]: item.id
                }
            });
        }
    };

    return (
        <div className="h-full flex flex-col p-5 overflow-y-auto no-scrollbar pt-safe pb-24">

            {/* Header / Balance */}
            <div className={`${GLASS_PANEL} p-6 mb-6 flex flex-col items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/20 via-transparent to-[#FFD700]/5 animate-pulse-slow" />

                {/* Back Button (Absolute Top Left) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 bg-black/20 rounded-full hover:bg-black/40 transition z-20"
                >
                    <Icons.ArrowRight size={20} className="rotate-180 text-white/70" />
                </button>

                <p className="text-white/60 text-sm uppercase tracking-widest font-bold z-10">{isRu ? 'Твой Баланс' : 'Your Balance'}</p>
                <div className="flex items-center space-x-2 z-10">
                    <span className="text-5xl font-black text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                        {user.coins?.toLocaleString() || 0}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] border-2 border-yellow-200 shadow-lg flex items-center justify-center text-sm">🟡</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar">
                {['all', 'avatar', 'theme', 'consumable'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === tab
                            ? 'bg-white text-black shadow-lg scale-105'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredItems.map(item => (
                    <ShopItemCard
                        key={item.id}
                        item={item}
                        isOwned={user.inventory?.includes(item.id)}
                        isEquipped={user.equipped?.avatar === item.id || user.equipped?.theme === item.id}
                        canAfford={(user.coins || 0) >= item.price}
                        onBuy={handleBuy}
                        onEquip={handleEquip}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <div className="text-center text-white/30 py-10">
                    <Icons.ShoppingBag size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No items found</p>
                </div>
            )}
        </div>
    );
};
