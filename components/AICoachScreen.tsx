import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { generateCoachResponse, CoachContext } from '../services/geminiService';
import { UserSettings, StreakData, DailyLog } from '../types';
import { playSound } from '../services/soundService';
import { triggerHaptic } from '../services/hapticService';
import { getWeeklySummary } from '../services/storageService';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md border border-white/10';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
}

interface AICoachScreenProps {
    user: UserSettings;
    streak: StreakData;
    logs: DailyLog[];
    onClose: () => void;
}

export const AICoachScreen = ({ user, streak, logs, onClose }: AICoachScreenProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            triggerGreeting();
        }
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const buildContext = (): CoachContext => {
        const summary = getWeeklySummary(logs);
        const last7 = logs.slice(-7).map(l =>
            `${l.date}: ${l.closed ? '✅' : '❌'} (Mood: ${l.checkIn?.mood || '?'})`
        ).join('\n');

        return {
            userName: user.name,
            goal: user.goal,
            streak: streak.currentStreak,
            completionRate: summary.habitCompletionRate,
            last7DaysStats: `Avg Steps: ${summary.avgSteps}, Avg Sleep: ${summary.avgSleep}h`,
            recentLogsSummary: last7
        };
    };

    const triggerGreeting = async () => {
        setIsTyping(true);
        const context = buildContext();
        // Simulate "thinking"
        setTimeout(async () => {
            const greeting = await generateCoachResponse([], context, "Start conversation. Analyze my recent stats and greet me.");
            addMessage('assistant', greeting);
            setIsTyping(false);
            playSound('pop');
        }, 1500);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input.trim();
        setInput('');
        addMessage('user', userText);

        setIsTyping(true);
        triggerHaptic('light');

        try {
            const context = buildContext();
            const history = messages.map(m => ({ role: m.role, content: m.text }));
            const reply = await generateCoachResponse(history, context, userText);

            addMessage('assistant', reply);
            playSound('pop');
            triggerHaptic('medium');
        } catch (e) {
            console.error(e);
            addMessage('assistant', "Connection lost. I'm training offline right now.");
        } finally {
            setIsTyping(false);
        }
    };

    const addMessage = (role: 'user' | 'assistant', text: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role,
            text,
            timestamp: new Date()
        }]);
    };

    return (
        <div className="flex flex-col h-full bg-[#0d0d0d] relative overflow-hidden">
            {/* Header */}
            <div className={`${GLASS_PANEL} p-4 pt-safe flex items-center justify-between z-10 shrink-0`}>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4AA] to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,170,0.5)]">
                        <Icons.Brain size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">AI Coach</h3>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
                            <span className="text-xs text-white/50">Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                    <Icons.X size={24} className="text-white/70" />
                </button>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                {messages.map(m => (
                    <div
                        key={m.id}
                        className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed animate-scale-in ${m.role === 'user'
                                    ? 'bg-[#00D4AA] text-black rounded-tr-none font-medium'
                                    : 'bg-[#1C1C1E] border border-white/10 text-white rounded-tl-none'
                                }`}
                        >
                            {m.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start w-full">
                        <div className="bg-[#1C1C1E] border border-white/10 p-4 rounded-2xl rounded-tl-none flex space-x-1 items-center">
                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className={`p-4 pb-safe ${GLASS_PANEL} border-none shrink-0`}>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for advice..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4AA]/50 text-white placeholder:text-white/20 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`p-3 rounded-xl transition-all ${input.trim()
                                ? 'bg-[#00D4AA] text-black hover:bg-[#00D4AA]/80 shadow-[0_0_15px_rgba(0,212,170,0.3)]'
                                : 'bg-white/5 text-white/20'
                            }`}
                    >
                        <Icons.Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
