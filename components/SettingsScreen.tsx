import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { UserSettings, StreakData } from '../types';
import { useLanguage } from '../locales/LanguageContext';
import { AVAILABLE_LANGUAGES, LANGUAGE_NAMES } from '../locales';
import { getConnectedDevice, disconnectDevice, simulateConnection, TERRA_PROVIDERS, TerraUser } from '../services/terraService';
import { saveUserSettings } from '../services/storageService';
import { usePremium } from '../services/PremiumContext';
import { getPremiumStatus } from '../services/premiumService';
import { playSound } from '../services/soundService';
import { triggerHaptic } from '../services/hapticService';
import { GLASS_PANEL, GLASS_PANEL_LIGHT, GLASS_BUTTON, ACCENT_BUTTON, DEFAULT_TARGETS } from '../constants';

interface SettingsScreenProps {
    user: UserSettings;
    onUpdate: (u: UserSettings) => void;
    onReset: () => void;
    onDeviceChange: () => void;
    streak: StreakData;
    onStreakUpdate: (s: StreakData) => void;
}

export const SettingsScreen = ({
    user,
    onUpdate,
    onReset,
    onDeviceChange,
    streak,
    onStreakUpdate
}: SettingsScreenProps) => {
    const { t, language, setLanguage } = useLanguage();
    const [name, setName] = useState(user.name);
    const [gender, setGender] = useState<'male' | 'female'>(user.gender || 'male');
    const [calories, setCalories] = useState(user.targetCalories.toString());
    const [protein, setProtein] = useState(user.targetProtein.toString());
    const [connectedDevice, setConnectedDevice] = useState<TerraUser | null>(getConnectedDevice());
    const [showProviders, setShowProviders] = useState(false);
    const [vacationMode, setVacationMode] = useState(streak.vacationModeActive || false);

    const [isPremium, setIsPremium] = useState(false);
    const { openPaywall } = usePremium();

    useEffect(() => {
        getPremiumStatus().then(status => setIsPremium(status.isPremium));
    }, []);

    const save = () => {
        const updated = {
            ...user,
            name,
            gender,
            targetCalories: parseInt(calories) || DEFAULT_TARGETS.calories,
            targetProtein: parseInt(protein) || DEFAULT_TARGETS.protein,
        };
        saveUserSettings(updated);
        onUpdate(updated);
        playSound('success');
        triggerHaptic('success');
        alert(language === 'ru' ? 'Настройки сохранены' : 'Settings saved');
    };

    const handleConnect = (providerId: string) => {
        const device = simulateConnection(providerId);
        setConnectedDevice(device);
        setShowProviders(false);
        onDeviceChange();
    };

    const handleDisconnect = () => {
        disconnectDevice();
        setConnectedDevice(null);
        onDeviceChange();
    };

    const connectedProvider = connectedDevice
        ? TERRA_PROVIDERS.find(p => p.id === connectedDevice.provider)
        : null;

    return (
        <div className="flex-1 px-5 pt-20 flex flex-col space-y-6 overflow-y-auto no-scrollbar pb-28"
            style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 100px)' }}>

            <h2 className="text-2xl font-bold">{t.settings.title}</h2>

            {/* --- PROFILE SECTION --- */}
            <div className={`${GLASS_PANEL} p-5 space-y-4`}>
                <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider flex items-center">
                    <Icons.User size={14} className="mr-2 text-[#00D4AA]" />
                    {language === 'ru' ? 'Профиль' : 'Profile'}
                </h3>

                {/* Name Input */}
                <div className={`${GLASS_PANEL_LIGHT} p-3`}>
                    <label className="text-xs text-white/40 block mb-1">{language === 'ru' ? 'Имя' : 'Name'}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-lg font-bold outline-none text-white placeholder-white/30"
                        placeholder="Your Name"
                    />
                </div>

                {/* Gender Toggle */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => {
                            setGender('male');
                            playSound('click');
                            triggerHaptic('selection');
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${gender === 'male' ? 'bg-[#00D4AA]/20 border-[#00D4AA] text-[#00D4AA]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                    >
                        <span className="text-xl">♂️</span>
                        <span className="font-bold text-sm">{language === 'ru' ? 'Мужской' : 'Male'}</span>
                    </button>
                    <button
                        onClick={() => {
                            setGender('female');
                            playSound('click');
                            triggerHaptic('selection');
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${gender === 'female' ? 'bg-[#00D4AA]/20 border-[#00D4AA] text-[#00D4AA]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                    >
                        <span className="text-xl">♀️</span>
                        <span className="font-bold text-sm">{language === 'ru' ? 'Женский' : 'Female'}</span>
                    </button>
                </div>
            </div>

            {/* --- APP SETTINGS SECTION --- */}

            {/* Connected Devices */}
            <div className={`${GLASS_PANEL} p-5 space-y-4`}>
                <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider">{t.settings.connectedDevices}</h3>
                {/* ... (Existing Terra logic) ... */}
                {connectedDevice && connectedProvider ? (
                    <div className={`${GLASS_PANEL_LIGHT} p-4 flex items-center justify-between`}>
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">{connectedProvider.icon}</span>
                            <div>
                                <p className="font-semibold">{connectedProvider.name}</p>
                                <p className="text-xs text-[#00D4AA]">✓ Connected</p>
                            </div>
                        </div>
                        <button onClick={handleDisconnect} className="text-red-400 text-sm">{t.common.disconnect}</button>
                    </div>
                ) : (
                    !showProviders ? (
                        <button onClick={() => setShowProviders(true)} className={`w-full p-4 ${GLASS_PANEL_LIGHT} flex items-center justify-center space-x-2 text-[#00D4AA]`}>
                            <Icons.Plus size={18} />
                            <span className="font-medium">{t.settings.connectFitness}</span>
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                {TERRA_PROVIDERS.slice(0, 6).map(provider => (
                                    <button key={provider.id} onClick={() => handleConnect(provider.id)} className={`${GLASS_PANEL_LIGHT} p-3 flex items-center space-x-2 text-left hover:bg-white/20 transition`}>
                                        <span className="text-xl">{provider.icon}</span>
                                        <span className="text-sm font-medium">{provider.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowProviders(false)} className="w-full text-center text-white/50 text-sm mt-2">{t.common.cancel}</button>
                        </div>
                    )
                )}
            </div>

            {/* Goals */}
            <div className={`${GLASS_PANEL} p-5 space-y-4`}>
                <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider">{language === 'ru' ? 'Цели' : 'Goals'}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className={`${GLASS_PANEL_LIGHT} p-3`}>
                        <label className="text-xs text-white/50 block mb-1">{t.settings.caloriesGoal}</label>
                        <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full bg-transparent text-lg font-bold outline-none" />
                    </div>
                    <div className={`${GLASS_PANEL_LIGHT} p-3`}>
                        <label className="text-xs text-white/50 block mb-1">{t.settings.proteinGoal}</label>
                        <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} className="w-full bg-transparent text-lg font-bold outline-none" />
                    </div>
                </div>
            </div>

            <button onClick={save} className={`w-full py-4 ${ACCENT_BUTTON} text-lg shadow-[0_0_20px_rgba(0,212,170,0.3)]`}>
                {t.settings.saveGoals}
            </button>

            {/* Subscription */}
            <div className={`${GLASS_PANEL} p-5`}>
                <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">{t.settings.subscription}</h3>
                <div className="flex items-center justify-between">
                    <div>
                        {isPremium ? (
                            <>
                                <p className="font-semibold text-[#00D4AA] flex items-center"><Icons.Star size={14} className="mr-1 text-yellow-400" /> Premium</p>
                                <p className="text-xs text-white/50">All features unlocked</p>
                            </>
                        ) : (
                            <>
                                <p className="font-semibold">{t.settings.freePlan}</p>
                                <p className="text-xs text-white/50">{t.settings.freeFeatures}</p>
                            </>
                        )}
                    </div>
                    {!isPremium && (
                        <button onClick={() => openPaywall()} className={`px-4 py-2 ${GLASS_BUTTON} text-[#00D4AA] text-sm font-semibold`}>
                            {t.common.upgrade}
                        </button>
                    )}
                </div>
            </div>

            {/* Language */}
            <div className={`${GLASS_PANEL} p-5`}>
                <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">Language / Язык</h3>
                <div className="flex space-x-3">
                    {AVAILABLE_LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`flex-1 py-3 ${GLASS_BUTTON} flex items-center justify-center space-x-2 ${language === lang ? 'ring-2 ring-[#00D4AA]' : ''}`}
                        >
                            <span className="text-xl">{lang === 'en' ? 'EN' : 'RU'}</span>
                            <span className="font-medium">{LANGUAGE_NAMES[lang]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Vacation Mode */}
            <div className={`${GLASS_PANEL} p-5`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold flex items-center">
                            <Icons.Sun size={16} className="mr-2 text-yellow-400" />
                            {language === 'ru' ? 'Режим отпуска' : 'Vacation Mode'}
                        </h3>
                        <p className="text-xs text-white/50 mt-1">
                            {language === 'ru' ? 'Streak не сбросится' : 'Streak won\'t reset'}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            const newValue = !vacationMode;
                            setVacationMode(newValue);
                            onStreakUpdate({
                                ...streak,
                                vacationModeActive: newValue,
                                vacationStartDate: newValue ? new Date().toISOString().split('T')[0] : null
                            });
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative ${vacationMode ? 'bg-[#00D4AA]' : 'bg-white/20'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${vacationMode ? 'right-1' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            {/* App Install */}
            <div className={`${GLASS_PANEL} p-5`}>
                <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">{language === 'ru' ? 'Приложение' : 'App'}</h3>
                <button
                    onClick={() => {
                        // @ts-ignore
                        const tg = window.Telegram?.WebApp;
                        if (tg?.addToHomeScreen) {
                            tg.addToHomeScreen();
                        } else {
                            alert(language === 'ru' ? "Нажми 'Поделиться' -> 'На экран Домой'" : "Tap 'Share' -> 'Add to Home Screen'");
                        }
                    }}
                    className={`w-full py-3 ${GLASS_BUTTON} flex items-center justify-center space-x-2`}
                >
                    <Icons.Download size={18} className="text-[#00D4AA]" />
                    <span className="font-medium">{language === 'ru' ? 'Установить на экран' : 'Install App'}</span>
                </button>
            </div>

            {/* Danger Zone */}
            <div className={`${GLASS_PANEL} p-5 border-red-500/30`}>
                <h3 className="font-semibold text-red-400 text-sm uppercase tracking-wider mb-3">{t.settings.dangerZone}</h3>
                <button
                    onClick={() => {
                        if (confirm(t.settings.resetConfirm)) {
                            onReset();
                        }
                    }}
                    className="w-full py-3 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400 font-medium"
                >
                    {t.settings.resetAllData}
                </button>
            </div>
        </div>
    );
};
