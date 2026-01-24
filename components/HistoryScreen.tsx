import React, { useState } from 'react';
import { Icons } from './Icons';
import IconBadge from './IconBadge';
import { DailyLog, StreakData, Habit } from '../types';
import { useLanguage } from '../locales/LanguageContext';
import { analyzeCorrelations, generateRecommendations } from '../services/analyticsService';
import { loadGamificationData } from '../services/gamificationService';
import CorrelationChart from './CorrelationChart';
import YearlyHeatmap from './YearlyHeatmap';
import WeeklyReport from './WeeklyReport';
import { PremiumGate } from '../services/PremiumContext';
import AICoachScreen from './AICoachScreen';
import SocialScreen from './SocialScreen';
import { exportLogsToCSV } from '../services/exportService';
import HabitDNA from './HabitDNA';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

const GLASS_PANEL = 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20';
const GLASS_PANEL_LIGHT = 'bg-white/5 backdrop-blur-sm rounded-xl';
const GLASS_BUTTON = 'bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition';
const ACCENT_BUTTON = 'bg-[#00D4AA] text-black font-semibold rounded-xl hover:bg-[#00D4AA]/90 transition';

interface HistoryScreenProps {
    logs: DailyLog[];
    streak: StreakData;
    onRequestWeeklyReview: () => void;
}

const HistoryScreen = ({ logs, streak, onRequestWeeklyReview }: HistoryScreenProps) => {
    const [activeTab, setActiveTab] = useState<'Calendar' | 'Stats' | 'Badges' | 'Progress' | 'AI Coach' | 'Analytics' | 'Social'>('Calendar');
    const [xMetric, setXMetric] = useState<'sleep' | 'steps' | 'active'>('sleep');
    const [yMetric, setYMetric] = useState<'mood' | 'energy'>('mood');
    const { t } = useLanguage();

    // Generate GitHub-style calendar (last 35 days, 5 weeks)
    const generateCalendarData = () => {
        const today = new Date();
        const days: { date: string; level: number; dayNum: number; isToday: boolean }[] = [];

        for (let i = 34; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = logs.find(l => l.date === dateStr);

            let level = 0;
            if (log?.closed) {
                level = 4; // Fully completed
            } else if (log) {
                const completedHabits = log.habits?.filter(h => h.completed).length || 0;
                const totalHabits = log.habits?.length || 1;
                const ratio = completedHabits / totalHabits;
                level = ratio >= 0.75 ? 3 : ratio >= 0.5 ? 2 : ratio > 0 ? 1 : 0;
            }

            days.push({
                date: dateStr,
                level,
                dayNum: d.getDate(),
                isToday: i === 0
            });
        }

        return days;
    };

    const calendarDays = generateCalendarData();

    const getColorForLevel = (level: number, isToday: boolean) => {
        if (isToday) return 'ring-2 ring-[#00D4AA] ring-offset-1 ring-offset-black';
        switch (level) {
            case 4: return 'bg-[#00D4AA]';
            case 3: return 'bg-[#00D4AA]/70';
            case 2: return 'bg-[#00D4AA]/40';
            case 1: return 'bg-[#00D4AA]/20';
            default: return 'bg-white/5';
        }
    };

    return (
        <div className="flex-1 px-5 pt-20 flex flex-col space-y-5 overflow-y-auto no-scrollbar pb-28">
            <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-bold">{t.history.title}</h2>
                {streak.freezesAvailable > 0 && (
                    <div className="flex items-center space-x-1 bg-blue-500/20 px-3 py-1 rounded-full">
                        <Icons.Snowflake size={14} className="text-blue-300" />
                        <span className="text-sm font-medium text-blue-300">{streak.freezesAvailable}</span>
                    </div>
                )}
            </div>

            {/* Tab Switcher */}
            <div className={`p-1 rounded-xl bg-white/10 flex shrink-0 overflow-x-auto no-scrollbar`}>
                {(['Calendar', 'Analytics', 'Social', 'Badges', 'AI Coach'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${activeTab === tab ? 'bg-[#00D4AA] text-black' : 'text-white/60'}`}
                    >
                        {tab === 'Analytics' ? <><Icons.BarChart2 size={12} className="inline mr-1" />Аналитика</> : tab === 'AI Coach' ? <><Icons.Mic size={12} className="inline mr-1" />Coach</> : tab === 'Social' ? <><Icons.Users size={12} className="inline mr-1" />Друзья</> : tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Calendar' && (
                <>
                    {/* GitHub-style Calendar */}
                    <div className={`${GLASS_PANEL} p-4`}>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-white/70">{t.history.activity}</h3>
                            <p className="text-xs text-white/40">{t.history.lastDays}</p>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                <div key={i} className="text-[10px] text-white/30 text-center mb-1">{d}</div>
                            ))}
                            {calendarDays.map((day, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-[3px] ${getColorForLevel(day.level, day.isToday)} ${day.isToday ? 'bg-[#00D4AA]' : ''}`}
                                    title={`${day.date}: ${day.level > 0 ? 'Active' : 'No activity'}`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-end mt-3 space-x-1">
                            <span className="text-[10px] text-white/30">{t.history.less}</span>
                            {[0, 1, 2, 3, 4].map(l => (
                                <div key={l} className={`w-3 h-3 rounded-[2px] ${l === 0 ? 'bg-white/5' : `bg-[#00D4AA]/${l * 25}`}`} />
                            ))}
                            <span className="text-[10px] text-white/30">{t.history.more}</span>
                        </div>
                    </div>

                    {/* Streak Stats with Freeze */}
                    <div className={`${GLASS_PANEL_LIGHT} p-4`}>
                        <div className="flex justify-around">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-[#00D4AA]">{streak.currentStreak}</p>
                                <p className="text-xs text-white/50 flex items-center"><Icons.Flame size={12} className="text-orange-500 mr-1" />{t.history.current}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{streak.longestStreak}</p>
                                <p className="text-xs text-white/50">{t.history.longest}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{streak.freezesAvailable}</p>
                                <p className="text-xs text-white/50 flex items-center"><Icons.Snowflake size={12} className="text-blue-400 mr-1" />{t.history.freezes}</p>
                            </div>
                        </div>

                        {streak.freezesAvailable > 0 && (
                            <p className="text-xs text-center text-white/40 mt-3">
                                {t.history.freezesHint}
                            </p>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'Stats' && (
                <>
                    {/* Quick Stats */}
                    <div className={`${GLASS_PANEL} p-4`}>
                        <h3 className="text-sm font-semibold text-white/70 mb-4">{t.history.thisWeek}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`${GLASS_PANEL_LIGHT} p-3 text-center`}>
                                <p className="text-2xl font-bold">{streak.completedDaysThisWeek}</p>
                                <p className="text-xs text-white/50">{t.history.daysCompleted}</p>
                            </div>
                            <div className={`${GLASS_PANEL_LIGHT} p-3 text-center`}>
                                <p className="text-2xl font-bold">{logs.reduce((sum, l) => sum + (l.meals?.length || 0), 0)}</p>
                                <p className="text-xs text-white/50">{t.history.mealsLogged}</p>
                            </div>
                            <div className={`${GLASS_PANEL_LIGHT} p-3 text-center`}>
                                <p className="text-2xl font-bold">
                                    {logs.length > 0 ? Math.round(logs.reduce((sum, l) => sum + (l.metrics?.steps || 0), 0) / logs.length) : 0}
                                </p>
                                <p className="text-xs text-white/50">{t.history.avgSteps}</p>
                            </div>
                            <div className={`${GLASS_PANEL_LIGHT} p-3 text-center`}>
                                <p className="text-2xl font-bold">
                                    {logs.length > 0 ? (logs.reduce((sum, l) => sum + (l.metrics?.sleepHours || 0), 0) / logs.length).toFixed(1) : 0}h
                                </p>
                                <p className="text-xs text-white/50">{t.history.avgSleep}</p>
                            </div>
                        </div>
                    </div>

                    {/* Streak Chart */}
                    <div className={`${GLASS_PANEL} p-4 h-48`}>
                        <h3 className="text-sm font-semibold mb-3 text-white/70">{t.history.completionRate}</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={calendarDays.slice(-7).map((d, i) => ({
                                name: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i % 7],
                                completed: d.level * 25
                            }))}>
                                <Bar dataKey="completed" radius={[4, 4, 4, 4]} fill="#00D4AA" />
                                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Habit DNA */}
                    <div className={`${GLASS_PANEL} p-4`}>
                        <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center">
                            <Icons.Activity size={14} className="mr-2 text-[#00D4AA]" />
                            Habit DNA
                        </h3>
                        <HabitDNA logs={logs} days={14} />
                    </div>

                    {/* AI Insights */}
                    {(() => {
                        const correlations = analyzeCorrelations(logs);
                        const recommendations = generateRecommendations(logs);
                        return (
                            <>
                                {/* Correlations */}
                                {correlations.length > 0 && (
                                    <div className={`${GLASS_PANEL} p-4`}>
                                        <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center"><Icons.Activity size={14} className="mr-2 text-purple-400" />Обнаружены паттерны</h3>
                                        <div className="space-y-2">
                                            {correlations.slice(0, 3).map((c, i) => (
                                                <div key={i} className={`${GLASS_PANEL_LIGHT} p-3`}>
                                                    <p className="text-sm">{c.insightRu}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {recommendations.length > 0 && (
                                    <div className={`${GLASS_PANEL} p-4`}>
                                        <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center"><Icons.Idea size={14} className="mr-2 text-yellow-400" />Рекомендации</h3>
                                        <div className="space-y-2">
                                            {recommendations.slice(0, 3).map((r, i) => (
                                                <div key={i} className={`${GLASS_PANEL_LIGHT} p-3 flex items-center space-x-3`}>
                                                    <span className="text-xl">{r.icon}</span>
                                                    <div>
                                                        <p className="text-sm font-medium">{r.titleRu}</p>
                                                        <p className="text-xs text-white/50">{r.descriptionRu}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </>
            )}

            {activeTab === 'Progress' && (
                <div className="space-y-4">
                    {/* Share Cards Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center"><Icons.Share size={16} className="mr-2 text-[#00D4AA]" />Поделиться успехами</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className={`${GLASS_PANEL_LIGHT} p-4 flex flex-col items-center space-y-2 hover:bg-white/10 transition`}>
                                <IconBadge icon={Icons.Flame} size="md" color="#FF6B00" variant="circle" />
                                <span className="text-xs">Стрик</span>
                            </button>
                            <button className={`${GLASS_PANEL_LIGHT} p-4 flex flex-col items-center space-y-2 hover:bg-white/10 transition`}>
                                <IconBadge icon={Icons.BarChart2} size="md" color="#3B82F6" variant="circle" />
                                <span className="text-xs">Неделя</span>
                            </button>
                            <button className={`${GLASS_PANEL_LIGHT} p-4 flex flex-col items-center space-y-2 hover:bg-white/10 transition`}>
                                <IconBadge icon={Icons.CheckCircle} size="md" color="#00D4AA" variant="circle" />
                                <span className="text-xs">100% день</span>
                            </button>
                            <button className={`${GLASS_PANEL_LIGHT} p-4 flex flex-col items-center space-y-2 hover:bg-white/10 transition`}>
                                <IconBadge icon={Icons.Trophy} size="md" color="#FFD700" variant="circle" />
                                <span className="text-xs">Достижение</span>
                            </button>
                        </div>
                    </div>

                    {/* Before/After Photos */}
                    <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center"><IconBadge icon={Icons.Camera} size="sm" color="#00D4AA" variant="plain" className="mr-2" /> До/После</h3>
                        <div className={`${GLASS_PANEL} p-4 text-center`}>
                            <p className="text-sm text-white/60 mb-4">Загрузи фото "до" и "после" чтобы отслеживать визуальную трансформацию</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className={`${GLASS_PANEL_LIGHT} aspect-square rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:bg-white/5 transition cursor-pointer`}>
                                    <IconBadge icon={Icons.Camera} size="lg" color="rgba(255,255,255,0.3)" variant="circle" />
                                    <span className="text-xs text-white/50 mt-2">Фото "До"</span>
                                </div>
                                <div className={`${GLASS_PANEL_LIGHT} aspect-square rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:bg-white/5 transition cursor-pointer`}>
                                    <IconBadge icon={Icons.Camera} size="lg" color="rgba(255,255,255,0.3)" variant="circle" />
                                    <span className="text-xs text-white/50 mt-2">Фото "После"</span>
                                </div>
                            </div>
                            <button className={`w-full py-3 ${ACCENT_BUTTON}`}>
                                Загрузить фото
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Badges' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Достижения</h3>
                        <span className="text-xs text-white/50">
                            {loadGamificationData().unlockedAchievements.length}/14 разблокировано
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'first_day', iconId: 'Target', name: 'Первый день', color: '#00D4AA' },
                            { id: 'streak_3', iconId: 'Flame', name: '3 дня подряд', color: '#FF6B00' },
                            { id: 'streak_7', iconId: 'Zap', name: '7 дней подряд', color: '#FFD700' },
                            { id: 'streak_14', iconId: 'Dumbbell', name: '14 дней силы', color: '#FF6B6B' },
                            { id: 'streak_30', iconId: 'Trophy', name: 'Мастер месяца', color: '#A855F7' },
                            { id: 'streak_100', iconId: 'Star', name: 'Клуб сотни', color: '#EC4899' },
                            { id: 'habits_10', iconId: 'CheckCircle', name: '10 привычек', color: '#10B981' },
                            { id: 'habits_50', iconId: 'Activity', name: '50 привычек', color: '#3B82F6' },
                            { id: 'habits_100', iconId: 'Star', name: '100 привычек', color: '#6366F1' },
                            { id: 'steps_10k', iconId: 'Steps', name: 'Первые 10К', color: '#14B8A6' },
                            { id: 'steps_100k', iconId: 'Footprints', name: 'Марафонец', color: '#0EA5E9' },
                            { id: 'level_5', iconId: 'Star', name: 'Уровень 5', color: '#F59E0B' },
                            { id: 'level_10', iconId: 'Trophy', name: 'Уровень 10', color: '#EF4444' },
                            { id: 'first_meal', iconId: 'Camera', name: 'Первая еда', color: '#8B5CF6' },
                        ].map((achievement) => {
                            const unlocked = loadGamificationData().unlockedAchievements.includes(achievement.id);
                            // @ts-ignore
                            const Icon = Icons[achievement.iconId] || Icons.Star;

                            return (
                                <div
                                    key={achievement.id}
                                    className={`${GLASS_PANEL_LIGHT} p-3 flex flex-col items-center justify-center space-y-2 text-center ${unlocked ? '' : 'opacity-40 grayscale'}`}
                                >
                                    <IconBadge
                                        icon={Icon}
                                        size="md"
                                        variant="circle"
                                        color={unlocked ? achievement.color : '#ffffff'}
                                        glowIntensity={unlocked ? 'medium' : 'none'}
                                        className={unlocked ? 'bg-white/10' : 'bg-transparent'}
                                    />
                                    <p className="text-xs font-medium leading-tight">{achievement.name}</p>
                                    {unlocked && <span className="text-[8px] text-[#00D4AA] font-bold">UNLOCKED</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'AI Coach' && (
                <PremiumGate feature="AI-коуч">
                    <AICoachScreen logs={logs} streak={streak} />
                </PremiumGate>
            )}

            {activeTab === 'Analytics' && (
                <PremiumGate feature="Расширенная аналитика">
                    <div className="space-y-4">
                        {/* Yearly Heatmap */}
                        <YearlyHeatmap logs={logs} />

                        {/* Weekly Report */}
                        <WeeklyReport logs={logs} />

                        {/* Correlation Charts */}
                        <div className={`${GLASS_PANEL} p-4`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white/80">Корреляции</h3>
                            </div>

                            <div className="flex space-x-2 mb-4">
                                <select
                                    value={xMetric}
                                    onChange={e => setXMetric(e.target.value as any)}
                                    className="bg-white/10 rounded-lg p-2 text-xs text-white outline-none"
                                >
                                    <option value="sleep">Сон</option>
                                    <option value="steps">Шаги</option>
                                    <option value="active">Активность</option>
                                </select>
                                <span className="text-white/30 self-center">vs</span>
                                <select
                                    value={yMetric}
                                    onChange={e => setYMetric(e.target.value as any)}
                                    className="bg-white/10 rounded-lg p-2 text-xs text-white outline-none"
                                >
                                    <option value="mood">Настроение</option>
                                    <option value="energy">Энергия</option>
                                </select>
                            </div>

                            <CorrelationChart logs={logs} xMetric={xMetric} yMetric={yMetric} />
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={() => exportLogsToCSV(logs)}
                            className={`w-full py-4 ${GLASS_BUTTON} flex items-center justify-center space-x-2`}
                        >
                            <Icons.Download size={18} className="text-[#00D4AA]" />
                            <span>Экспорт в CSV</span>
                        </button>
                    </div>
                </PremiumGate>
            )}

            {activeTab === 'Social' && (
                <SocialScreen
                    userId="current_user"
                    userName="Пользователь"
                    userStreak={streak.currentStreak}
                    userXp={0}
                />
            )}
        </div>
    );
};

export default HistoryScreen;
