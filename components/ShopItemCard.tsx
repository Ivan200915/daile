import React from 'react';
import { ShopItem } from '../types';
import { Icons } from './Icons';
import IconBadge from './IconBadge';

const RARITY_COLORS = {
    common: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
    rare: 'from-blue-500/20 to-indigo-500/20 border-blue-400/30',
    epic: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
    legendary: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30',
};

const RARITY_TEXT = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-[#FFD700]',
};

interface ShopItemCardProps {
    item: ShopItem;
    isOwned: boolean;
    isEquipped: boolean;
    canAfford: boolean;
    onBuy: (item: ShopItem) => void;
    onEquip: (item: ShopItem) => void;
}

export const ShopItemCard = ({ item, isOwned, isEquipped, canAfford, onBuy, onEquip }: ShopItemCardProps) => {
    // Helper to render icon based on type/string
    const renderIcon = () => {
        // If it's a simple emoji or string that's not a URL
        if (!item.assetUrl && typeof item.icon === 'string') {
            return <div className="text-4xl filter drop-shadow-lg">{item.icon}</div>;
        }
        // If it's a URL
        if (item.assetUrl) {
            return <img src={item.assetUrl} alt={item.name} className="w-16 h-16 object-contain drop-shadow-lg" />;
        }
        return <div className="text-4xl">📦</div>;
    };

    return (
        <div className={`
            relative p-4 rounded-2xl border backdrop-blur-md transition-all duration-300
            bg-gradient-to-br ${RARITY_COLORS[item.rarity]}
            hover:scale-[1.02] active:scale-95 group
            ${isEquipped ? 'ring-2 ring-[#00D4AA] shadow-[0_0_20px_rgba(0,212,170,0.2)]' : ''}
        `}>
            {/* Rarity Tag */}
            <div className={`absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider ${RARITY_TEXT[item.rarity]} bg-black/40 px-2 py-0.5 rounded-full`}>
                {item.rarity}
            </div>

            <div className="flex flex-col items-center text-center mb-3 mt-2">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                    {renderIcon()}
                </div>
                <h3 className="font-bold text-sm text-white mb-1">{item.name}</h3>
                <p className="text-xs text-white/50 h-8 line-clamp-2">{item.description}</p>
            </div>

            {/* Action Button */}
            <div className="mt-2">
                {isOwned ? (
                    <button
                        onClick={() => onEquip(item)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${isEquipped
                                ? 'bg-[#00D4AA]/20 text-[#00D4AA] cursor-default'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                    </button>
                ) : (
                    <button
                        onClick={() => onBuy(item)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${canAfford
                                ? 'bg-[#FFD700] text-black hover:bg-[#FFD700]/90 shadow-lg shadow-[#FFD700]/20'
                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        <span>{item.price}</span>
                        <div className="w-3 h-3 rounded-full bg-black/20 flex items-center justify-center text-[8px]">🟡</div>
                    </button>
                )}
            </div>
        </div>
    );
};
