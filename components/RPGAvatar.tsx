// RPGAvatar - Character that levels up with habits
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-[#1C1C1E]/60 backdrop-blur-[30px] border border-white/10 rounded-[28px]';

interface RPGAvatarProps {
    level: number;
    xp: number;
    xpToNextLevel: number;
    habitsCompleted: number;
    totalHabits: number;
    streak: number;
}

// Avatar appearance based on level
const getAvatarStage = (level: number) => {
    if (level >= 50) return { stage: 'Легенда', emoji: '🏆', color: '#FFD700', aura: 'from-yellow-500/30' };
    if (level >= 30) return { stage: 'Мастер', emoji: '⚔️', color: '#9B59B6', aura: 'from-purple-500/30' };
    if (level >= 20) return { stage: 'Воин', emoji: '🛡️', color: '#3498DB', aura: 'from-blue-500/30' };
    if (level >= 10) return { stage: 'Ученик', emoji: '📚', color: '#2ECC71', aura: 'from-green-500/30' };
    if (level >= 5) return { stage: 'Новичок', emoji: '🌱', color: '#00D4AA', aura: 'from-cyan-500/30' };
    return { stage: 'Начинающий', emoji: '✨', color: '#95A5A6', aura: 'from-gray-500/20' };
};

// Unlockable items based on achievements
const UNLOCKABLES = [
    { id: 'badge_first', name: 'Первый день', emoji: '🎯', requiredLevel: 1 },
    { id: 'badge_week', name: '7-дневный streak', emoji: '🔥', requiredLevel: 3 },
    { id: 'badge_habits10', name: '10 привычек', emoji: '📈', requiredLevel: 5 },
    { id: 'badge_month', name: '30-дневный streak', emoji: '💎', requiredLevel: 10 },
    { id: 'badge_master', name: 'Мастер привычек', emoji: '🏅', requiredLevel: 20 },
    { id: 'badge_legend', name: 'Легенда', emoji: '👑', requiredLevel: 50 },
];

export const RPGAvatar = ({ level, xp, xpToNextLevel, habitsCompleted, totalHabits, streak }: RPGAvatarProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const [showDetails, setShowDetails] = useState(false);
    const [animateXp, setAnimateXp] = useState(false);

    const avatarStage = getAvatarStage(level);
    const xpProgress = Math.round((xp / xpToNextLevel) * 100);
    const unlockedItems = UNLOCKABLES.filter(item => level >= item.requiredLevel);
    const nextUnlock = UNLOCKABLES.find(item => level < item.requiredLevel);

    useEffect(() => {
        setAnimateXp(true);
        const timer = setTimeout(() => setAnimateXp(false), 500);
        return () => clearTimeout(timer);
    }, [xp]);

    const getGradient = (color: string) => {
        return `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`;
    };

    return (
        <div className="relative w-full">
            {/* Main Card */}
            <div className={`${GLASS_PANEL} p-5 relative overflow-hidden group`}>
                {/* Dynamic Background Glow */}
                <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-30 pointer-events-none transition-colors duration-700"
                    style={{ backgroundColor: avatarStage.color }}
                />
                <div
                    className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none transition-colors duration-700"
                    style={{ backgroundColor: avatarStage.color }}
                />

                {/* Content Container */}
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-5">
                        {/* Avatar Display */}
                        <div className="relative">
                            {/* Rotating Ring */}
                            <div
                                className="absolute -inset-1 rounded-full opacity-50 blur-sm animate-pulse"
                                style={{ background: getGradient(avatarStage.color) }}
                            />

                            {/* Avatar Circle */}
                            <div
                                className="relative w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl border-4 border-black/20"
                                style={{
                                    background: `linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)`,
                                    boxShadow: `0 0 20px ${avatarStage.color}40`
                                }}
                            >
                                <span className="drop-shadow-lg scale-110">{avatarStage.emoji}</span>

                                {/* Level Badge */}
                                <div
                                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#1C1C1E] shadow-lg"
                                    style={{ background: avatarStage.color }}
                                >
                                    <span className="text-black font-black text-xs">{level}</span>
                                </div>
                            </div>
                        </div>

                        {/* Title & Stats */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3
                                        className="text-2xl font-black italic tracking-wide uppercase drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
                                    >
                                        {isRu ? avatarStage.stage : avatarStage.stage}
                                    </h3>
                                    <p className="text-sm font-medium text-white/50 mb-1">
                                        {isRu ? 'Персонаж' : 'Character'} • {isRu ? `Ур. ${level}` : `Lvl ${level}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
                                >
                                    <Icons.ChevronRight size={16} className={`text-white/50 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                                </button>
                            </div>

                            {/* XP Progress */}
                            <div className="mt-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                                    <span>EXP</span>
                                    <span>{xp} / {xpToNextLevel}</span>
                                </div>
                                <div className="h-1.5 bg-black/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                        style={{
                                            width: `${xpProgress}%`,
                                            background: avatarStage.color,
                                            boxShadow: `0 0 10px ${avatarStage.color}`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: isRu ? 'Стрик' : 'Streak', value: streak, color: '#FF6B00', icon: Icons.Flame },
                            { label: isRu ? 'Сегодня' : 'Today', value: `${habitsCompleted}/${totalHabits}`, color: '#00D4AA', icon: Icons.CheckCircle },
                            { label: isRu ? 'Награды' : 'Badges', value: unlockedItems.length, color: '#9B59B6', icon: Icons.Trophy }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 border border-white/5 flex flex-col items-center">
                                <stat.icon size={16} style={{ color: stat.color }} className="mb-1 opacity-80" />
                                <span className="text-lg font-bold leading-none mb-1">{stat.value}</span>
                                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wide">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Expandable Details */}
                    {showDetails && (
                        <div className="mt-5 pt-5 border-t border-white/10 animate-fade-in">
                            <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                                {isRu ? 'Коллекция' : 'Collection'}
                            </h4>
                            <div className="grid grid-cols-4 gap-2">
                                {/* Next Unlock (Preview) */}
                                {nextUnlock && (
                                    <div className="col-span-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl p-3 flex items-center space-x-3 mb-2 border border-white/5 border-l-2" style={{ borderLeftColor: avatarStage.color }}>
                                        <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-xl grayscale opacity-50">
                                            {nextUnlock.emoji}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white/70 uppercase">
                                                {isRu ? 'Следующая награда' : 'Next Reward'}
                                            </p>
                                            <p className="text-sm font-medium">{nextUnlock.name}</p>
                                        </div>
                                        <div className="ml-auto text-xs font-mono text-white/40 bg-black/20 px-2 py-1 rounded">
                                            Lvl {nextUnlock.requiredLevel}
                                        </div>
                                    </div>
                                )}

                                {unlockedItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="aspect-square bg-white/5 rounded-xl flex flex-col items-center justify-center p-1 hover:bg-white/10 transition-colors cursor-help group/item relative"
                                    >
                                        <span className="text-2xl drop-shadow-sm group-hover/item:scale-110 transition-transform">{item.emoji}</span>
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, 4 - (unlockedItems.length % 4)) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square rounded-xl border-2 border-dashed border-white/5" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RPGAvatar;
