import React, { useEffect, useState } from 'react';
import { loadRestorationState } from '../services/badHabitService';
import { RestorationState, RestorationBranch } from '../types';
import { GLASS_PANEL } from '../constants';
import { Icons } from './Icons';

// Simple procedural tree visualization
const TreeBranch = ({ branch, index, total }: { branch: RestorationBranch, index: number, total: number }) => {
    // Calculate angle to spread branches smoothly
    const angle = (index / total) * 180 - 90; // Spread across top semi-circle

    // Visual styles based on status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'withered': return '#9CA3AF'; // Gray
            case 'sprouting': return '#10B981'; // Green
            case 'blooming': return '#F59E0B'; // Amber/Flower
            case 'thriving': return '#3B82F6'; // Blue/Magic
            default: return '#6B7280';
        }
    };

    const color = getStatusColor(branch.status);
    const height = 40 + (branch.level * 5); // Grow taller with levels

    return (
        <div
            className="absolute bottom-0 left-1/2 origin-bottom transition-all duration-1000 ease-out"
            style={{
                transform: `translateX(-50%) rotate(${angle}deg)`,
                height: `${height}px`,
                width: `${4 + branch.level}px`,
                backgroundColor: color,
                opacity: branch.status === 'withered' ? 0.5 : 1
            }}
        >
            {/* Leaf/Bloom at tip */}
            <div
                className={`absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500`}
                style={{ transform: `rotate(${-angle}deg)` }} // Keep icon upright
            >
                <Icons.Leaf size={12 + branch.level} color={color} fill={color} />
            </div>

            {/* Label on hover/tap */}
            <div className="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none">
                {branch.name} (Lvl {branch.level})
            </div>
        </div>
    );
};

export const RestorationTree = () => {
    const [state, setState] = useState<RestorationState | null>(null);

    useEffect(() => {
        setState(loadRestorationState());

        // Listen for updates (custom event or just polling/props)
        const interval = setInterval(() => {
            setState(loadRestorationState());
        }, 2000); // Poll for demo simplicity

        return () => clearInterval(interval);
    }, []);

    if (!state) return null;

    const branches = Object.values(state.branches);

    return (
        <div className={`${GLASS_PANEL} p-6 mb-4 flex flex-col items-center overflow-hidden relative min-h-[200px]`}>
            <div className="absolute top-2 left-4">
                <h3 className="text-[#00D4AA] font-bold text-lg">Restoration</h3>
                <p className="text-white/50 text-xs">Abstain to heal</p>
            </div>

            {/* Tree Container */}
            <div className="mt-8 relative w-40 h-32">
                {/* Trunk */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-10 bg-[#5D4037] rounded-sm" />

                {/* Branches */}
                {branches.map((branch, i) => (
                    <TreeBranch key={branch.id} branch={branch} index={i} total={branches.length} />
                ))}

                {/* Ground */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-2 bg-[#00D4AA]/20 rounded-full blur-sm" />
            </div>

            {/* Legend / Stats */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4">
                {branches.map(b => (
                    <div key={b.id} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded">
                        <span className="text-white/70">{b.name}</span>
                        <span className="font-mono text-[#00D4AA]">
                            {b.xp}/{b.maxXP} XP
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
