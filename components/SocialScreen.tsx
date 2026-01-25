import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { Leaderboard } from './Leaderboard';
import { DailyChallengesWidget } from './DailyChallengesWidget';
import {
    loadGroups,
    createGroup,
    joinGroupByCode,
    getGroupLeaderboard,
    Group,
    GroupMember
} from '../services/socialService';
import { PremiumGate } from '../services/PremiumContext';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl';
const GLASS_BUTTON = 'bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition';
const ACCENT_BUTTON = 'bg-[#00D4AA] text-black font-semibold rounded-xl hover:bg-[#00D4AA]/90 transition';

interface SocialScreenProps {
    userId: string;
    userName: string;
    userStreak: number;
    userXp: number;
    onChallengeComplete: (xp: number) => void;
}

// Add Friend/Group Modal
const AddGroupModal = ({
    onClose,
    onCreateGroup,
    onJoinGroup
}: {
    onClose: () => void;
    onCreateGroup: (name: string) => void;
    onJoinGroup: (code: string) => void;
}) => {
    const [mode, setMode] = useState<'create' | 'join'>('join');
    const [input, setInput] = useState('');

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
            <div className={`${GLASS_PANEL} p-6 w-full max-w-sm border-[#00D4AA]/30 animate-slide-up`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Добавить группу</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <Icons.X size={24} />
                    </button>
                </div>

                {/* Mode Toggle */}
                <div className="flex p-1 rounded-xl bg-white/10 mb-6">
                    <button
                        onClick={() => setMode('join')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'join' ? 'bg-[#00D4AA] text-black' : 'text-white/60'}`}
                    >
                        Присоединиться
                    </button>
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'create' ? 'bg-[#00D4AA] text-black' : 'text-white/60'}`}
                    >
                        Создать
                    </button>
                </div>

                {mode === 'join' ? (
                    <>
                        <div className={`${GLASS_PANEL_LIGHT} p-4 mb-4`}>
                            <label className="text-sm text-white/50 block mb-2">Код приглашения</label>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value.toUpperCase())}
                                placeholder="XXXXXX"
                                maxLength={6}
                                className="w-full bg-transparent text-2xl font-bold outline-none text-center tracking-widest"
                            />
                        </div>
                        <button
                            onClick={() => { onJoinGroup(input); onClose(); }}
                            disabled={input.length < 6}
                            className={`w-full py-3 ${input.length >= 6 ? ACCENT_BUTTON : 'bg-white/10 text-white/30 cursor-not-allowed rounded-xl'}`}
                        >
                            Присоединиться
                        </button>
                    </>
                ) : (
                    <>
                        <div className={`${GLASS_PANEL_LIGHT} p-4 mb-4`}>
                            <label className="text-sm text-white/50 block mb-2">Название группы</label>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Моя команда"
                                className="w-full bg-transparent text-xl font-bold outline-none"
                            />
                        </div>
                        <button
                            onClick={() => { onCreateGroup(input); onClose(); }}
                            disabled={input.length < 2}
                            className={`w-full py-3 ${input.length >= 2 ? ACCENT_BUTTON : 'bg-white/10 text-white/30 cursor-not-allowed rounded-xl'}`}
                        >
                            Создать группу
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Internal Leaderboard moved to separate component
const GroupLeaderboard = ({ members, currentUserId }: { members: GroupMember[]; currentUserId: string }) => {
    // ... (This acts as a fallback or specific group view if needed, but we will mostly use the new global one)
    // For now, let's keep the group-specific one simple or reuse logic if possible.
    // Actually, let's just keep the group-specific rendering here as it differs slightly (GroupMember vs Global).
    // Or we can adapt the new Leaderboard to handle both?
    // For simplicity/speed, I will keep a lightweight version here for groups and use the big one for Global.

    // Re-implementing getRankIcon locally or importing?
    // Let's just keep the previous implementation for Group Context.
    const getRankIcon = (rank: number) => {
        if (rank === 1) return <span className="text-lg">🥇</span>;
        if (rank === 2) return <span className="text-lg">🥈</span>;
        if (rank === 3) return <span className="text-lg">🥉</span>;
        return <span className="text-sm text-white/50">#{rank}</span>;
    };

    return (
        <div className="space-y-2">
            {members.map((member, i) => (
                <div
                    key={member.id}
                    className={`${GLASS_PANEL_LIGHT} p-3 flex items-center justify-between ${member.id === currentUserId ? 'ring-2 ring-[#00D4AA]/50' : ''}`}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-8 text-center">{getRankIcon(i + 1)}</div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#3B82F6] flex items-center justify-center font-bold">
                            {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium">{member.name} {member.id === currentUserId && <span className="text-xs text-[#00D4AA]">(Вы)</span>}</p>
                            <p className="text-xs text-white/50">{member.streak} дней подряд</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-[#FFD700]">{member.weeklyXp}</p>
                        <p className="text-xs text-white/50">XP</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Group Card Component
const GroupCard = ({
    group,
    currentUserId,
    onSelect
}: {
    group: Group;
    currentUserId: string;
    onSelect: () => void;
}) => {
    const userMember = group.members.find(m => m.id === currentUserId);
    const topMember = group.members.sort((a, b) => b.weeklyXp - a.weeklyXp)[0];

    return (
        <button
            onClick={onSelect}
            className={`${GLASS_PANEL} p-4 w-full text-left hover:bg-white/15 transition`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <IconBadge icon={Icons.Users} size="md" color="#3B82F6" variant="circle" glowIntensity="light" />
                    <div>
                        <h4 className="font-bold">{group.name}</h4>
                        <p className="text-xs text-white/50">{group.members.length} участников</p>
                    </div>
                </div>
                <Icons.ChevronRight size={20} className="text-white/30" />
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-white/50">Лидер:</span>
                    <span className="text-sm font-medium text-[#FFD700]">{topMember?.name}</span>
                </div>
                {userMember && (
                    <div className="text-right">
                        <span className="text-xs text-white/50">Ваше место: </span>
                        <span className="font-bold">#{userMember.rank}</span>
                    </div>
                )}
            </div>
        </button>
    );
};

// Main Social Screen
export const SocialScreen: React.FC<SocialScreenProps> = ({
    userId,
    userName,
    userStreak,
    userXp,
    onChallengeComplete
}) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        setGroups(loadGroups());
    }, []);

    const handleCreateGroup = (name: string) => {
        const newGroup = createGroup(name, userId, userName);
        setGroups(loadGroups());
    };

    const handleJoinGroup = (code: string) => {
        const group = joinGroupByCode(code, userId, userName);
        if (group) {
            setGroups(loadGroups());
        }
    };

    if (selectedGroup) {
        const leaderboard = getGroupLeaderboard(selectedGroup.id);

        return (
            <div className="space-y-4">
                {/* Back button */}
                <button
                    onClick={() => setSelectedGroup(null)}
                    className="flex items-center space-x-2 text-white/60 hover:text-white transition"
                >
                    <Icons.ArrowRight size={20} className="rotate-180" />
                    <span>Назад к группам</span>
                </button>

                {/* Group Header */}
                <div className={`${GLASS_PANEL} p-4`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <IconBadge icon={Icons.Users} size="lg" color="#3B82F6" variant="circle" glowIntensity="medium" />
                            <div>
                                <h3 className="text-xl font-bold">{selectedGroup.name}</h3>
                                <p className="text-sm text-white/50">{selectedGroup.members.length} участников</p>
                            </div>
                        </div>
                    </div>

                    {/* Invite Code */}
                    <div className={`${GLASS_PANEL_LIGHT} p-3 flex items-center justify-between`}>
                        <div>
                            <p className="text-xs text-white/50">Код приглашения</p>
                            <p className="text-xl font-bold tracking-widest">{selectedGroup.code}</p>
                        </div>
                        <button
                            onClick={() => navigator.clipboard.writeText(selectedGroup.code)}
                            className={`${GLASS_BUTTON} p-2`}
                        >
                            <Icons.Share size={18} />
                        </button>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className={`${GLASS_PANEL} p-4`}>
                    <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center">
                        <Icons.Trophy size={16} className="mr-2 text-[#FFD700]" />
                        Таблица лидеров
                    </h3>
                    <GroupLeaderboard members={leaderboard} currentUserId={userId} />
                </div>
            </div>
        );
    }

    return (
        <PremiumGate feature="Социальные функции">
            <div className="space-y-4">
                {/* Header Stats */}
                <div className={`${GLASS_PANEL} p-4`}>
                    <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[#00D4AA]">{groups.length}</p>
                            <p className="text-xs text-white/50">Групп</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{groups.reduce((sum, g) => sum + g.members.length, 0)}</p>
                            <p className="text-xs text-white/50">Друзей</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[#FFD700]">{userXp}</p>
                            <p className="text-xs text-white/50">Ваш XP</p>
                        </div>
                    </div>
                </div>

                {/* Groups List */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold">Мои группы</h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-[#00D4AA] text-sm font-medium flex items-center"
                        >
                            <Icons.Plus size={16} className="mr-1" /> Добавить
                        </button>
                    </div>

                    {groups.length === 0 ? (
                        <div className={`${GLASS_PANEL} p-6 text-center`}>
                            <IconBadge icon={Icons.Users} size="xl" color="rgba(255,255,255,0.3)" variant="circle" className="mb-4" />
                            <p className="text-white/60 mb-4">У вас пока нет групп</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className={`${ACCENT_BUTTON} px-6 py-3`}
                            >
                                Создать или присоединиться
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {groups.map(group => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    currentUserId={userId}
                                    onSelect={() => setSelectedGroup(group)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Group Modal */}
                {showAddModal && (
                    <AddGroupModal
                        onClose={() => setShowAddModal(false)}
                        onCreateGroup={handleCreateGroup}
                        onJoinGroup={handleJoinGroup}
                    />
                )}
            </div>
        </PremiumGate>
    );
};

export default SocialScreen;
