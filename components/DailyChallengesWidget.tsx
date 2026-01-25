import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Challenge } from '../types';
import { getDailyChallenges, completeChallenge } from '../services/challengeService';
import { addXp } from '../services/gamificationService';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';

interface DailyChallengesWidgetProps {
    onChallengeComplete: (xp: number) => void;
}

export const DailyChallengesWidget = ({ onChallengeComplete }: DailyChallengesWidgetProps) => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const { language } = useLanguage();
    const isRu = language === 'ru';

    useEffect(() => {
        setChallenges(getDailyChallenges());
    }, []);

    const handleComplete = (id: string, xp: number) => {
        const updated = completeChallenge(id);
        setChallenges(updated);
        addXp(xp);
        onChallengeComplete(xp);
    };

    if (challenges.length === 0) return null;

    const allCompleted = challenges.every(c => c.completed);

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-lg flex items-center">
                    <Icons.Target size={20} className="mr-2 text-[#FFD700]" />
                    {isRu ? 'Дневные задачи' : 'Daily Quests'}
                </h3>
                {allCompleted && (
                    <span className="text-xs text-[#00D4AA] font-bold bg-[#00D4AA]/10 px-2 py-1 rounded-full border border-[#00D4AA]/20">
                        {isRu ? 'ВСЁ ВЫПОЛНЕНО' : 'ALL CLEARED'}
                    </span>
                )}
            </div>

            {/* Community Goal */}
            <div className={`${GLASS_PANEL} p-4 mb-4 relative overflow-hidden bg-gradient-to-br from-[#3B82F6]/20 to-transparent border border-[#3B82F6]/30`}>
                <div className="flex items-center justify-between mb-2 relative z-10">
                    <h4 className="font-bold text-sm text-[#3B82F6] flex items-center">
                        <Icons.Globe size={16} className="mr-2" />
                        {isRu ? 'Мировая Цель' : 'Global Goal'}
                    </h4>
                    <span className="text-[10px] text-white/60 bg-black/20 px-2 py-0.5 rounded-full">
                        {isRu ? '24ч осталось' : '24h left'}
                    </span>
                </div>
                <div className="relative z-10">
                    <p className="text-lg font-bold text-white mb-1">
                        {isRu ? 'Выпить 100,000 Л воды' : 'Drink 100,000 L Water'}
                    </p>
                    <div className="h-3 bg-black/30 rounded-full overflow-hidden border border-[#3B82F6]/20 mb-1">
                        <div className="h-full bg-[#3B82F6] w-[75%] relative">
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-white/50">
                        <span>75,432 / 100,000</span>
                        <span>{isRu ? '75% выполнено' : '75% done'}</span>
                    </div>
                </div>
                <div className="absolute -right-5 -bottom-5 text-[#3B82F6]/10">
                    <Icons.Droplets size={100} />
                </div>
            </div>

            <div className="space-y-3">
                {challenges.map(challenge => (
                    <div
                        key={challenge.id}
                        className={`${GLASS_PANEL} p-4 flex items-center justify-between transition-all duration-300 ${challenge.completed ? 'opacity-50 grayscale-[0.5]' : 'hover:bg-white/15'}`}
                    >
                        <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${challenge.completed ? 'bg-[#00D4AA]/20 text-[#00D4AA]' : 'bg-white/10 text-white/70'}`}>
                                {challenge.completed ? <Icons.Check size={20} /> : <Icons.Target size={18} />}
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${challenge.completed ? 'line-through text-white/50' : 'text-white'}`}>{challenge.title}</h4>
                                <p className="text-xs text-white/50">{challenge.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 ml-2">
                            <span className="text-xs font-mono text-[#FFD700]">+{challenge.xp} XP</span>
                            {!challenge.completed && (
                                <button
                                    onClick={() => handleComplete(challenge.id, challenge.xp)}
                                    className="p-2 bg-[#00D4AA] text-black rounded-xl hover:bg-[#00D4AA]/90 shadow-lg shadow-[#00D4AA]/20 group"
                                >
                                    <Icons.Check size={16} className="group-active:scale-90 transition" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
