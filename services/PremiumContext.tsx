// Premium Context - Global Premium Status Provider
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPremiumStatus } from './premiumService';
import { PremiumPaywall } from '../components/PremiumPaywall';

interface PremiumContextType {
    isPremium: boolean;
    isLoading: boolean;
    refresh: () => Promise<void>;
    openPaywall: () => void;
}

const PremiumContext = createContext<PremiumContextType>({
    isPremium: false,
    isLoading: true,
    refresh: async () => { },
    openPaywall: () => { }
});

export const usePremium = () => useContext(PremiumContext);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaywall, setShowPaywall] = useState(false);

    const refresh = async () => {
        setIsLoading(true);
        const status = await getPremiumStatus();
        setIsPremium(status.isPremium);
        setIsLoading(false);
    };

    const openPaywall = () => setShowPaywall(true);

    useEffect(() => {
        refresh();
    }, []);

    return (
        <PremiumContext.Provider value={{ isPremium, isLoading, refresh, openPaywall }}>
            {children}
            {showPaywall && (
                <PremiumPaywall
                    onClose={() => setShowPaywall(false)}
                    onPurchase={async () => {
                        await refresh();
                        setShowPaywall(false);
                    }}
                />
            )}
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
    const { isPremium, isLoading, openPaywall } = usePremium();

    if (isLoading) {
        return <div className="animate-pulse bg-white/10 rounded-xl h-24" />;
    }

    if (isPremium) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="relative">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/40 rounded-xl flex items-center justify-center z-10">
                <div className="text-center p-4">
                    <span className="text-3xl mb-2 block text-yellow-400">★</span>
                    <p className="text-sm font-semibold mb-1">Premium</p>
                    <p className="text-xs text-white/60">Разблокируй {feature}</p>
                    <button
                        onClick={openPaywall}
                        className="inline-block mt-3 px-4 py-2 bg-[#00D4AA] text-black text-xs font-bold rounded-lg hover:scale-105 transition"
                    >
                        Улучшить
                    </button>
                </div>
            </div>
            <div className="opacity-30 pointer-events-none select-none filter blur-sm">
                {children}
            </div>
        </div>
    );
};
