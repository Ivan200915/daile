// LiveChallenges - Group challenges widget
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-[#1C1C1E]/60 backdrop-blur-[30px] border border-white/10 rounded-[28px]';
const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl border border-white/15';

interface Challenge {
    id: string;
    title: string;
    titleRu: string;
    description: string;
    descriptionRu: string;
    participants: number;
    daysLeft: number;
    progress: number; // 0-100
    joined: boolean;
    icon: string;
}

// Mock challenges (would come from backend in real app)
const MOCK_CHALLENGES: Challenge[] = [
    {
        id: '1',
        title: '21 Days No Sugar',
        titleRu: '21 день без сахара',
        description: 'Join 523 people going sugar-free',
        descriptionRu: 'Присоединяйся к 523 участникам',
        participants: 523,
        daysLeft: 14,
        progress: 33,
        joined: true,
        icon: '🍬'
    },
    {
        id: '2',
        title: '10K Steps Daily',
        titleRu: '10 000 шагов каждый день',
        description: 'Walk more with 1.2K challengers',
        descriptionRu: 'Ходи больше с 1200 участниками',
        participants: 1247,
        daysLeft: 7,
        progress: 0,
        joined: false,
        icon: '👟'
    },
    {
        id: '3',
        title: 'Morning Meditation',
        titleRu: 'Утренняя медитация',
        description: '30 days of mindfulness',
        descriptionRu: '30 дней осознанности',
        participants: 892,
        daysLeft: 21,
        progress: 0,
        joined: false,
        icon: '🧘'
    },
];

interface LiveChallengesProps {
    onJoinChallenge?: (challengeId: string) => void;
}

export const LiveChallenges = ({ onJoinChallenge }: LiveChallengesProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
    const [expanded, setExpanded] = useState(false);

    const handleJoin = (challengeId: string) => {
        setChallenges(prev => prev.map(c =>
            c.id === challengeId ? { ...c, joined: true, participants: c.participants + 1 } : c
        ));
        onJoinChallenge?.(challengeId);
    };

    const joinedChallenges = challenges.filter(c => c.joined);
    const availableChallenges = challenges.filter(c => !c.joined);

    return (
        <div className={`${GLASS_PANEL} p-4`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <Icons.Users size={18} className="text-[#00D4AA]" />
                    <h3 className="font-semibold">{isRu ? 'Челленджи' : 'Live Challenges'}</h3>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-[#00D4AA]"
                >
                    {expanded ? (isRu ? 'Скрыть' : 'Hide') : (isRu ? 'Все' : 'All')}
                </button>
            </div>

            {/* Joined Challenges */}
            {joinedChallenges.length > 0 && (
                <div className="space-y-2 mb-3">
                    {joinedChallenges.map(challenge => (
                        <div key={challenge.id} className={`${GLASS_PANEL_LIGHT} p-3`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl">{challenge.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {isRu ? challenge.titleRu : challenge.title}
                                        </p>
                                        <p className="text-xs text-white/40">
                                            {challenge.participants.toLocaleString()} {isRu ? 'участников' : 'participants'} • {challenge.daysLeft} {isRu ? 'дн. осталось' : 'days left'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[#00D4AA] text-xs font-bold">{challenge.progress}%</span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#00D4AA] rounded-full transition-all"
                                    style={{ width: `${challenge.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Available Challenges (collapsed by default) */}
            {(expanded || joinedChallenges.length === 0) && availableChallenges.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-white/40">{isRu ? 'Доступные' : 'Available'}</p>
                    {availableChallenges.slice(0, expanded ? undefined : 2).map(challenge => (
                        <div key={challenge.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{challenge.icon}</span>
                                <div>
                                    <p className="text-sm font-medium">{isRu ? challenge.titleRu : challenge.title}</p>
                                    <p className="text-xs text-white/40">
                                        {challenge.participants.toLocaleString()} {isRu ? 'уч.' : 'p.'} • {challenge.daysLeft}d
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleJoin(challenge.id)}
                                className="px-3 py-1.5 bg-[#00D4AA] text-black text-xs font-bold rounded-lg"
                            >
                                {isRu ? 'Вступить' : 'Join'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {joinedChallenges.length === 0 && !expanded && (
                <p className="text-xs text-white/40 text-center py-2">
                    {isRu ? 'Присоединяйся к челленджам с другими!' : 'Join challenges with others!'}
                </p>
            )}
        </div>
    );
};

export default LiveChallenges;
