// HabitCard Component - Supports boolean, counter, and timer habit types
import React, { useState, useEffect, useRef } from 'react';
import { Habit } from '../types';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { AVAILABLE_HABITS } from '../constants';
import { playSound } from '../services/soundService';
import { triggerHaptic } from '../services/hapticService';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl border border-white/15';

interface HabitCardProps {
    habit: Habit;
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Habit>) => void;
}

export const HabitCard = ({ habit, onToggle, onUpdate }: HabitCardProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    const habitDef = AVAILABLE_HABITS.find(h => h.id === habit.id);
    // @ts-ignore
    const Icon = habitDef && habitDef.iconId && Icons[habitDef.iconId] ? Icons[habitDef.iconId] : Icons.Star;

    const habitType = habit.type || (habitDef?.type as string) || 'boolean';
    const target = habit.target || (habitDef && 'target' in habitDef ? habitDef.target : 1) || 1;
    const current = habit.current || 0;
    const unit = isRu
        ? (habit.unitRu || (habitDef && 'unitRu' in habitDef ? habitDef.unitRu : '') || '')
        : (habit.unit || (habitDef && 'unit' in habitDef ? habitDef.unit : '') || '');
    const label = isRu ? (habit.labelRu || habitDef?.labelRu || habit.label) : habit.label;

    // Timer state
    const [timerActive, setTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => {
                setTimerSeconds(prev => {
                    const newVal = prev + 1;
                    const targetSeconds = target * 60;
                    if (newVal >= targetSeconds) {
                        setTimerActive(false);
                        onUpdate(habit.id, { current: target, completed: true });
                        playSound('success');
                        triggerHaptic('success');
                        return targetSeconds;
                    }
                    return newVal;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timerActive, target, habit.id, onUpdate]);

    const handleCounterIncrement = () => {
        const newCurrent = Math.min(current + 1, target);
        const completed = newCurrent >= target;
        playSound('click');
        triggerHaptic('medium');
        if (completed) {
            playSound('success');
            triggerHaptic('success');
        }
        onUpdate(habit.id, { current: newCurrent, completed });
    };

    const handleCounterDecrement = () => {
        const newCurrent = Math.max(current - 1, 0);
        playSound('click');
        triggerHaptic('light');
        onUpdate(habit.id, { current: newCurrent, completed: false });
    };

    const handleTimerToggle = () => {
        if (!timerActive) {
            playSound('toggle_on');
            triggerHaptic('medium');
        } else {
            playSound('toggle_off');
            triggerHaptic('light');
        }
        setTimerActive(!timerActive);
    };

    const handleBooleanToggle = () => {
        if (!habit.completed) {
            playSound('success');
            triggerHaptic('success');
        } else {
            triggerHaptic('light'); // Unchecking is less celebratory
        }
        onToggle(habit.id);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = habitType === 'counter'
        ? (current / target) * 100
        : habitType === 'timer'
            ? (timerSeconds / (target * 60)) * 100
            : habit.completed ? 100 : 0;

    // Boolean type - simple toggle
    if (habitType === 'boolean') {
        return (
            <button
                onClick={() => onToggle(habit.id)}
                className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${habit.completed ? 'bg-[#00D4AA] border-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.3)]' : 'bg-white/5 border-white/10'}`}
            >
                <div className="flex items-center space-x-3">
                    <IconBadge
                        icon={Icon}
                        size="sm"
                        variant="circle"
                        color={habit.completed ? '#000000' : '#00D4AA'}
                        className={habit.completed ? 'bg-black/10' : 'bg-white/10'}
                    />
                    <span className={`font-medium ${habit.completed ? 'text-black' : 'text-white'}`}>
                        {label}
                    </span>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${habit.completed ? 'border-black/20 bg-black/10' : 'border-white/30'}`}>
                    {habit.completed && <Icons.Check size={14} className="text-black" />}
                </div>
            </button>
        );
    }

    // Counter type - increment/decrement buttons
    if (habitType === 'counter') {
        return (
            <div className={`w-full p-4 rounded-2xl border transition-all duration-300 ${habit.completed ? 'bg-[#00D4AA] border-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.3)]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <IconBadge
                            icon={Icon}
                            size="sm"
                            variant="circle"
                            color={habit.completed ? '#000000' : '#00D4AA'}
                            className={habit.completed ? 'bg-black/10' : 'bg-white/10'}
                        />
                        <span className={`font-medium ${habit.completed ? 'text-black' : 'text-white'}`}>
                            {label}
                        </span>
                    </div>
                    <span className={`text-sm font-mono ${habit.completed ? 'text-black/70' : 'text-white/50'}`}>
                        {current}/{target} {unit}
                    </span>
                </div>

                {/* Progress bar */}
                <div className={`h-2 rounded-full ${habit.completed ? 'bg-black/20' : 'bg-white/10'} mb-3 overflow-hidden`}>
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${habit.completed ? 'bg-black/40' : 'bg-[#00D4AA]'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Counter controls */}
                <div className="flex items-center justify-center space-x-4">
                    <button
                        onClick={handleCounterDecrement}
                        disabled={current <= 0}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${habit.completed ? 'bg-black/10 text-black disabled:opacity-30' : 'bg-white/10 text-white disabled:opacity-30 hover:bg-white/20'}`}
                    >
                        <Icons.Minus size={20} />
                    </button>
                    <span className={`text-3xl font-bold font-mono min-w-[60px] text-center ${habit.completed ? 'text-black' : 'text-white'}`}>
                        {current}
                    </span>
                    <button
                        onClick={handleCounterIncrement}
                        disabled={current >= target}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${habit.completed ? 'bg-black/10 text-black disabled:opacity-30' : 'bg-[#00D4AA] text-black hover:bg-[#00D4AA]/80'}`}
                    >
                        <Icons.Plus size={20} />
                    </button>
                </div>
            </div>
        );
    }

    // Timer type - start/pause button with countdown
    if (habitType === 'timer') {
        const targetSeconds = target * 60;
        const remaining = targetSeconds - timerSeconds;

        return (
            <div className={`w-full p-4 rounded-2xl border transition-all duration-300 ${habit.completed ? 'bg-[#00D4AA] border-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.3)]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <IconBadge
                            icon={Icon}
                            size="sm"
                            variant="circle"
                            color={habit.completed ? '#000000' : '#00D4AA'}
                            className={habit.completed ? 'bg-black/10' : 'bg-white/10'}
                        />
                        <span className={`font-medium ${habit.completed ? 'text-black' : 'text-white'}`}>
                            {label}
                        </span>
                    </div>
                    <span className={`text-sm font-mono ${habit.completed ? 'text-black/70' : 'text-white/50'}`}>
                        {target} {unit}
                    </span>
                </div>

                {/* Progress bar */}
                <div className={`h-2 rounded-full ${habit.completed ? 'bg-black/20' : 'bg-white/10'} mb-3 overflow-hidden`}>
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${habit.completed ? 'bg-black/40' : 'bg-[#00D4AA]'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Timer display and controls */}
                <div className="flex items-center justify-center space-x-4">
                    <span className={`text-3xl font-bold font-mono ${habit.completed ? 'text-black' : 'text-white'}`}>
                        {habit.completed ? '✓' : formatTime(remaining)}
                    </span>
                    {!habit.completed && (
                        <button
                            onClick={handleTimerToggle}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${timerActive ? 'bg-orange-500 text-white' : 'bg-[#00D4AA] text-black'}`}
                        >
                            {timerActive ? <Icons.Pause size={20} /> : <Icons.Play size={20} />}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default HabitCard;
