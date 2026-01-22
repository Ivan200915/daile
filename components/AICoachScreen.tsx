import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { generateCoachResponse, getInitialGreeting, getRecommendedQuestions, ChatMessage } from '../services/aiCoachService';
import { DailyLog, StreakData } from '../types';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const USER_BUBBLE = 'bg-[#00D4AA] text-black rounded-tr-none';
const AI_BUBBLE = 'bg-white/10 text-white rounded-tl-none border border-white/10';

interface AICoachScreenProps {
    logs: DailyLog[];
    streak: StreakData;
}

export const AICoachScreen = ({ logs, streak }: AICoachScreenProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: getInitialGreeting(),
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Get AI response
        const responseText = await generateCoachResponse(text, messages, { logs, streak });

        setIsTyping(false);
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseText,
            timestamp: new Date().toISOString()
        }]);
    };

    const suggestions = getRecommendedQuestions(logs);

    return (
        <div className="h-full flex flex-col bg-black/20 w-full overflow-hidden">
            {/* Header */}
            <div className={`${GLASS_PANEL} p-4 m-4 mb-2 flex items-center space-x-3 shrink-0`}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4AA] to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,170,0.3)]">
                    <Icons.Mic size={24} className="text-black" />
                </div>
                <div>
                    <h2 className="font-bold text-lg">AI Discipline Coach</h2>
                    <p className="text-xs text-white/50 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#00D4AA] mr-2 animate-pulse" />
                        Online & Watching
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 no-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2 shrink-0 mt-1">
                                <Icons.Mic size={14} />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? USER_BUBBLE : AI_BUBBLE}`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2 shrink-0">
                            <Icons.Mic size={14} />
                        </div>
                        <div className={`${AI_BUBBLE} p-4 rounded-2xl flex space-x-1 items-center h-10`}>
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (if clean slate or idle) */}
            {!isTyping && (
                <div className="px-4 py-2 flex space-x-2 overflow-x-auto no-scrollbar shrink-0">
                    {suggestions.map(q => (
                        <button
                            key={q}
                            onClick={() => handleSend(q)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition active:scale-95"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 pt-2 shrink-0">
                <div className={`${GLASS_PANEL} p-2 flex items-center space-x-2`}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                        placeholder="Ask your coach..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm px-2"
                    />
                    <button
                        onClick={() => handleSend(input)}
                        disabled={!input.trim() || isTyping}
                        className={`p-2 rounded-xl transition ${input.trim() ? 'bg-[#00D4AA] text-black hover:bg-[#00D4AA]/90' : 'bg-white/5 text-white/20'}`}
                    >
                        <Icons.ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AICoachScreen;
