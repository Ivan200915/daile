import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl border border-white/10';

interface LeaderboardMember {
    id: string;
    name: string;
    xp: number;
    rank: number;
    avatar?: string;
    streak: number;
    isUser?: boolean;
}

// Mock Global Leaderboard Data Generator
const generateGlobalLeaderboard = (userXp: number, userName: string): LeaderboardMember[] => {
    const players = [
        { id: '1', name: 'Alex Fit', xp: Math.max(userXp + 5000, 15000), rank: 1, streak: 45 },
        { id: '2', name: 'Maria Run', xp: Math.max(userXp + 3000, 12000), rank: 2, streak: 32 },
        { id: '3', name: 'John Doe', xp: Math.max(userXp + 1000, 10000), rank: 3, streak: 128 },
    ];

    // Add random players around user
    for (let i = 4; i <= 20; i++) {
        players.push({
            id: `p${i}`,
            name: `User ${9000 + i}`,
            xp: Math.max(0, userXp + (Math.random() * 2000 - 1000)),
            rank: i,
            streak: Math.floor(Math.random() * 50)
        });
    }

    // Add User
    const user = { id: 'currentUser', name: userName, xp: userXp, rank: 0, streak: 0, isUser: true };
    players.push(user);

    return players.sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));
};


export const Leaderboard = ({ userXp, userName, userStreak }: { userXp: number, userName: string, userStreak: number }) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const [members, setMembers] = useState<LeaderboardMember[]>([]);

    useEffect(() => {
        const data = generateGlobalLeaderboard(userXp, userName);
        // Ensure user sees themselves
        const userIndex = data.findIndex(p => p.isUser);
        if (userIndex !== -1) {
            data[userIndex].streak = userStreak; // Update with real streak
        }
        setMembers(data);
    }, [userXp, userName, userStreak]);

    // Focus on top 3 + User area
    const displayMembers = () => {
        const top3 = members.slice(0, 3);
        const userMember = members.find(m => m.isUser);

        if (!userMember) return top3;

        // If user is in top 3, just show top 5
        if (userMember.rank <= 3) return members.slice(0, 5);

        // Show top 3 ... User-1, User, User+1
        const aroundUser = members.slice(Math.max(3, userMember.rank - 2), Math.min(members.length, userMember.rank + 1));

        return [...top3, { id: 'sep', name: '...', xp: 0, rank: 0, streak: 0 } as LeaderboardMember, ...aroundUser];
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">🥇</span>;
        if (rank === 2) return <span className="text-2xl drop-shadow-[0_0_10px_rgba(192,192,192,0.8)]">🥈</span>;
        if (rank === 3) return <span className="text-2xl drop-shadow-[0_0_10px_rgba(205,127,50,0.8)]">🥉</span>;
        return <span className="text-sm text-white/50 font-mono w-6 text-center">#{rank}</span>;
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-bold text-lg flex items-center">
                    <Icons.Globe size={20} className="mr-2 text-[#3B82F6]" />
                    {isRu ? 'Мировой Рейтинг' : 'Global Ranking'}
                </h3>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{isRu ? 'ТОП ИГРОКОВ' : 'TOP PLAYERS'}</span>
            </div>

            {displayMembers().map((member, i) => (
                member.id === 'sep' ? (
                    <div key="sep" className="text-center text-white/20 text-xs py-1">. . .</div>
                ) : (
                    <div
                        key={member.id}
                        className={`${GLASS_PANEL_LIGHT} p-3 flex items-center justify-between transition-all duration-300 ${member.isUser ? 'bg-[#00D4AA]/10 border-[#00D4AA]/50 scale-[1.02] shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'hover:bg-white/10'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-8 flex justify-center">{getRankIcon(member.rank)}</div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.isUser ? 'bg-gradient-to-tr from-[#00D4AA] to-[#3B82F6] text-white shadow-lg' : 'bg-white/10 text-white/60'}`}>
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className={`font-bold text-sm ${member.isUser ? 'text-[#00D4AA]' : 'text-white'}`}>
                                    {member.name} {member.isUser && isRu && '(Вы)'} {member.isUser && !isRu && '(You)'}
                                </p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-white/40 flex items-center">
                                        <Icons.Flame size={10} className="mr-0.5 text-[#FF6B00]" /> {member.streak}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold font-mono ${member.rank <= 3 ? 'text-[#FFD700]' : 'text-white/80'}`}>{member.xp.toLocaleString()}</p>
                            <p className="text-[9px] text-white/30">XP</p>
                        </div>
                    </div>
                )
            ))}
        </div>
    );
};
