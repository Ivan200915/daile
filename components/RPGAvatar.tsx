// RPGAvatar - Character that levels up with habits
import React, { useState, useEffect } from 'react';
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

// Avatar appearance with Lucide icons
const getAvatarVisuals = (level: number) => {
    // Stage 5: Supernova (Level 50+)
    if (level >= 50) return {
        stage: 'Supernova',
        stageRu: 'Сверхновая',
        icon: Icons.Octagon,
        color: '#D946EF',
        effect: 'animate-nebula',
        description: 'Cosmic Power',
        descriptionRu: 'Космическая мощь'
    };
    // Stage 4: Star (Level 20-49)
    if (level >= 20) return {
        stage: 'Star',
        stageRu: 'Звезда',
        icon: Icons.Sun,
        color: '#00D4AA',
        effect: 'animate-spin-slow',
        description: 'Radiant Light',
        descriptionRu: 'Сияющий свет'
    };
    // Stage 3: Torch (Level 10-19)
    if (level >= 10) return {
        stage: 'Torch',
        stageRu: 'Пламя',
        icon: Icons.Flame,
        color: '#FF6B00',
        effect: 'animate-flicker',
        description: 'Burning Bright',
        descriptionRu: 'Яркое горение'
    };
    // Stage 2: Ember (Level 5-9)
    if (level >= 5) return {
        stage: 'Ember',
        stageRu: 'Уголёк',
        icon: Icons.Zap,
        color: '#FFD700',
        effect: 'animate-pulse-slow',
        description: 'Gaining Heat',
        descriptionRu: 'Набирает жар'
    };
    // Stage 1: Spark (Level 1-4)
    return {
        stage: 'Spark',
        stageRu: 'Искра',
        icon: Icons.Sparkles,
        color: '#A1A1AA',
        effect: 'animate-pulse-strong',
        description: 'Potential',
        descriptionRu: 'Потенциал'
    };
};

export const RPGAvatar = ({ level, xp, xpToNextLevel, habitsCompleted, totalHabits, streak }: RPGAvatarProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    // Use the dynamic visuals function matching the Energy Evolution plan
    const visuals = getAvatarVisuals(level);
    const xpProgress = Math.round((xp / xpToNextLevel) * 100);

    return (
        <div className="relative w-full mb-6">
            {/* Unified Glass Panel - consistent with DailyChallengesWidget */}
            <div className={`${GLASS_PANEL} p-4 relative overflow-hidden group`}>

                {/* Simplified Background Glow - minimal and clean */}
                <div
                    className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${visuals.effect}`}
                    style={{
                        background: `radial-gradient(circle at top right, ${visuals.color}, transparent 70%)`
                    }}
                />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Avatar - Dynamic Icon with Scale Animation */}
                        <div className="relative shrink-0">
                            {/* Glow Ring */}
                            <div
                                className="absolute -inset-2 rounded-full opacity-30 blur-md"
                                style={{ background: visuals.color }}
                            />

                            <div
                                className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 border-white/10 bg-black/40 backdrop-blur-sm"
                                style={{ boxShadow: `0 0 15px ${visuals.color}20` }}
                            >
                                {/* The rendering of the icon itself */}
                                <visuals.icon
                                    size={32}
                                    className={`text-white drop-shadow-md transform-gpu ${visuals.effect}`}
                                    style={{ color: visuals.color }}
                                />

                                <div
                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1C1C1E] shadow-sm text-[10px] font-bold text-black"
                                    style={{ background: visuals.color }}
                                >
                                    {level}
                                </div>
                            </div>
                        </div>

                        {/* Text Info - Clean & Simple */}
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-wide">
                                {isRu ? visuals.stageRu : visuals.stage}
                            </h3>
                            <div className="flex items-center space-x-2 text-xs text-white/50">
                                <span>{isRu ? visuals.descriptionRu : visuals.description}</span>
                                <span>•</span>
                                <span className="font-mono text-[#00D4AA]">{xp} / {xpToNextLevel} XP</span>
                            </div>

                            {/* XP Bar Micro */}
                            <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${xpProgress}%`, background: visuals.color }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Minimal Stats Column */}
                    <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <Icons.Flame size={14} className="text-orange-500" />
                            <span className="text-sm font-bold">{streak}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <Icons.CheckCircle size={14} className="text-[#00D4AA]" />
                            <span className="text-sm font-bold">{habitsCompleted}/{totalHabits}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RPGAvatar;
