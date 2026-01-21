// Premium Context - Global Premium Status Provider
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPremiumStatus } from './premiumService';

interface PremiumContextType {
    isPremium: boolean;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
    isPremium: false,
    isLoading: true,
    refresh: async () => { }
});

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = async () => {
        setIsLoading(true);
        const status = await getPremiumStatus();
        setIsPremium(status.isPremium);
        setIsLoading(false);
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <PremiumContext.Provider value={{ isPremium, isLoading, refresh }}>
            {children}
        </PremiumContext.Provider>
    );
};

// Premium Gate Component - shows upgrade prompt for non-premium users
export const PremiumGate = ({
    children,
    fallback,
    feature = 'эту функцию'
}: {
    children: ReactNode,
    fallback?: ReactNode,
    feature?: string
}) => {
    const { isPremium, isLoading } = usePremium();

    if (isLoading) {
        return <div className="animate-pulse bg-white/10 rounded-xl h-24" />;
    }

    if (isPremium) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    // Default upgrade prompt
    return (
        <div className="relative">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/40 rounded-xl flex items-center justify-center z-10">
                <div className="text-center p-4">
                    <span className="text-3xl mb-2 block">⭐</span>
                    <p className="text-sm font-semibold mb-1">Premium</p>
                    <p className="text-xs text-white/60">Разблокируй {feature}</p>
                    <a
                        href="https://web.tribute.tg/p/pXj"
                        target="_blank"
                        className="inline-block mt-3 px-4 py-2 bg-[#00D4AA] text-black text-xs font-bold rounded-lg"
                    >
                        Улучшить
                    </a>
                </div>
            </div>
            <div className="opacity-30 pointer-events-none">
                {children}
            </div>
        </div>
    );
};
