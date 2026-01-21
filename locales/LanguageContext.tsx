// Language Context with Telegram Mini App auto-detection

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, Translations } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'daily-discipline-language';

// Detect language from Telegram Mini App
const detectTelegramLanguage = (): Language | null => {
    try {
        // @ts-ignore - Telegram WebApp global
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.language_code) {
            const code = tg.initDataUnsafe.user.language_code.toLowerCase();
            // Map Telegram language codes to our supported languages
            if (code === 'ru' || code === 'uk' || code === 'be') {
                return 'ru'; // Russian, Ukrainian, Belarusian → Russian
            }
            return 'en'; // All other languages → English
        }
    } catch (e) {
        console.log('Not running in Telegram Mini App');
    }
    return null;
};

// Detect from browser settings
const detectBrowserLanguage = (): Language => {
    const browserLang = navigator.language?.toLowerCase() || 'en';
    if (browserLang.startsWith('ru') || browserLang.startsWith('uk') || browserLang.startsWith('be')) {
        return 'ru';
    }
    return 'en';
};

// Get initial language
const getInitialLanguage = (): Language => {
    // 1. Check localStorage (user preference)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ru') {
        return stored;
    }

    // 2. Check Telegram
    const telegramLang = detectTelegramLanguage();
    if (telegramLang) {
        return telegramLang;
    }

    // 3. Fallback to browser
    return detectBrowserLanguage();
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    // Set language and persist to storage
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    // Re-detect on mount (for Telegram) - with delay for WebApp to initialize
    useEffect(() => {
        const detectAndSet = () => {
            const telegramLang = detectTelegramLanguage();
            if (telegramLang && !localStorage.getItem(STORAGE_KEY)) {
                setLanguageState(telegramLang);
            }
        };

        // Try immediately
        detectAndSet();

        // Also try after a short delay (Telegram WebApp may initialize async)
        const timer = setTimeout(detectAndSet, 100);

        // And listen for Telegram WebApp ready event
        // @ts-ignore
        if (window.Telegram?.WebApp) {
            // @ts-ignore
            window.Telegram.WebApp.ready();
        }

        return () => clearTimeout(timer);
    }, []);

    const value: LanguageContextType = {
        language,
        setLanguage,
        t: translations[language],
        isRTL: false, // No RTL languages supported yet
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook to use translations
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Shortcut hook for just translations
export const useTranslations = (): Translations => {
    const { t } = useLanguage();
    return t;
};

// Language names for display
export const LANGUAGE_NAMES: Record<Language, string> = {
    en: 'English',
    ru: 'Русский',
};

export const AVAILABLE_LANGUAGES: Language[] = ['en', 'ru'];
