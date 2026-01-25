// AIInsightsDashboard - Enhanced AI-powered insights widget
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../locales/LanguageContext';
import {
    CorrelationInsight,
    PersonalRecommendation,
    analyzeCorrelations,
    generatePersonalRecommendations
} from '../services/aiInsightsService';
import { DailyLog } from '../types';

const GLASS_PANEL = 'bg-[#1C1C1E]/60 backdrop-blur-[30px] border border-white/10 rounded-[28px]';

interface AIInsightsDashboardProps {
    logs: DailyLog[];
    currentMood: number | null;
}

export const AIInsightsDashboard = ({ logs, currentMood }: AIInsightsDashboardProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const [activeTab, setActiveTab] = useState<'correlations' | 'recommendations'>('correlations');
    const [correlations, setCorrelations] = useState<CorrelationInsight[]>([]);
    const [recommendations, setRecommendations] = useState<PersonalRecommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInsights = async () => {
            setLoading(true);

            // Extract data from logs (last 7 days)
            const last7Logs = logs.slice(-7);

            const correlationData = {
                sleepHours: last7Logs.map(l => l.metrics?.sleepHours || 7),
                energyLevels: last7Logs.map(l => l.checkIn?.energy || 5),
                productivityScores: last7Logs.map(l => {
                    const total = l.habits.length;
                    const completed = l.habits.filter(h => h.completed).length;
                    return total > 0 ? Math.round((completed / total) * 100) : 50;
                }),
                moodRatings: last7Logs.map(l => l.checkIn?.mood || currentMood || 3),
                steps: last7Logs.map(l => l.metrics?.steps || 5000)
            };

            // Calculate averages for recommendations
            const avgSleep = correlationData.sleepHours.reduce((a, b) => a + b, 0) / correlationData.sleepHours.length;
            const avgSteps = correlationData.steps.reduce((a, b) => a + b, 0) / correlationData.steps.length;
            const avgMood = correlationData.moodRatings.reduce((a, b) => a + b, 0) / correlationData.moodRatings.length;
            const habitCompletion = correlationData.productivityScores.reduce((a, b) => a + b, 0) / correlationData.productivityScores.length;

            const corr = await analyzeCorrelations(correlationData, isRu);
            setCorrelations(corr);

            const recs = generatePersonalRecommendations(
                { avgSleep, avgSteps, habitCompletion, moodAvg: avgMood },
                isRu
            );
            setRecommendations(recs);

            setLoading(false);
        };

        loadInsights();
    }, [logs, isRu, currentMood]);

    const getPriorityColor = (priority: string) => {
        if (priority === 'high') return 'border-l-red-500 bg-red-500/5';
        if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-500/5';
        return 'border-l-green-500 bg-green-500/5';
    };

    const getCorrelationColor = (correlation: string) => {
        if (correlation === 'positive') return 'text-green-400';
        if (correlation === 'negative') return 'text-red-400';
        return 'text-white/50';
    };

    return (
        <div className={`${GLASS_PANEL} p-4 overflow-hidden shrink-0`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Icons.Zap size={20} className="text-[#00D4AA]" />
                    <h3 className="font-bold">{isRu ? 'AI Инсайты' : 'AI Insights'}</h3>
                </div>
                <div className="text-xs px-2 py-1 bg-[#00D4AA]/20 text-[#00D4AA] rounded-full">
                    {isRu ? 'Персонально' : 'Personal'}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-4">
                <button
                    onClick={() => setActiveTab('correlations')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'correlations'
                        ? 'bg-[#00D4AA] text-black'
                        : 'bg-white/10 text-white/70'
                        }`}
                >
                    {isRu ? '📊 Корреляции' : '📊 Correlations'}
                </button>
                <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'recommendations'
                        ? 'bg-[#00D4AA] text-black'
                        : 'bg-white/10 text-white/70'
                        }`}
                >
                    {isRu ? '💡 Советы' : '💡 Tips'}
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : activeTab === 'correlations' ? (
                <div className="space-y-3 min-h-[100px]">
                    {correlations.length > 0 ? correlations.map((insight, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">{insight.emoji}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm">{insight.pattern}</p>
                                        <span className={`text-xs font-bold ${getCorrelationColor(insight.correlation)}`}>
                                            {insight.correlation === 'positive' ? '↑' : insight.correlation === 'negative' ? '↓' : '→'}
                                            {insight.strength}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/50 mt-1">{insight.recommendation}</p>

                                    {/* Strength Bar */}
                                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${insight.correlation === 'positive' ? 'bg-green-400' :
                                                insight.correlation === 'negative' ? 'bg-red-400' : 'bg-white/30'
                                                }`}
                                            style={{ width: `${insight.strength}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                            <Icons.Activity size={32} className="mb-2" />
                            <p className="text-sm">{isRu ? 'Недостаточно данных для анализа' : 'Not enough data for analysis'}</p>
                            <p className="text-xs text-white/50 mt-1">{isRu ? 'Продолжайте вести трекинг' : 'Keep tracking to unlock insights'}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3 min-h-[100px]">
                    {recommendations.length > 0 ? recommendations.map((rec, i) => (
                        <div
                            key={i}
                            className={`rounded-xl p-3 border-l-4 ${getPriorityColor(rec.priority)}`}
                        >
                            <div className="flex items-start space-x-3">
                                <span className="text-xl">{rec.icon}</span>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{rec.title}</p>
                                    <p className="text-xs text-white/50 mt-1">{rec.description}</p>
                                    <div className="mt-2 flex items-center space-x-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                            rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-green-500/20 text-green-400'
                                            }`}>
                                            {isRu ? (rec.priority === 'high' ? 'Важно' : rec.priority === 'medium' ? 'Средне' : 'Низко') : rec.priority.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-white/30">{rec.category}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                            <Icons.Coffee size={32} className="mb-2" />
                            <p className="text-sm">{isRu ? 'Нет рекомендаций сегодня' : 'No recommendations today'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIInsightsDashboard;
