import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const ACCENT_BUTTON = 'bg-[#00D4AA] text-black font-bold rounded-2xl hover:bg-[#00D4AA]/90 transition shadow-[0_0_20px_rgba(0,212,170,0.3)]';

export const MewingTools = () => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const { language } = useLanguage();
    const isRu = language === 'ru';

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setSeconds(0);
        setIsActive(false);
    };

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex-1 flex flex-col p-6 pt-32 overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 96px)' }}>
            <h2 className="text-3xl font-bold mb-6 text-center">
                {isRu ? 'Инструменты для лица' : 'Jawline Tools'}
            </h2>

            {/* Timer Card */}
            <div className={`${GLASS_PANEL} p-8 flex flex-col items-center mb-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => setShowGuide(true)} className="text-white/50 hover:text-white">
                        <Icons.Info size={24} />
                    </button>
                </div>

                <div className="w-48 h-48 rounded-full border-4 border-[#00D4AA]/30 flex items-center justify-center mb-8 relative">
                    {isActive && (
                        <div className="absolute inset-0 border-4 border-[#00D4AA] rounded-full animate-spin-slow border-t-transparent" />
                    )}
                    <span className="text-5xl font-mono font-bold font-variant-numeric">{formatTime(seconds)}</span>
                </div>

                <div className="flex space-x-4 w-full">
                    <button
                        onClick={toggleTimer}
                        className={`flex-1 py-4 ${isActive ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-[#00D4AA] text-black'} font-bold rounded-2xl text-lg flex items-center justify-center space-x-2 transition`}
                    >
                        {isActive ? (
                            <>
                                <Icons.Pause size={20} />
                                <span>{isRu ? 'Пауза' : 'Pause'}</span>
                            </>
                        ) : (
                            <>
                                <Icons.Play size={20} />
                                <span>{isRu ? 'Начать мьюинг' : 'Start Mewing'}</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="p-4 bg-white/10 rounded-2xl text-white/70 hover:bg-white/20 transition"
                    >
                        <Icons.RotateCcw size={24} />
                    </button>
                </div>
            </div>

            {/* Daily Tips */}
            <h3 className="text-lg font-bold mb-3">{isRu ? 'Советы' : 'Daily Tips'}</h3>
            <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start space-x-3">
                    <div className="p-2 bg-[#00D4AA]/20 rounded-lg text-[#00D4AA]">
                        <Icons.CheckCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">{isRu ? 'Положение языка' : 'Tongue Posture'}</h4>
                        <p className="text-xs text-white/60">
                            {isRu
                                ? 'Прижми весь язык к нёбу, особенно заднюю треть.'
                                : 'Press your entire tongue against the roof of your mouth, specifically the posterior third.'
                            }
                        </p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start space-x-3">
                    <div className="p-2 bg-[#00D4AA]/20 rounded-lg text-[#00D4AA]">
                        <Icons.CheckCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">{isRu ? 'Положение зубов' : 'Teeth Position'}</h4>
                        <p className="text-xs text-white/60">
                            {isRu
                                ? 'Держи зубы слегка касающимися или немного разведи. Не сжимай.'
                                : 'Keep your teeth lightly touching or slightly apart. Do not clench.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Guide Modal */}
            {showGuide && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowGuide(false)}>
                    <div className={`${GLASS_PANEL} p-6 w-full max-w-sm bg-[#1A1A1A]`} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{isRu ? 'Что такое мьюинг?' : 'What is Mewing?'}</h3>
                            <button onClick={() => setShowGuide(false)}><Icons.X size={24} className="text-white/50" /></button>
                        </div>
                        <p className="text-white/70 text-sm mb-4 leading-relaxed">
                            {isRu
                                ? 'Мьюинг — это техника правильного положения языка, которая помогает улучшить линию челюсти со временем. Цель — держать язык на нёбе, а не внизу рта.'
                                : 'Mewing is a technique of proper tongue posture that can define your jawline over time. The goal is to rest your tongue on the roof of your mouth rather than the bottom.'
                            }
                        </p>
                        <h4 className="font-bold text-[#00D4AA] mb-2">{isRu ? 'Как делать:' : 'How to do it:'}</h4>
                        <ol className="list-decimal list-inside text-sm text-white/70 space-y-2 mb-6">
                            <li>{isRu ? 'Закрой губы.' : 'Close your lips.'}</li>
                            <li>{isRu ? 'Подвинь челюсть так, чтобы нижние зубы были за верхними.' : 'Move your jaw so your front bottom teeth are just behind your front upper teeth.'}</li>
                            <li>{isRu ? 'Покрой нёбо языком.' : 'Cover the roof of your mouth with your tongue.'}</li>
                            <li>{isRu ? 'Кончик языка за передними зубами, не касаясь их.' : 'Place the tip of your tongue right behind your front teeth without touching them.'}</li>
                        </ol>
                        <button onClick={() => setShowGuide(false)} className={`w-full py-3 ${ACCENT_BUTTON}`}>
                            {isRu ? 'Понятно' : 'Got it'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
