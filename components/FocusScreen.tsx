// Focus Screen Component
// Full screen immersive timer for deep work sessions

import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { useFocusTimer, FocusMode } from '../services/focusService';

interface FocusScreenProps {
    onBackendExit: () => void;
    onComplete?: (minutes: number) => void;
}

const FocusScreen: React.FC<FocusScreenProps> = ({ onBackendExit, onComplete }) => {
    const { session, startTimer, pauseTimer, stopTimer, setMode, formatTime, progress } = useFocusTimer(onComplete);
    const [taskInput, setTaskInput] = useState('');
    const [isZenMode, setIsZenMode] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    // Audio Context for Brown Noise (Soundscape)
    useEffect(() => {
        let audioCtx: AudioContext | null = null;
        let gainNode: GainNode | null = null;
        let source: AudioBufferSourceNode | null = null;

        if (isSoundEnabled) {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                audioCtx = new AudioContextClass();
                const bufferSize = audioCtx.sampleRate * 2;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);

                // Brown Noise Generation
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5;
                }

                source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;

                gainNode = audioCtx.createGain();
                gainNode.gain.value = 0.05; // Gentle volume

                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                source.start();
            } catch (e) {
                console.error("Audio API not supported", e);
            }
        }

        return () => {
            if (source) source.stop();
            if (gainNode) gainNode.disconnect();
            if (audioCtx) audioCtx.close();
        };
    }, [isSoundEnabled]);

    // Radial Progress Component
    const RadialProgress = ({ size = 300, strokeWidth = 12 }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (progress / 100) * circumference;

        // Pulse animation when active
        const pulseClass = session.isActive ? 'animate-pulse-slow' : '';

        // Color based on mode
        const color = session.mode === 'focus' ? '#00D4AA' : '#3B82F6';

        return (
            <div className="relative flex items-center justify-center">
                {/* Glow effect */}
                <div
                    className={`absolute inset-0 rounded-full blur-[50px] transition-all duration-1000 ${pulseClass}`}
                    style={{
                        backgroundColor: session.isActive ? `${color}40` : 'transparent',
                        transform: 'scale(0.8)'
                    }}
                />

                <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                    {/* Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>

                {/* Time Display */}
                <div className="absolute flex flex-col items-center justify-center z-20">
                    <span className="text-6xl font-bold font-mono tracking-wider tabular-nums">
                        {formatTime(session.timeLeft)}
                    </span>
                    <span className="text-white/50 text-sm mt-2 font-medium tracking-wide uppercase">
                        {session.mode === 'focus' ? 'Focus Time' : 'Break Time'}
                    </span>
                </div>
            </div>
        );
    };

    const toggleTimer = () => {
        if (session.isActive) {
            pauseTimer();
        } else {
            if (!session.task && taskInput) {
                startTimer(taskInput);
            } else {
                startTimer();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center overflow-hidden animate-fade-in">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c] to-[#121212]" />
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#00D4AA]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Top Bar (Hidden in Zen Mode) */}
            <div className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-center transition-all duration-500 z-50 ${isZenMode ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                <button
                    onClick={onBackendExit}
                    className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white"
                >
                    <Icons.X size={24} />
                </button>

                <div className="flex bg-white/5 p-1 rounded-full backdrop-blur-md">
                    {(['focus', 'shortBreak', 'longBreak'] as FocusMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => !session.isActive && setMode(m)}
                            disabled={session.isActive}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${session.mode === m ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                        >
                            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setIsZenMode(!isZenMode)}
                    className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white"
                    title="Zen Mode"
                >
                    <Icons.Maximize2 size={20} />
                </button>

                <button
                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                    className={`p-2 hover:bg-white/10 rounded-full transition ${isSoundEnabled ? 'text-[#00D4AA]' : 'text-white/60 hover:text-white'}`}
                    title={isSoundEnabled ? "Turn Off Sound" : "Turn On Brown Noise"}
                >
                    {isSoundEnabled ? <Icons.Volume2 size={20} /> : <Icons.VolumeX size={20} />}
                </button>
            </div>

            {/* Zen Mode Exit Trigger (Invisible area at top) */}
            {isZenMode && (
                <div
                    className="absolute top-0 left-0 right-0 h-20 z-50 hover:opacity-100 opacity-0 transition-opacity flex justify-center pt-4"
                    onMouseEnter={() => setIsZenMode(false)}
                >
                    <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/70">
                        Exit Zen Mode
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">

                {/* Task Input */}
                <div className={`mb-12 w-full text-center transition-all duration-500 delay-100 ${session.isActive ? 'opacity-80 scale-100' : 'opacity-100 scale-100'}`}>
                    {!session.isActive && session.timeLeft === session.totalTime ? (
                        <input
                            type="text"
                            value={taskInput}
                            onChange={(e) => setTaskInput(e.target.value)}
                            placeholder="What are you focusing on?"
                            className="w-full bg-transparent text-center text-2xl font-light text-white placeholder-white/30 outline-none border-b border-white/10 pb-2 focus:border-[#00D4AA]/50 transition-colors"
                        />
                    ) : (
                        <h2 className="text-2xl font-medium text-white/90">{session.task || "Deep Focus"}</h2>
                    )}
                </div>

                {/* Timer */}
                <div className="mb-12">
                    <RadialProgress />
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-6">
                    {session.isActive ? (
                        <>
                            <button
                                onClick={pauseTimer}
                                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 border border-white/10"
                            >
                                <Icons.Pause size={28} />
                            </button>
                            <button
                                onClick={stopTimer}
                                className="w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all active:scale-95"
                            >
                                <Icons.Square size={20} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={toggleTimer}
                            className="w-20 h-20 rounded-full bg-[#00D4AA] text-[#1C1C1E] flex items-center justify-center shadow-[0_0_40px_rgba(0,212,170,0.3)] hover:shadow-[0_0_60px_rgba(0,212,170,0.5)] hover:scale-105 transition-all active:scale-95"
                        >
                            <Icons.Play size={32} className="ml-1" />
                        </button>
                    )}
                </div>

                {/* Helper Text */}
                <p className={`mt-12 text-white/30 text-sm transition-opacity duration-500 ${session.isActive ? 'opacity-0' : 'opacity-100'}`}>
                    +10 XP for every 25m session
                </p>
            </div>
        </div>
    );
};

export default FocusScreen;
