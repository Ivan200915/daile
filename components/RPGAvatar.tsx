// RPGAvatar - Hierarchy progression with animated modal
import React, { useState } from 'react';
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
    gender?: 'male' | 'female';
}

// Male ranks (Невольник → Бог)
const RANKS_MALE = [
    { minLevel: 1, maxLevel: 9, name: 'Невольник', nameEn: 'Captive', image: '/ranks/rank1.png', color: '#6B7280', motto: 'Вырвись из рутины', mottoEn: 'Break Free', xpRequired: 0 },
    { minLevel: 10, maxLevel: 19, name: 'Воин', nameEn: 'Warrior', image: '/ranks/rank2.png', color: '#CD7F32', motto: 'Битва за себя', mottoEn: 'Fight For Yourself', xpRequired: 1000 },
    { minLevel: 20, maxLevel: 29, name: 'Полководец', nameEn: 'Commander', image: '/ranks/rank3.png', color: '#FFD700', motto: 'Командуй привычками', mottoEn: 'Command Your Habits', xpRequired: 3000 },
    { minLevel: 30, maxLevel: 49, name: 'Император', nameEn: 'Emperor', image: '/ranks/rank4.png', color: '#9B59B6', motto: 'Власть над собой', mottoEn: 'Master Yourself', xpRequired: 7000 },
    { minLevel: 50, maxLevel: 100, name: 'Бог', nameEn: 'God', image: '/ranks/rank5.png', color: '#00D4AA', motto: 'Бессмертие дисциплины', mottoEn: 'Immortal Discipline', xpRequired: 15000 },
];

// Female ranks (Невольница → Богиня)
const RANKS_FEMALE = [
    { minLevel: 1, maxLevel: 9, name: 'Невольница', nameEn: 'Captive', image: '/ranks/female/rank1.png', color: '#6B7280', motto: 'Вырвись из рутины', mottoEn: 'Break Free', xpRequired: 0 },
    { minLevel: 10, maxLevel: 19, name: 'Танцовщица', nameEn: 'Dancer', image: '/ranks/female/rank2.png', color: '#CD7F32', motto: 'Грация и сила', mottoEn: 'Grace and Strength', xpRequired: 1000 },
    { minLevel: 20, maxLevel: 29, name: 'Жрица', nameEn: 'Priestess', image: '/ranks/female/rank3.png', color: '#FFD700', motto: 'Мудрость ведёт', mottoEn: 'Wisdom Leads', xpRequired: 3000 },
    { minLevel: 30, maxLevel: 49, name: 'Царица', nameEn: 'Queen', image: '/ranks/female/rank4.png', color: '#9B59B6', motto: 'Власть над собой', mottoEn: 'Master Yourself', xpRequired: 7000 },
    { minLevel: 50, maxLevel: 100, name: 'Богиня', nameEn: 'Goddess', image: '/ranks/female/rank5.png', color: '#00D4AA', motto: 'Бессмертие красоты', mottoEn: 'Immortal Beauty', xpRequired: 15000 },
];

const getRank = (level: number, ranks: typeof RANKS_MALE) => {
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (level >= ranks[i].minLevel) return { ...ranks[i], index: i };
    }
    return { ...ranks[0], index: 0 };
};

export const RPGAvatar = ({ level, xp, xpToNextLevel, habitsCompleted, totalHabits, streak, gender = 'male' }: RPGAvatarProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const RANKS = gender === 'female' ? RANKS_FEMALE : RANKS_MALE;
    const [showModal, setShowModal] = useState(false);
    const rank = getRank(level, RANKS);
    const xpPercent = Math.min(100, Math.round((xp / xpToNextLevel) * 100));
    const totalXp = rank.xpRequired + xp; // Approximate total XP

    return (
        <>
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
                            color: '#00D4AA',
                            backgroundColor: 'rgba(0, 212, 170, 0.15)',
                            borderColor: 'rgba(0, 212, 170, 0.4)'
                        }}
                    >
                        {isRu ? `УР. ${level}` : `LVL ${level}`}
                    </span>
                </div>

                {/* Main Card - Clickable */}
                <div
                    className={`${GLASS_PANEL} p-4 relative overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/15 active:scale-[0.98]`}
                    onClick={() => setShowModal(true)}
                >
                    {/* Background glow - APP COLOR */}
                    <div
                        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-40 animate-pulse"
                        style={{ backgroundColor: '#00D4AA' }}
                    />

                    <div className="flex items-center gap-4 relative z-10">
                        {/* 3D Avatar Container */}
                        <div className="relative shrink-0">
                            {/* Subtle inner glow - contained */}
                            <div
                                className="absolute inset-0 rounded-full animate-pulse opacity-40"
                                style={{
                                    boxShadow: '0 0 20px #00D4AA, inset 0 0 10px rgba(0, 212, 170, 0.3)'
                                }}
                            />

                            {/* Avatar image */}
                            <div
                                className="relative w-20 h-20 rounded-full overflow-hidden border-2 shadow-lg"
                                style={{
                                    borderColor: '#00D4AA',
                                    boxShadow: '0 0 15px rgba(0, 212, 170, 0.4)'
                                }}
                            >
                                <img
                                    src={rank.image}
                                    alt={rank.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Level badge */}
                            <div
                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-black border-2 border-black/30 shadow-lg"
                                style={{ background: '#00D4AA' }}
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
                                <Icons.ChevronRight size={16} className="text-white/30" />
                            </div>
                            <p className="text-xs text-[#00D4AA] italic mb-2">
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
                                            background: 'linear-gradient(90deg, #00D4AA80, #00D4AA)'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
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

                    {/* Tap hint */}
                    <p className="text-center text-[10px] text-white/20 mt-2">
                        {isRu ? 'Нажми, чтобы увидеть путь' : 'Tap to see your path'}
                    </p>
                </div>
            </div>

            {/* Modal - Full Path */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="w-full max-w-sm bg-[#1C1C1E] rounded-3xl p-6 border border-white/10 shadow-2xl animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-wider text-white mb-1">
                                {isRu ? 'Путь к Величию' : 'Path to Greatness'}
                            </h2>
                            <p className="text-sm text-white/50">
                                {isRu ? 'Твоя эволюция от раба привычек до бога дисциплины' : 'Your evolution from captive to god'}
                            </p>
                        </div>

                        {/* Ranks Path */}
                        <div className="space-y-3">
                            {RANKS.map((r, i) => {
                                const isUnlocked = level >= r.minLevel;
                                const isCurrent = level >= r.minLevel && level <= r.maxLevel;

                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-500 ${isCurrent
                                            ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 scale-[1.02]'
                                            : isUnlocked
                                                ? 'bg-white/5 border-white/10'
                                                : 'bg-black/20 border-white/5 opacity-50'
                                            }`}
                                        style={{
                                            animationDelay: `${i * 100}ms`,
                                            animation: 'slideInRight 0.4s ease-out forwards'
                                        }}
                                    >
                                        {/* Rank Image */}
                                        <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 shrink-0 ${isUnlocked ? '' : 'grayscale'}`}
                                            style={{ borderColor: isUnlocked ? r.color : '#333' }}
                                        >
                                            <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                                            {isCurrent && (
                                                <div className="absolute inset-0 border-2 border-[#00D4AA] rounded-full animate-pulse" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold uppercase ${isCurrent ? 'text-[#00D4AA]' : 'text-white'}`}>
                                                    {isRu ? r.name : r.nameEn}
                                                </span>
                                                {isCurrent && (
                                                    <span className="text-[9px] bg-[#00D4AA] text-black px-1.5 py-0.5 rounded font-bold">
                                                        {isRu ? 'СЕЙЧАС' : 'NOW'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-white/40">
                                                {isRu ? `Уровень ${r.minLevel}-${r.maxLevel}` : `Level ${r.minLevel}-${r.maxLevel}`}
                                            </p>
                                            <p className="text-[10px] italic text-white/30 mt-0.5">
                                                "{isRu ? r.motto : r.mottoEn}"
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div className="shrink-0">
                                            {isUnlocked ? (
                                                <Icons.Check size={20} className="text-[#00D4AA]" />
                                            ) : (
                                                <Icons.Lock size={18} className="text-white/20" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Motivational Footer */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-[#00D4AA]/10 to-transparent rounded-2xl border-l-4 border-[#00D4AA]">
                            <p className="text-sm text-white/70">
                                {isRu
                                    ? `Ты на ${rank.index + 1} из 5 ступеней. Продолжай — бессмертие ближе, чем кажется!`
                                    : `You're on step ${rank.index + 1} of 5. Keep going – immortality is closer than you think!`
                                }
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full mt-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-medium hover:bg-white/10 transition-colors"
                        >
                            {isRu ? 'Закрыть' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RPGAvatar;
