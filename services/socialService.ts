// Social Service
// Groups and friend duels for social challenges

export interface DuelChallenge {
    id: string;
    type: 'streak' | 'habits' | 'xp';
    target: number;
    duration: number; // days
    stake: number; // XP bet
}

export interface Duel {
    id: string;
    challengerId: string;
    challengerName: string;
    opponentId: string | null;
    opponentName: string | null;
    challenge: DuelChallenge;
    status: 'pending' | 'active' | 'completed';
    startDate: string | null;
    endDate: string | null;
    challengerProgress: number;
    opponentProgress: number;
    winnerId: string | null;
}

export interface Group {
    id: string;
    name: string;
    code: string; // Invite code
    ownerId: string;
    members: GroupMember[];
    createdAt: string;
}

export interface GroupMember {
    id: string;
    name: string;
    streak: number;
    weeklyXp: number;
    rank: number;
}

// Available duel challenges
export const DUEL_CHALLENGES: DuelChallenge[] = [
    { id: 'streak_3', type: 'streak', target: 3, duration: 7, stake: 50 },
    { id: 'streak_7', type: 'streak', target: 7, duration: 14, stake: 100 },
    { id: 'habits_20', type: 'habits', target: 20, duration: 7, stake: 75 },
    { id: 'habits_50', type: 'habits', target: 50, duration: 14, stake: 150 },
    { id: 'xp_500', type: 'xp', target: 500, duration: 7, stake: 100 },
];

// Storage
const DUELS_KEY = 'dd_duels';
const GROUPS_KEY = 'dd_groups';

export const loadDuels = (): Duel[] => {
    const saved = localStorage.getItem(DUELS_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveDuels = (duels: Duel[]): void => {
    localStorage.setItem(DUELS_KEY, JSON.stringify(duels));
};

export const loadGroups = (): Group[] => {
    const saved = localStorage.getItem(GROUPS_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveGroups = (groups: Group[]): void => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

// Create a new duel
export const createDuel = (
    challengerId: string,
    challengerName: string,
    challenge: DuelChallenge
): Duel => {
    const duel: Duel = {
        id: `duel_${Date.now()}`,
        challengerId,
        challengerName,
        opponentId: null,
        opponentName: null,
        challenge,
        status: 'pending',
        startDate: null,
        endDate: null,
        challengerProgress: 0,
        opponentProgress: 0,
        winnerId: null
    };

    const duels = loadDuels();
    duels.push(duel);
    saveDuels(duels);

    return duel;
};

// Join a duel
export const joinDuel = (duelId: string, opponentId: string, opponentName: string): Duel | null => {
    const duels = loadDuels();
    const duel = duels.find(d => d.id === duelId);

    if (!duel || duel.status !== 'pending') return null;

    duel.opponentId = opponentId;
    duel.opponentName = opponentName;
    duel.status = 'active';
    duel.startDate = new Date().toISOString();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duel.challenge.duration);
    duel.endDate = endDate.toISOString();

    saveDuels(duels);
    return duel;
};

// Update duel progress
export const updateDuelProgress = (
    duelId: string,
    participantId: string,
    progress: number
): Duel | null => {
    const duels = loadDuels();
    const duel = duels.find(d => d.id === duelId);

    if (!duel || duel.status !== 'active') return null;

    if (participantId === duel.challengerId) {
        duel.challengerProgress = progress;
    } else if (participantId === duel.opponentId) {
        duel.opponentProgress = progress;
    }

    // Check if duel is complete
    const now = new Date();
    const endDate = duel.endDate ? new Date(duel.endDate) : null;

    if (endDate && now >= endDate) {
        duel.status = 'completed';

        // Determine winner
        if (duel.challengerProgress >= duel.challenge.target && duel.opponentProgress < duel.challenge.target) {
            duel.winnerId = duel.challengerId;
        } else if (duel.opponentProgress >= duel.challenge.target && duel.challengerProgress < duel.challenge.target) {
            duel.winnerId = duel.opponentId;
        } else if (duel.challengerProgress > duel.opponentProgress) {
            duel.winnerId = duel.challengerId;
        } else if (duel.opponentProgress > duel.challengerProgress) {
            duel.winnerId = duel.opponentId;
        }
        // If tie, no winner
    }

    saveDuels(duels);
    return duel;
};

// Create a group
export const createGroup = (name: string, ownerId: string, ownerName: string): Group => {
    const group: Group = {
        id: `group_${Date.now()}`,
        name,
        code: generateGroupCode(),
        ownerId,
        members: [{
            id: ownerId,
            name: ownerName,
            streak: 0,
            weeklyXp: 0,
            rank: 1
        }],
        createdAt: new Date().toISOString()
    };

    const groups = loadGroups();
    groups.push(group);
    saveGroups(groups);

    return group;
};

// Generate 6-char invite code
const generateGroupCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Join group by code
export const joinGroupByCode = (
    code: string,
    memberId: string,
    memberName: string
): Group | null => {
    const groups = loadGroups();
    const group = groups.find(g => g.code.toUpperCase() === code.toUpperCase());

    if (!group) return null;
    if (group.members.some(m => m.id === memberId)) return group; // Already member

    group.members.push({
        id: memberId,
        name: memberName,
        streak: 0,
        weeklyXp: 0,
        rank: group.members.length + 1
    });

    saveGroups(groups);
    return group;
};

// Update member stats in group
export const updateGroupMemberStats = (
    groupId: string,
    memberId: string,
    streak: number,
    weeklyXp: number
): Group | null => {
    const groups = loadGroups();
    const group = groups.find(g => g.id === groupId);

    if (!group) return null;

    const member = group.members.find(m => m.id === memberId);
    if (member) {
        member.streak = streak;
        member.weeklyXp = weeklyXp;
    }

    // Recalculate ranks
    group.members.sort((a, b) => b.weeklyXp - a.weeklyXp);
    group.members.forEach((m, i) => m.rank = i + 1);

    saveGroups(groups);
    return group;
};

// Get leaderboard for group
export const getGroupLeaderboard = (groupId: string): GroupMember[] => {
    const groups = loadGroups();
    const group = groups.find(g => g.id === groupId);

    if (!group) return [];

    return [...group.members].sort((a, b) => b.weeklyXp - a.weeklyXp);
};
