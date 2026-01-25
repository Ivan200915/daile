import React, { useState } from 'react';
import { Icons, BRAND_COLORS } from './Icons';
import IconBadge from './IconBadge';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-[#1A1A1A] border border-white/10 rounded-3xl';
const ACCENT_GRADIENT = 'bg-gradient-to-r from-[#00D4AA] to-[#00A383]';

interface PremiumPaywallProps {
    onClose: () => void;
    onPurchase: () => void;
}

export const PremiumPaywall: React.FC<PremiumPaywallProps> = ({ onClose, onPurchase }) => {
    const [plan, setPlan] = useState<'yearly' | 'weekly'>('yearly');
    const { language } = useLanguage();
    const isRu = language === 'ru';

    const benefits = isRu ? [
        { icon: Icons.Zap, label: 'Детальный анализ лица', desc: 'Симметрия, линия челюсти, качество кожи' },
        { icon: Icons.Star, label: 'Персональный план улучшений', desc: 'Индивидуальные рекомендации для твоей внешности' },
        { icon: Icons.Camera, label: 'Безлимитные сканы', desc: 'Отслеживай прогресс каждый день' },
        { icon: Icons.Trophy, label: 'Приоритетная обработка', desc: 'Мгновенные результаты без очереди' },
    ] : [
        { icon: Icons.Zap, label: 'Detailed Face Analysis', desc: 'Symmetry, jawline, skin quality scores' },
        { icon: Icons.Star, label: 'Personalized Glow-up Plan', desc: 'Tailored routines to improve your looks' },
        { icon: Icons.Camera, label: 'Unlimited Scans', desc: 'Track your progress daily' },
        { icon: Icons.Trophy, label: 'Priority Processing', desc: 'Get results instantly, skip the queue' },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-blackflex flex-col animate-fade-in overflow-y-auto no-scrollbar bg-black">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00D4AA]/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 p-2 bg-white/10 rounded-full backdrop-blur-md text-white/50 hover:text-white transition"
            >
                <Icons.X size={20} />
            </button>

            {/* Hero Section */}
            <div className="flex-1 flex flex-col px-6 pt-12 pb-6 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-[#00D4AA]/10 rounded-full mb-6 relative">
                        <div className="absolute inset-0 bg-[#00D4AA]/20 blur-xl rounded-full animate-pulse" />
                        <Icons.Crown size={48} className="text-[#00D4AA] relative z-10" />
                    </div>
                    <h1 className="text-4xl font-black mb-3 leading-tight">
                        {isRu ? 'Раскрой свой' : 'Unlock Your'} <br />
                        <span className="text-[#00D4AA]">{isRu ? 'потенциал' : 'Full Potential'}</span>
                    </h1>
                    <p className="text-white/60 text-lg">
                        {isRu
                            ? 'Присоединяйся к 1% мужчин, улучшающих внешность каждый день.'
                            : 'Join the top 1% of men improving their aesthetics daily.'
                        }
                    </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 mb-8">
                    {benefits.map((b, i) => (
                        <div key={i} className="flex items-center space-x-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                            <IconBadge icon={b.icon} size="sm" color="#00D4AA" variant="circle" glowIntensity="medium" />
                            <div>
                                <p className="font-bold text-sm">{b.label}</p>
                                <p className="text-xs text-white/50">{b.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8 mt-auto">
                    <button
                        onClick={() => setPlan('weekly')}
                        className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-32 text-left ${plan === 'weekly' ? 'border-[#00D4AA] bg-[#00D4AA]/10' : 'border-white/10 bg-white/5'}`}
                    >
                        <div className="flex justify-between items-start w-full">
                            <span className="text-sm font-bold text-white/70">{isRu ? 'Неделя' : 'Weekly'}</span>
                            {plan === 'weekly' && <Icons.CheckCircle size={16} className="text-[#00D4AA]" />}
                        </div>
                        <div>
                            <span className="text-2xl font-bold">$4.99</span>
                            <span className="text-xs text-white/50 block">{isRu ? '/ неделю' : '/ week'}</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setPlan('yearly')}
                        className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-32 text-left overflow-hidden ${plan === 'yearly' ? 'border-[#00D4AA] bg-[#00D4AA]/10' : 'border-white/10 bg-white/5'}`}
                    >
                        {/* Best Value Badge */}
                        <div className="absolute top-0 right-0 bg-[#00D4AA] text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                            {isRu ? 'ВЫГОДНО' : 'BEST VALUE'}
                        </div>

                        <div className="flex justify-between items-start w-full">
                            <span className="text-sm font-bold text-white/70">{isRu ? 'Год' : 'Yearly'}</span>
                            {plan === 'yearly' && <Icons.CheckCircle size={16} className="text-[#00D4AA]" />}
                        </div>
                        <div>
                            <span className="text-2xl font-bold">$29.99</span>
                            <span className="text-xs text-white/50 block">{isRu ? '/ год (~$0.57/нед)' : '/ year ($0.57/wk)'}</span>
                        </div>
                    </button>
                </div>

                {/* Sticky Bottom Actions */}
                <div className="space-y-4">
                    <button
                        onClick={onPurchase}
                        className={`w-full py-4 ${ACCENT_GRADIENT} text-black font-bold rounded-2xl text-xl shadow-[0_0_30px_rgba(0,212,170,0.4)] transition hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        {isRu ? 'Продолжить' : 'Continue'}
                    </button>
                    <p className="text-xs text-center text-white/30">
                        {isRu
                            ? 'Автопродление. Отмена в любое время.'
                            : 'Recurring billing. Cancel anytime.'
                        } <br />
                        <span className="underline mt-2 inline-block">{isRu ? 'Восстановить покупки' : 'Restore Purchases'}</span> • <span className="underline">{isRu ? 'Условия' : 'Terms'}</span> • <span className="underline">{isRu ? 'Политика' : 'Privacy'}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
