import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-[#1C1C1E]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]';
const ACCENT_BUTTON = 'bg-[#00D4AA] text-black font-bold rounded-xl hover:bg-[#00D4AA]/90 transition shadow-[0_0_20px_rgba(0,212,170,0.3)]';

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { language } = useLanguage();
    const isRu = language === 'ru';

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none pb-[calc(env(safe-area-inset-bottom)+20px)] px-4">
            <div className={`${GLASS_PANEL} p-5 w-full max-w-sm pointer-events-auto animate-slide-up flex flex-col items-center text-center`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4AA] to-black mb-4 shadow-lg flex items-center justify-center border border-white/10">
                    <span className="text-3xl">🚀</span>
                </div>

                <h3 className="text-xl font-bold mb-2">
                    {isRu ? 'Установи приложение' : 'Install App'}
                </h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                    {isRu
                        ? 'Добавь на домашний экран для быстрого доступа и работы без интернета.'
                        : 'Add to home screen for quick access and offline performance.'}
                </p>

                <div className="flex w-full space-x-3">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-1 py-3 rounded-xl bg-white/5 font-medium hover:bg-white/10 transition"
                    >
                        {isRu ? 'Позже' : 'Later'}
                    </button>
                    <button
                        onClick={handleInstall}
                        className={`flex-[2] py-3 ${ACCENT_BUTTON}`}
                    >
                        {isRu ? 'Установить' : 'Install'}
                    </button>
                </div>
            </div>
        </div>
    );
};
