// RPGAvatar - Hierarchy progression from Peasant to God
import React from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';

interface RPGAvatarProps {
    level: number;
    xp: number;
    xpToNextLevel: number;
    habitsCompleted: number;
    totalHabits: number;
    streak: number;
}

// Hierarchy stages
const getRank = (level: number) => {
    if (level >= 50) return {
        name: 'Бог', nameEn: 'God',
        image: '/ranks/rank5.png',
        color: '#00D4AA',
        motto: 'Бессмертие дисциплины',
        mottoEn: 'Immortal Discipline'
    };
    if (level >= 30) return {
        name: 'Император', nameEn: 'Emperor',
        image: '/ranks/rank4.png',
        color: '#9B59B6',
        motto: 'Власть над собой',
        mottoEn: 'Power Over Self'
    };
    if (level >= 20) return {
        name: 'Полководец', nameEn: 'Commander',
        image: '/ranks/rank3.png',
        color: '#FFD700',
        motto: 'Командуй привычками',
        mottoEn: 'Command Your Habits'
    };
    if (level >= 10) return {
        name: 'Воин', nameEn: 'Warrior',
        image: '/ranks/rank2.png',
        color: '#CD7F32',
        motto: 'Битва за себя',
        mottoEn: 'Battle For Yourself'
    };
    return {
        name: 'Крестьянин', nameEn: 'Peasant',
        image: '/ranks/rank1.png',
        color: '#6B7280',
        motto: 'Начало пути',
        mottoEn: 'The Journey Begins'
    };
};

export const RPGAvatar = ({ level, xp, xpToNextLevel, habitsCompleted, totalHabits, streak }: RPGAvatarProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const rank = getRank(level);
    const xpPercent = Math.min(100, Math.round((xp / xpToNextLevel) * 100));

    return (
        <div className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-lg flex items-center">
                    <Icons.Trophy size={20} className="mr-2 text-[#FFD700]" />
                    {isRu ? 'Твой статус' : 'Your Status'}
                </h3>
                <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{
                        color: rank.color,
                        backgroundColor: `${rank.color}15`,
                        borderColor: `${rank.color}40`
                    }}
                >
                    {isRu ? `УР. ${level}` : `LVL ${level}`}
                </span>
            </div>

            {/* Main Card */}
            <div className={`${GLASS_PANEL} p-4 relative overflow-hidden`}>
                {/* Background glow */}
                <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-30"
                    style={{ backgroundColor: rank.color }}
                />

                <div className="flex items-center gap-4 relative z-10">
                    {/* 3D Avatar Container */}
                    <div className="relative shrink-0 group" style={{ perspective: '500px' }}>
                        {/* Rotating glow ring */}
                        <div
                            className="absolute -inset-2 rounded-full animate-spin-slow opacity-50 blur-sm"
                            style={{
                                background: `conic-gradient(from 0deg, ${rank.color}, transparent, ${rank.color})`
                            }}
                        />

                        {/* Avatar image with 3D hover effect */}
                        <div
                            className="relative w-20 h-20 rounded-full overflow-hidden border-2 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                            style={{
                                borderColor: `${rank.color}60`,
                                boxShadow: `0 0 30px ${rank.color}40`,
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <img
                                src={rank.image}
                                alt={rank.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Shine overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                        </div>

                        {/* Level badge */}
                        <div
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-black border-2 border-black/30 shadow-lg"
                            style={{ background: rank.color }}
                        >
                            {level}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xl font-black text-white uppercase tracking-wide">
                                {isRu ? rank.name : rank.nameEn}
                            </span>
                        </div>
                        <p className="text-xs text-white/50 italic mb-2">
                            "{isRu ? rank.motto : rank.mottoEn}"
                        </p>

                        {/* XP Bar */}
                        <div>
                            <div className="flex justify-between text-[10px] text-white/40 mb-1">
                                <span>XP</span>
                                <span className="font-mono">{xp} / {xpToNextLevel}</span>
                            </div>
                            <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                                    style={{
                                        width: `${xpPercent}%`,
                                        background: `linear-gradient(90deg, ${rank.color}80, ${rank.color})`
                                    }}
                                >
                                    {/* Shine animation */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/5">
                        <Icons.Flame size={14} className="text-[#FF6B00]" />
                        <span className="text-sm font-bold">{streak}</span>
                        <span className="text-[9px] text-white/30 uppercase">{isRu ? 'дней' : 'days'}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/5">
                        <Icons.CheckCircle size={14} className="text-[#00D4AA]" />
                        <span className="text-sm font-bold">{habitsCompleted}/{totalHabits}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/5">
                        <Icons.Target size={14} className="text-[#FFD700]" />
                        <span className="text-sm font-bold">{xpPercent}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RPGAvatar;
