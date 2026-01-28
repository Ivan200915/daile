import React, { useState, useEffect, useRef } from 'react';
import {
  GLASS_PANEL,
  GLASS_PANEL_LIGHT,
  GLASS_BUTTON,
  ACCENT_BUTTON,
  MOCK_HABITS,
  TEXT_GRADIENT,
  AVAILABLE_HABITS,
  AVAILABLE_BAD_HABITS,
  DEFAULT_TARGETS
} from './constants';
import { playSound } from './services/soundService';
import { triggerHaptic } from './services/hapticService';
import { Screen, Meal, Habit, UserSettings, DailyLog, StreakData } from './types';
import { Icons } from './components/Icons';
import ErrorBoundary from './components/ErrorBoundary';
import { Skeleton } from './components/Skeleton';
import IconBadge from './components/IconBadge';
import HabitCard from './components/HabitCard';
import AddHabitModal from './components/AddHabitModal';
import MoodTracker from './components/MoodTracker';
import HabitScore from './components/HabitScore';
import LiveChallenges from './components/LiveChallenges';
import AIInsightsDashboard from './components/AIInsightsDashboard';
import RPGAvatar from './components/RPGAvatar';
import HabitDNA from './components/HabitDNA';
import { BadHabitTracker } from './components/BadHabitTracker';
import { RestorationTree } from './components/RestorationTree';
import { InstallPrompt } from './components/InstallPrompt';
import { SmartFoodScanner } from './components/SmartFoodScanner';
import { updateGroupMemberStats, loadGroups } from './services/socialService';
import { analyzeFoodImage, generateDailyInsight, generateWeeklyReview, FoodAnalysisResult, FoodComponent } from './services/geminiService';
import {
  saveUserSettings,
  loadUserSettings,
  saveDailyLog,
  loadAllDailyLogs,
  getOrCreateTodayLog,
  calculateStreak,
  getStreakMessage,
  clearAllData,
  getTodayDate,
  getWeeklySummary
} from './services/storageService';
import { NOTIFICATIONS, getRandomNotification } from './locales/notifications';
import { loadBadHabits, saveBadHabits } from './services/badHabitService';
import {
  getConnectedDevice,
  disconnectDevice,
  simulateConnection,
  TERRA_PROVIDERS,
  TerraUser
} from './services/terraService';
import {
  getHealthMetrics,
  formatSteps,
  formatSleep,
  formatActive,
  HealthMetrics
} from './services/healthService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';
import { LanguageProvider, useLanguage, LANGUAGE_NAMES, AVAILABLE_LANGUAGES } from './locales/LanguageContext';
import { getPremiumStatus } from './services/premiumService';
import { PremiumProvider, usePremium, PremiumGate } from './services/PremiumContext';
import { loadGamificationData, getLevelFromXp, addXp, checkAchievements, getCurrentWeeklyChallenge } from './services/gamificationService';
import { analyzeCorrelations, generateRecommendations, generateReportData } from './services/analyticsService';
import { hapticMedium, hapticSuccess, hapticLevelUp } from './services/feedbackService';
import { loadPet, createPet, feedPet, getPetEmoji, getPetMood, getPetMessage } from './services/petService';
import { CURRENT_SEASON, loadSeasonProgress, getSeasonDaysRemaining } from './services/seasonService';
import { getShieldStatus, SHIELD_TIERS } from './services/streakShieldService';
import { predictTomorrowMood, getMoodEmoji, getMoodLabel } from './services/moodPredictorService';
import type { Language } from './locales';
import FocusScreen from './components/FocusScreen';
import YearlyHeatmap from './components/YearlyHeatmap';
import CorrelationChart from './components/CorrelationChart';
import WeeklyReport, { exportLogsToCSV } from './components/WeeklyReport';
import SocialScreen from './components/SocialScreen';
import UmaxScreen from './components/UmaxScreen';
import { DailyChallengesWidget } from './components/DailyChallengesWidget';
import { ShopScreen } from './components/ShopScreen';
import { AICoachScreen } from './components/AICoachScreen';
import { AuthScreen } from './components/AuthScreen';
import { syncService } from './services/syncService';
import { addCoins, INITIAL_ECONOMY } from './services/currencyService';

// --- Sub-Components ---

const ProgressRing = ({ progress, label, subLabel, color = "#00D4AA", size = 80 }: { progress: number, label: string, subLabel: string, color?: string, size?: number }) => {
  const radius = size;
  const stroke = size * 0.15;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight text-white">{label}</span>
        <span className="text-xs text-white/60">{subLabel}</span>
      </div>
    </div>
  );
};

// XP Level Bar Component
const XpLevelBar = () => {
  const data = loadGamificationData();
  const levelInfo = getLevelFromXp(data.xp);

  return (
    <div className={`${GLASS_PANEL_LIGHT} p-3 flex items-center space-x-3`}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center font-bold text-black text-sm">
        {levelInfo.level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">Уровень {levelInfo.level}</span>
          <span className="text-white/50">{levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} XP</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFD700] to-[#00D4AA] rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Tab Bar Component
const TabBar = ({ current, onChange }: { current: Screen, onChange: (s: Screen) => void }) => {
  const { language } = useLanguage();
  const isRu = language === 'ru';

  const tabs = [
    { key: 'DASHBOARD' as Screen, icon: Icons.Home, label: isRu ? 'Сегодня' : 'Today' },
    { key: 'HISTORY' as Screen, icon: Icons.Chart, label: isRu ? 'История' : 'History' },
    { key: 'SOCIAL' as Screen, icon: Icons.Users, label: isRu ? 'Друзья' : 'Social' },
    { key: 'LOOKS' as Screen, icon: Icons.Camera, label: isRu ? 'Внешность' : 'Looks' },
    { key: 'SETTINGS' as Screen, icon: Icons.Settings, label: isRu ? 'Настройки' : 'Settings' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 glass-strong rounded-t-[24px] px-4 pt-3 flex justify-around items-start z-50"
      style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 12px)' }}
    >
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => {
            playSound('click');
            triggerHaptic('selection');
            onChange(tab.key);
          }}
          className={`flex flex-col items-center space-y-1 transition-all min-h-[44px] ${current === tab.key ? 'text-white' : 'text-white/40'}`}
        >
          <IconBadge
            icon={tab.icon}
            variant="circle"
            size="sm"
            color={current === tab.key ? '#00D4AA' : 'currentColor'}
            glowIntensity={current === tab.key ? 'medium' : 'none'}
            className={current === tab.key ? 'bg-white/10' : 'bg-transparent'}
          />
          <span className={`text-xs font-medium ${current === tab.key ? 'text-[#00D4AA]' : ''}`}>{tab.label}</span>
        </button>
      ))}
    </div >
  );
};

// --- Screens ---

const OnboardingScreen = ({ onComplete }: { onComplete: (settings: UserSettings) => void }) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>(['water', 'workout', 'no-sugar']);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const next = () => setStep(p => p + 1);
  const back = () => setStep(p => Math.max(1, p - 1));

  const toggleHabit = (id: string) => {
    if (selectedHabits.includes(id)) {
      setSelectedHabits(selectedHabits.filter(h => h !== id));
    } else if (selectedHabits.length < 5) {
      setSelectedHabits([...selectedHabits, id]);
    }
  };

  const calculateCalories = () => {
    if (weight && height) {
      // Basic BMR calculation (Mifflin-St Jeor for simplicity)
      const w = parseFloat(weight);
      const h = parseFloat(height);
      const bmr = 10 * w + 6.25 * h - 5 * 30 + 5; // Assuming age 30, male
      return Math.round(bmr * 1.5); // Moderate activity
    }
    return DEFAULT_TARGETS.calories;
  };

  return (
    <div
      className="h-full flex flex-col px-5 relative"
      style={{
        paddingTop: 'calc(var(--safe-area-top, 0px) + 24px)',
        paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 16px)'
      }}
    >
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#00D4AA]/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 flex-1 flex flex-col items-center overflow-y-auto overflow-x-visible no-scrollbar pb-6 p-1">
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <IconBadge
              icon={Icons.Active}
              size="xl"
              color="#00D4AA"
              glowIntensity="high"
              className="mb-4 scale-150"
            />
            <h1 className="text-4xl font-bold leading-tight">{t.onboarding.welcome}<br /><span className="text-[#00D4AA]">2 mins/day</span></h1>
            <p className="text-white/60 text-lg">{t.onboarding.welcomeSubtitle}</p>
          </div>
        )}

        {step === 2 && (
          <div className="w-full flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-center">{t.onboarding.chooseGoal}</h2>
            <div className="w-full space-y-4 flex-1 overflow-y-auto p-1">
              {[
                { key: 'Weight Loss', label: t.onboarding.goals.weightLoss },
                { key: 'More Energy', label: t.onboarding.goals.moreEnergy },
                { key: 'Build Discipline', label: t.onboarding.goals.buildDiscipline },
                { key: 'Better Health', label: t.onboarding.goals.improveHealth }
              ].map((g) => (
                <button
                  key={g.key}
                  onClick={() => setGoal(g.key)}
                  className={`w-full p-5 text-left ${GLASS_PANEL_LIGHT} ${goal === g.key ? 'ring-2 ring-[#00D4AA] bg-[#00D4AA]/10' : ''}`}
                >
                  <span className="text-lg font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-center">{t.onboarding.pickHabits}</h2>
            <p className="text-white/50 text-sm mb-6 text-center">{t.onboarding.pickHabitsHint}</p>
            <div className="w-full grid grid-cols-2 gap-3 flex-1 overflow-y-auto p-1">
              {AVAILABLE_HABITS.map((habit) => {
                // @ts-ignore
                const Icon = Icons[habit.iconId] || Icons.Star;
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`p-4 text-left ${GLASS_PANEL_LIGHT} flex items-center space-x-3 transition-all ${selectedHabits.includes(habit.id) ? 'ring-2 ring-[#00D4AA] bg-[#00D4AA]/10' : ''}`}
                  >
                    <IconBadge
                      icon={Icon}
                      size="sm"
                      variant="circle"
                      color={selectedHabits.includes(habit.id) ? '#00D4AA' : 'currentColor'}
                      className={selectedHabits.includes(habit.id) ? 'bg-[#00D4AA]/20' : 'bg-white/10'}
                    />
                    <span className="text-sm font-medium">
                      {language === 'ru' ? habit.labelRu : habit.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="w-full flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-center">{t.onboarding.yourStats}</h2>
            <p className="text-white/50 text-sm mb-6 text-center">Helps calculate personalized calorie goals</p>
            <div className="space-y-4">
              {/* Gender Selection */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => setGender('male')}
                  className={`p-4 rounded-xl border ${gender === 'male' ? 'bg-[#00D4AA]/20 border-[#00D4AA] text-[#00D4AA]' : 'bg-white/5 border-white/10 text-white/60'}`}
                >
                  <span className="block text-2xl mb-2">♂️</span>
                  <span className="font-bold">{t.onboarding.male}</span>
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`p-4 rounded-xl border ${gender === 'female' ? 'bg-[#00D4AA]/20 border-[#00D4AA] text-[#00D4AA]' : 'bg-white/5 border-white/10 text-white/60'}`}
                >
                  <span className="block text-2xl mb-2">♀️</span>
                  <span className="font-bold">{t.onboarding.female}</span>
                </button>
              </div>

              <div className={`${GLASS_PANEL_LIGHT} p-4`}>
                <label className="text-sm text-white/50 block mb-2">{t.onboarding.height}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full bg-transparent text-xl font-semibold outline-none"
                />
              </div>
              <div className={`${GLASS_PANEL_LIGHT} p-4`}>
                <label className="text-sm text-white/50 block mb-2">{t.onboarding.weight}</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full bg-transparent text-xl font-semibold outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="w-full flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold mb-6">{t.onboarding.connectHealth}</h2>
            <div className={`${GLASS_PANEL} p-8 flex flex-col items-center space-y-4`}>
              <Icons.Active size={48} className="text-red-500" />
              <p className="text-white/70">{t.onboarding.connectHealthSubtitle}</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full z-10 pt-4 pb-6 bg-transparent space-y-3">
        {step > 1 && (
          <button onClick={back} className={`w-full h-12 ${GLASS_BUTTON} flex items-center justify-center`}>
            {t.common.cancel}
          </button>
        )}
        <button
          onClick={step === 5 ? () => {
            const settings: UserSettings = {
              name: 'User',
              goal,
              targetCalories: calculateCalories(),
              targetProtein: DEFAULT_TARGETS.protein,
              height: height ? parseFloat(height) : undefined,
              weight: weight ? parseFloat(weight) : undefined,
              gender,
              selectedHabits,
              onboardingComplete: true,
              coins: INITIAL_ECONOMY.coins,
              inventory: INITIAL_ECONOMY.inventory,
              equipped: INITIAL_ECONOMY.equipped
            };
            saveUserSettings(settings);
            onComplete(settings);
          } : () => {
            if (step === 2 && !goal) return;
            if (step === 3 && selectedHabits.length < 3) return;
            next();
          }}
          disabled={(step === 2 && !goal) || (step === 3 && selectedHabits.length < 3)}
          className={`w-full h-14 ${ACCENT_BUTTON} flex items-center justify-center text-lg disabled:opacity-50`}
        >
          {step === 1 ? t.onboarding.start : step === 5 ? t.onboarding.connectFinish : t.common.next}
        </button>
      </div>
    </div>
  );
};

const AddMealScreen = ({ onSave, onCancel }: { onSave: (meal: Meal) => void, onCancel: () => void }) => {
  const { language, t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [scanMode, setScanMode] = useState<'photo' | 'barcode'>('photo');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Start Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    if (!image) startCamera();

    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [image]);

  const capture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImage(dataUrl);
        setAnalyzing(true);

        // Call Gemini
        const data = await analyzeFoodImage(dataUrl, language);
        if (data) {
          setResult(data);
        }
        setAnalyzing(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        setAnalyzing(true);
        const data = await analyzeFoodImage(dataUrl, language);
        if (data) {
          setResult(data);
        }
        setAnalyzing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAdjustedMacros = () => {
    if (!result) return null;
    return {
      calories: Math.round(result.macros.calories * portionMultiplier),
      protein: Math.round(result.macros.protein * portionMultiplier),
      fat: Math.round(result.macros.fat * portionMultiplier),
      carbs: Math.round(result.macros.carbs * portionMultiplier),
    };
  };

  const getCalorieRange = () => {
    const adjusted = getAdjustedMacros();
    if (!adjusted) return '';
    const low = Math.round(adjusted.calories * 0.85);
    const high = Math.round(adjusted.calories * 1.15);
    return `${low}–${high}`;
  };

  return (
    <div className="h-full relative bg-black flex flex-col">
      {!image ? (
        // Camera View
        <>
          <div className="flex-1 relative overflow-hidden rounded-b-3xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Type Selector Overlay */}
            <div className="absolute top-0 left-0 right-0 flex justify-center space-x-2 px-4 z-20 pt-safe mt-4">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium border transition-all ${mealType === type ? 'bg-[#00D4AA] border-[#00D4AA] text-black' : 'bg-black/40 border-white/10'}`}
                >
                  {t.addMeal.types[type.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack']}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="h-[220px] glass-panel-bottom relative flex flex-col items-center justify-center pb-8 pt-4 z-10 bg-black">
            {/* Mode Toggle */}
            <div className="flex p-1 rounded-xl bg-white/10 mb-4">
              <button
                onClick={() => setScanMode('photo')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${scanMode === 'photo' ? 'bg-[#00D4AA] text-black' : 'text-white/60'}`}
              >
                <Icons.Camera size={16} />
                <span>{t.addMeal.photo}</span>
              </button>
              <button
                onClick={() => setScanMode('barcode')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${scanMode === 'barcode' ? 'bg-[#00D4AA] text-black' : 'text-white/60'}`}
              >
                <Icons.BarChart2 size={16} />
                <span>{t.addMeal.barcode}</span>
              </button>
            </div>

            {scanMode === 'photo' ? (
              <>
                <p className="text-white/60 mb-4 font-medium text-sm">{t.addMeal.capture} {t.addMeal.types[mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack'].toLowerCase()}</p>
                <div className="flex items-center justify-between w-full px-10">
                  <label className="p-3 rounded-full bg-white/10 backdrop-blur active:scale-95 transition cursor-pointer">
                    <Icons.Gallery size={24} className="text-[#00D4AA]" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white/30 p-1">
                    <div className="w-full h-full bg-white rounded-full" />
                  </button>

                  <button onClick={onCancel} className="p-3 rounded-full bg-white/10 backdrop-blur active:scale-95 transition">
                    <Icons.Close size={24} className="text-white/60" />
                  </button>
                </div>
              </>
            ) : (
              /* Barcode Input Mode */
              <div className="w-full px-6 space-y-4">
                <p className="text-white/60 text-sm text-center">{t.addMeal.enterBarcode}</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="e.g. 5901234123457"
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#00D4AA]"
                  />
                  <button
                    onClick={async () => {
                      if (!barcodeInput) return;
                      setAnalyzing(true);
                      const { scanBarcode } = await import('./services/barcodeService');
                      const res = await scanBarcode(barcodeInput);
                      if (res.success && res.product) {
                        setResult({
                          name: res.product.name + (res.product.brand ? ` (${res.product.brand})` : ''),
                          macros: {
                            calories: res.product.caloriesPer100g,
                            protein: res.product.proteinPer100g,
                            fat: res.product.fatPer100g,
                            carbs: res.product.carbsPer100g
                          },
                          portionGrams: res.product.servingSize || 100,
                          components: [],
                          confidence: res.product.isComplete ? 95 : 70,
                          insight: t.addMeal.adjustPortion
                        });
                        setImage(res.product.imageUrl || 'barcode');
                      } else {
                        alert(res.error || t.addMeal.productNotFound);
                      }
                      setAnalyzing(false);
                    }}
                    disabled={!barcodeInput || analyzing}
                    className="px-4 py-3 bg-[#00D4AA] rounded-xl text-black font-semibold disabled:opacity-50"
                  >
                    {analyzing ? '...' : t.addMeal.find}
                  </button>
                </div>
                <button onClick={onCancel} className="w-full py-2 text-white/50 text-sm">
                  {t.common.cancel}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        // Result View
        <div className="h-full relative flex flex-col">
          <div className="h-[45%] w-full relative shrink-0">
            <img src={image} className="w-full h-full object-cover" alt="Meal" />
            <button onClick={() => setImage(null)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full backdrop-blur-md z-20">
              <Icons.ArrowRight className="rotate-180 text-[#00D4AA]" size={20} />
            </button>
          </div>

          <div className={`flex-1 ${GLASS_PANEL} rounded-t-[32px] -mt-6 z-10 p-6 flex flex-col animate-slide-up overflow-hidden`}>
            {analyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                <p>{t.addMeal.analyzing}</p>
              </div>
            ) : result ? (
              <>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
                  <h2 className="text-3xl font-bold mb-1">{result.name}</h2>

                  {result.insight && (
                    <p className="text-sm text-white/60 italic mb-3">"{result.insight}"</p>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2 text-[#00D4AA]">
                      <Icons.Energy size={18} fill="currentColor" />
                      <span className="text-xl font-semibold">~{getCalorieRange()} kcal</span>
                    </div>
                    {/* Confidence Badge */}
                    <div className={`px-2 py-1 rounded-md text-xs font-bold border ${result.confidence > 80 ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-yellow-500/10 border-yellow-500 text-yellow-400'}`}>
                      {result.confidence}% {t.addMeal.match}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { l: t.addMeal.protein, v: getAdjustedMacros()?.protein + 'g' },
                      { l: t.addMeal.fat, v: getAdjustedMacros()?.fat + 'g' },
                      { l: t.addMeal.carbs, v: getAdjustedMacros()?.carbs + 'g' }
                    ].map((m) => (
                      <div key={m.l} className={`${GLASS_PANEL_LIGHT} p-3 flex flex-col items-center`}>
                        <span className="text-xs text-white/50">{m.l}</span>
                        <span className="font-semibold text-lg">{m.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Components Breakdown */}
                  {result.components && result.components.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">{t.addMeal.breakdown}</h4>
                      <div className="space-y-2">
                        {result.components.map((comp, i) => (
                          <div key={i} className={`${GLASS_PANEL_LIGHT} p-3 flex items-center justify-between`}>
                            <div>
                              <p className="font-medium text-sm">{comp.name}</p>
                              <p className="text-xs text-white/50">{comp.amount} • {comp.protein}p {comp.fat}f {comp.carbs}c</p>
                            </div>
                            <span className="font-mono text-sm">{Math.round(comp.calories * portionMultiplier)} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Portion Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/50">{t.addMeal.portionSize}</p>
                      {result.portionGrams > 0 && (
                        <span className="text-xs text-[#00D4AA]">
                          {t.addMeal.aiEstimate}: ~{result.portionGrams}g
                        </span>
                      )}
                    </div>

                    {/* Quick Size Buttons */}
                    <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
                      {[
                        { label: 'S', mult: 0.7, grams: result.portionGrams ? Math.round(result.portionGrams * 0.7) : 150 },
                        { label: 'M', mult: 1, grams: result.portionGrams || 250 },
                        { label: 'L', mult: 1.3, grams: result.portionGrams ? Math.round(result.portionGrams * 1.3) : 400 }
                      ].map(s => (
                        <button
                          key={s.label}
                          onClick={() => setPortionMultiplier(s.mult)}
                          className={`flex-1 py-2 rounded-lg text-center transition ${portionMultiplier === s.mult ? 'bg-[#00D4AA]/20 ring-1 ring-[#00D4AA]' : 'text-white/50 hover:bg-white/5'}`}
                        >
                          <span className="block text-sm font-bold">{s.label}</span>
                          <span className="block text-[10px] text-white/40">{s.grams}g</span>
                        </button>
                      ))}
                    </div>

                    {/* Gram Slider */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-white/40 w-10">50g</span>
                      <input
                        type="range"
                        min="0.2"
                        max="2"
                        step="0.1"
                        value={portionMultiplier}
                        onChange={(e) => setPortionMultiplier(parseFloat(e.target.value))}
                        className="flex-1 h-2 rounded-full appearance-none bg-white/10 cursor-pointer accent-[#00D4AA]"
                        style={{
                          background: `linear-gradient(to right, #00D4AA ${(portionMultiplier - 0.2) / 1.8 * 100}%, rgba(255,255,255,0.1) ${(portionMultiplier - 0.2) / 1.8 * 100}%)`
                        }}
                      />
                      <span className="text-xs text-white/40 w-12">500g</span>
                    </div>

                    {/* Current Selection Display */}
                    <div className="text-center py-2 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-2xl font-bold text-[#00D4AA]">
                        {result.portionGrams ? Math.round(result.portionGrams * portionMultiplier) : Math.round(250 * portionMultiplier)}g
                      </span>
                      <span className="text-sm text-white/50 ml-2">
                        ({Math.round(portionMultiplier * 100)}% {t.addMeal.ofDetected})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    onClick={() => {
                      const adjustedMacros = getAdjustedMacros();
                      if (adjustedMacros && image) {
                        // Construct final Meal object
                        onSave({
                          id: Date.now().toString(),
                          type: mealType,
                          name: result.name,
                          macros: adjustedMacros,
                          imageUri: image,
                          timestamp: new Date()
                        });
                      }
                    }}
                    className={`w-full py-4 ${ACCENT_BUTTON} text-lg`}
                  >
                    {t.addMeal.saveMeal}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Metric Modal Component
const EditMetricModal = ({
  metric,
  onClose,
  onSave
}: {
  metric: { type: 'steps' | 'sleep' | 'active', current: number },
  onClose: () => void,
  onSave: (value: number) => void
}) => {
  const [value, setValue] = useState(metric.current.toString());

  const getConfig = () => {
    switch (metric.type) {
      case 'steps':
        return { title: 'Steps', icon: '🚶', unit: 'steps', placeholder: '10000' };
      case 'sleep':
        return { title: 'Sleep', icon: '😴', unit: 'hours', placeholder: '8.0' };
      case 'active':
        return { title: 'Active Time', icon: '🔥', unit: 'minutes', placeholder: '60' };
    }
  };

  const config = getConfig();

  const handleSave = () => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onSave(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
      <div className={`${GLASS_PANEL} p-6 w-full max-w-sm border-[#00D4AA]/30 animate-slide-up`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{config.icon}</span>
            <h3 className="text-xl font-bold">{config.title}</h3>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <Icons.Close size={24} className="text-white/60" />
          </button>
        </div>

        <div className={`${GLASS_PANEL_LIGHT} p-4 mb-4`}>
          <label className="text-sm text-white/50 block mb-2">Enter {config.unit}</label>
          <input
            type="number"
            step={metric.type === 'sleep' ? '0.1' : '1'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            className="w-full bg-transparent text-3xl font-bold outline-none"
            placeholder={config.placeholder}
          />
        </div>

        <div className="flex space-x-3">
          <button onClick={onClose} className={`flex-1 py-3 ${GLASS_BUTTON} text-white/70`}>
            Cancel
          </button>
          <button onClick={handleSave} className={`flex-1 py-3 ${ACCENT_BUTTON}`}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({
  user,
  habits,
  meals,
  streak,
  healthMetrics,
  toggleHabit,
  updateHabit,
  onAddHabit,
  todayMood,
  onMoodChange,
  goToAddMeal,
  closeDay,
  onMetricUpdate,
  logs,
  onOpenFocus,
  onRefreshXp,
  userXp,
  onAddTask,
  onToggleTask
}: {
  user: UserSettings,
  habits: Habit[],
  meals: Meal[],
  streak: StreakData,
  healthMetrics: HealthMetrics | null,
  toggleHabit: (id: string) => void,
  updateHabit: (id: string, updates: Partial<Habit>) => void,
  onAddHabit: (habit: Habit) => void,
  todayMood: number | null,
  onMoodChange: (mood: number) => void,
  goToAddMeal: () => void,
  closeDay: () => void,
  onMetricUpdate: (type: 'steps' | 'sleep' | 'active', value: number) => void,
  logs: DailyLog[],
  onOpenFocus: () => void,
  onRefreshXp: () => void,
  userXp: number,
  onAddTask: (text: string, date: string) => void,
  onToggleTask: (id: string) => void
}) => {
  const [editingMetric, setEditingMetric] = useState<{ type: 'steps' | 'sleep' | 'active', current: number } | null>(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const { t, language } = useLanguage();
  const isRu = language === 'ru';

  // Get tomorrow's date for planning
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const tomorrowDate = getTomorrowDate();
  const tomorrowTasks = (user.dailyTasks || []).filter(t => t.date === tomorrowDate);

  const totalCals = meals.reduce((acc, m) => acc + m.macros.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.macros.protein, 0);
  const calPercent = Math.min((totalCals / user.targetCalories) * 100, 100);
  const proteinPercent = Math.min((totalProtein / user.targetProtein) * 100, 100);

  const streakMessage = getStreakMessage(streak);

  // Use real metrics or fallback
  const metrics = healthMetrics || {
    steps: 0, stepsProgress: 0,
    sleepHours: 0, sleepProgress: 0,
    activeMinutes: 0, activeProgress: 0,
    source: 'demo' as const
  };

  const handleMetricClick = (type: 'steps' | 'sleep' | 'active') => {
    const current = type === 'steps' ? metrics.steps : type === 'sleep' ? metrics.sleepHours : metrics.activeMinutes;
    setEditingMetric({ type, current });
  };

  const handleMetricSave = (value: number) => {
    if (editingMetric) {
      onMetricUpdate(editingMetric.type, value);
    }
  };

  return (
    <div
      className="h-full flex flex-col px-5 space-y-5 overflow-y-auto no-scrollbar scroll-container"
      style={{
        paddingTop: 'calc(var(--safe-area-top, 0px) + 24px)',
        paddingBottom: '200px'
      }}
    >
      {editingMetric && (
        <EditMetricModal
          metric={editingMetric}
          onClose={() => setEditingMetric(null)}
          onSave={handleMetricSave}
        />
      )}

      {/* Top Greeting */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <p className="text-white/50 text-sm uppercase tracking-wider">{new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="text-2xl font-bold">{t.dashboard.greeting}, {user.name}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs">
          {metrics.source === 'terra' ? '✓' : metrics.source === 'demo' ? '⟳' : '✎'}
        </div>
      </div>

      {/* Streak Banner */}
      {streak.currentStreak > 0 && (
        <div className={`${GLASS_PANEL_LIGHT} p-4 flex items-center space-x-3`}>
          <IconBadge icon={Icons.Flame} size="md" color="#FF6B00" variant="circle" glowIntensity="high" />
          <div className="flex-1">
            <p className="font-semibold">{streak.currentStreak} {t.dashboard.dayStreak}</p>
            <p className="text-xs text-white/50">{streakMessage}</p>
          </div>
          <div className="flex space-x-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i < streak.completedDaysThisWeek ? 'bg-[#00D4AA]' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* RPG Avatar (replaces XP Level Bar) */}
      <RPGAvatar
        level={Math.floor(userXp / 100) + 1}
        xp={userXp % 100}
        xpToNextLevel={100}
        habitsCompleted={habits.filter(h => h.completed).length}
        totalHabits={habits.length}
        streak={streak.currentStreak}
      />

      {/* Main Stats - Calories & Macros (TOP) */}
      <div className={`${GLASS_PANEL} p-4 relative overflow-hidden shrink-0`}>
        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-[#00D4AA]/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex justify-around items-center">
          <ProgressRing progress={calPercent} label={`${totalCals}`} subLabel={`/ ${user.targetCalories} ккал`} size={65} />
          <ProgressRing progress={proteinPercent} label={`${totalProtein}г`} subLabel={`/ ${user.targetProtein}г белка`} color="#FF6B6B" size={65} />
        </div>
      </div>

      {/* AI Insights Dashboard */}
      <AIInsightsDashboard logs={logs} currentMood={todayMood} />



      {/* Weekly Challenge */}
      {(() => {
        const challenge = getCurrentWeeklyChallenge();
        return (
          <div className={`${GLASS_PANEL_LIGHT} p-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{challenge.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{challenge.nameRu}</p>
                  <p className="text-xs text-white/50">{challenge.descriptionRu}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#FFD700]">+{challenge.xpReward} XP</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Virtual Pet Widget */}
      {(() => {
        const pet = loadPet();
        if (!pet) return null;
        const mood = getPetMood(pet);

        let PetIcon = Icons.Cat;
        if (pet.type === 'dog') PetIcon = Icons.Dog;
        if (pet.type === 'panda') PetIcon = Icons.Rabbit;
        if (pet.type === 'dragon') PetIcon = Icons.Bird;

        let MoodIcon = Icons.Meh;
        if (mood.text === 'Very Happy') MoodIcon = Icons.SmilePlus;
        if (mood.text === 'Happy') MoodIcon = Icons.Smile;
        if (mood.text === 'Sad') MoodIcon = Icons.Frown;

        return (
          <div className={`${GLASS_PANEL_LIGHT} p-3 flex items-center space-x-3`}>
            <IconBadge icon={PetIcon} size="lg" color="#00D4AA" variant="circle" glowIntensity="medium" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{pet.name}</span>
                <span className="text-xs text-white/50">Ур. {pet.level}</span>
              </div>
              <div className="flex items-center mt-1 space-x-1">
                <MoodIcon size={12} className={pet.happiness > 50 ? "text-[#00D4AA]" : "text-[#FF6B6B]"} />
                <p className="text-xs text-white/60">{mood.textRu}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#00D4AA]">💕 {pet.happiness}%</span>
            </div>
          </div>
        );
      })()}





      {/* Focus Mode & Metrics Row */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 shrink-0">
        {/* Focus Widget */}
        <button
          onClick={() => onOpenFocus()}
          className={`flex-none w-28 ${GLASS_PANEL_LIGHT} p-3 flex flex-col justify-between h-28 hover:bg-white/10 transition-all cursor-pointer active:scale-95 group relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00D4AA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <IconBadge icon={Icons.Zap} variant="circle" size="sm" color="#FFD700" glowIntensity="medium" />
          <div>
            <p className="text-lg font-bold">{t.dashboard.focus}</p>
            <p className="text-xs text-white/50">{t.dashboard.startSession}</p>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#FFD700] w-0 group-hover:w-full transition-all duration-700" />
          </div>
        </button>

        {[
          { type: 'steps' as const, icon: Icons.Steps, val: formatSteps(metrics.steps), label: t.dashboard.steps, progress: metrics.stepsProgress },
          { type: 'sleep' as const, icon: Icons.Sleep, val: formatSleep(metrics.sleepHours), label: t.dashboard.sleep, progress: metrics.sleepProgress },
          { type: 'active' as const, icon: Icons.Active, val: formatActive(metrics.activeMinutes), label: t.dashboard.active, progress: metrics.activeProgress },
        ].map((m, i) => (
          <button
            key={i}
            onClick={() => handleMetricClick(m.type)}
            className={`flex-none w-28 ${GLASS_PANEL_LIGHT} p-3 flex flex-col justify-between h-28 hover:bg-white/10 transition-all cursor-pointer active:scale-95`}
          >
            <IconBadge icon={m.icon} variant="circle" size="sm" color="#00D4AA" />
            <div className="w-full">
              {healthMetrics ? (
                <>
                  <p className="text-lg font-bold">{m.val}</p>
                  <p className="text-xs text-white/50">{m.label}</p>
                </>
              ) : (
                <div className="space-y-2 mt-1">
                  <Skeleton width="60%" height={24} className="bg-white/10" />
                  <Skeleton width="40%" height={12} className="bg-white/10" />
                </div>
              )}
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-1">
              {healthMetrics ? (
                <div className="h-full bg-[#00D4AA] transition-all duration-500" style={{ width: `${m.progress}%` }} />
              ) : (
                <Skeleton width="100%" height="100%" className="bg-white/10" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Meals */}
      <div className="shrink-0">
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-xl font-bold">{t.dashboard.meals}</h3>
          <button onClick={goToAddMeal} className="text-[#00D4AA] text-sm font-medium flex items-center">
            <Icons.Plus size={16} className="mr-1 text-[#00D4AA]" /> {t.common.add}
          </button>
        </div>
        <div className="space-y-3">
          {meals.map(meal => (
            <div key={meal.id} className={`${GLASS_PANEL_LIGHT} p-3 flex items-center space-x-3`}>
              {meal.imageUri ? (
                <img src={meal.imageUri} className="w-12 h-12 rounded-xl object-cover" alt={meal.name} />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <IconBadge icon={Icons.Camera} size="sm" color="white" variant="plain" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{meal.name}</p>
                <p className="text-xs text-white/50">{meal.type} • ~{meal.macros.calories} kcal</p>
              </div>
            </div>
          ))}
          {meals.length < 4 && (
            <button onClick={goToAddMeal} className="w-full h-16 rounded-[20px] border border-dashed border-white/20 flex items-center justify-center text-white/30 hover:bg-white/5 transition">
              <Icons.Camera size={20} className="mr-2 text-[#00D4AA]" /> {t.dashboard.logMeal}
            </button>
          )}
        </div>
      </div>

      {/* Habits */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold">{t.dashboard.habits}</h3>
          <button
            onClick={() => setShowAddHabit(true)}
            className="p-2 bg-[#00D4AA] rounded-full text-black hover:bg-[#00D4AA]/80 transition-all shadow-lg shadow-[#00D4AA]/20"
          >
            <Icons.Plus size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={toggleHabit}
              onUpdate={updateHabit}
            />
          ))}
        </div>

        {/* Add Habit Modal */}
        {showAddHabit && (
          <AddHabitModal
            onClose={() => setShowAddHabit(false)}
            onAdd={(habit) => {
              onAddHabit(habit);
              setShowAddHabit(false);
            }}
          />
        )}
      </div>

      {/* --- Дневные задачи (на завтра) --- */}
      <div className="shrink-0 mt-6">
        <h3 className="text-xl font-bold mb-3">📋 Задачи на завтра</h3>

        {/* Input */}
        <div className="flex space-x-2 mb-3">
          <input
            className={`${GLASS_PANEL_LIGHT} flex-1 p-3 text-white placeholder-white/30 outline-none`}
            placeholder={isRu ? "Добавить задачу..." : "Add task..."}
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newTaskText.trim()) {
                onAddTask(newTaskText, tomorrowDate);
                setNewTaskText('');
              }
            }}
          />
          <button
            onClick={() => {
              if (newTaskText.trim()) {
                onAddTask(newTaskText, tomorrowDate);
                setNewTaskText('');
              }
            }}
            className={`${GLASS_BUTTON} p-3`}
          >
            <Icons.Plus />
          </button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {tomorrowTasks.length === 0 && (
            <p className="text-white/30 text-sm text-center py-2">{isRu ? 'Запланируйте задачи на завтра' : 'Plan tasks for tomorrow'}</p>
          )}
          {tomorrowTasks.map(task => (
            <div key={task.id} onClick={() => onToggleTask(task.id)} className={`${GLASS_PANEL_LIGHT} p-3 flex items-center space-x-3 cursor-pointer active:scale-98 transition`}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${task.completed ? 'bg-[#00D4AA] border-[#00D4AA]' : 'border-white/30'}`}>
                {task.completed && <Icons.Check size={14} className="text-black" />}
              </div>
              <span className={task.completed ? 'line-through text-white/30' : 'text-white'}>{task.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Вредные привычки (Восстановление) --- */}
      <div className="shrink-0 mt-6">
        <h3 className="text-xl font-bold mb-3">🌱 Восстановление</h3>
        <RestorationTree />
        <BadHabitTracker settings={user} />
      </div>

      <button onClick={closeDay} className={`w-full py-4 ${GLASS_PANEL} border-[#00D4AA]/30 text-[#00D4AA] font-semibold mt-4 shadow-lg hover:shadow-[0_0_20px_rgba(0,212,170,0.2)] transition shrink-0`}>
        {t.dashboard.closeDay}
      </button>
    </div>
  );
};

const CheckInScreen = ({ onFinish, onClose, meals, habits, user, onUpdateUser }: {
  onFinish: (insight: string) => void,
  onClose: () => void,
  meals: Meal[],
  habits: Habit[],
  user: UserSettings,
  onUpdateUser: (u: UserSettings) => void
}) => {
  const [stage, setStage] = useState(0);
  const [insight, setInsight] = useState<string | null>(null);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(5);

  useEffect(() => {
    // Generate insight on mount with real data
    const totalProtein = meals.reduce((acc, m) => acc + m.macros.protein, 0);
    const completedHabits = habits.filter(h => h.completed).length;
    generateDailyInsight(8432, 7.5, meals.length).then(setInsight);
  }, []);

  // Trigger confetti when stage reaches 3 (day closed)
  useEffect(() => {
    if (stage === 3) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D4AA', '#FFD700', '#FF6B6B', '#4ECDC4']
      });
    }
  }, [stage]);

  const toggleFutureHabit = (id: string) => {
    const current = user.selectedHabits || [];
    const updated = current.includes(id)
      ? current.filter(h => h !== id)
      : [...current, id];

    // Auto-save logic can be here or on "Next"
    // We'll update parent state immediately but maybe user wants "Save" button?
    // Let's rely on parent passing a "save" function.
    onUpdateUser({ ...user, selectedHabits: updated });
  };

  const stages = [
    {
      q: "How was your day?",
      content: (
        <div className="flex justify-between mt-8 px-4">
          {[
            { level: 1, icon: Icons.Frown, color: '#EF4444' },
            { level: 2, icon: Icons.Meh, color: '#F59E0B' },
            { level: 3, icon: Icons.Meh, color: '#3B82F6' }, // Neutral
            { level: 4, icon: Icons.Smile, color: '#10B981' },
            { level: 5, icon: Icons.SmilePlus, color: '#00D4AA' }
          ].map((m, i) => (
            <button
              key={i}
              onClick={() => { setMood(m.level); setStage(1); }}
              className={`transition-all duration-200 ${mood === m.level ? 'scale-125' : 'hover:scale-110'}`}
            >
              <IconBadge
                icon={m.icon}
                size="lg"
                color={m.color}
                variant="circle"
                glowIntensity={mood === m.level ? 'high' : 'none'}
                className={mood === m.level ? 'bg-white/10' : 'bg-transparent'}
              />
            </button>
          ))}
        </div>
      )
    },
    {
      q: "Energy Level?",
      content: (
        <div className="mt-8 px-4">
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="w-full accent-[#00D4AA] h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/40 mt-2"><span>Low</span><span className="text-lg font-bold text-white">{energy}</span><span>High</span></div>
          <button onClick={() => setStage(2)} className={`mt-10 w-full py-3 ${GLASS_BUTTON}`}>Next</button>
        </div>
      )
    },
    {
      q: "What helped today?",
      content: (
        <div className="mt-6 flex flex-wrap gap-3">
          {['Good Sleep', 'Workout', 'Healthy Food', 'Meditation', 'Walking'].map(t => (
            <button key={t} onClick={() => setStage(3)} className={`${GLASS_PANEL_LIGHT} px-4 py-2 text-sm`}>{t}</button>
          ))}
        </div>
      )
    },
    {
      q: "План на завтра", // Plan Tomorrow
      content: (
        <div className="mt-6 flex flex-col space-y-3 h-[50vh] overflow-y-auto pr-2">
          <p className="text-white/50 text-center mb-4 text-sm">Выбери задачи (привычки) на завтра</p>
          {AVAILABLE_HABITS.map(habit => (
            <button
              key={habit.id}
              onClick={() => toggleFutureHabit(habit.id)}
              className={`${GLASS_PANEL_LIGHT} p-3 flex items-center justify-between transition-all ${user.selectedHabits.includes(habit.id) ? 'bg-[#00D4AA]/20 border-[#00D4AA]' : 'border- transparent'}`}
            >
              <div className="flex items-center space-x-3">
                {/* @ts-ignore */}
                <IconBadge icon={Icons[habit.iconId] || Icons.Star} size="sm" variant="circle" color={user.selectedHabits.includes(habit.id) ? '#00D4AA' : 'white'} />
                <span className={user.selectedHabits.includes(habit.id) ? 'text-white' : 'text-white/50'}>
                  {habit.labelRu}
                </span>
              </div>
              {user.selectedHabits.includes(habit.id) && <Icons.Check size={16} className="text-[#00D4AA]" />}
            </button>
          ))}
          <button onClick={() => setStage(4)} className={`mt-6 w-full py-3 ${GLASS_BUTTON}`}>Готово</button>
        </div>
      )
    },
    {
      q: "День закрыт!", // Day Closed
      content: null // Content handled below in specific render check
    }
  ];

  if (stage === 4) { // Updated index for Day Closed
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-y-auto no-scrollbar">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00D4AA]/20 to-transparent pointer-events-none" />
        <div className="z-10 w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">Day Closed! <Icons.Star size={28} className="ml-2 text-yellow-400" /></h2>
          <p className="text-white/60 mb-8">See you tomorrow.</p>

          <div className={`${GLASS_PANEL} p-6 w-full mb-6 flex flex-col items-start text-left`}>
            <div className="flex items-center space-x-2 text-[#00D4AA] mb-3">
              <IconBadge icon={Icons.Idea} size="sm" color="#FFD700" variant="circle" />
              <span className="font-bold uppercase tracking-widest text-xs">Daily Insight</span>
            </div>
            <p className="text-lg leading-relaxed">
              {insight || "Generating insight..."}
            </p>
          </div>

          <button onClick={() => onFinish(insight || '')} className={`w-full py-4 ${ACCENT_BUTTON}`}>Done</button>
        </div>
      </div>
    );
  }

  // Handle stage 3 (Plan Tomorrow) special render if needed, or just let default render handle it
  // The default render uses stages[stage].q and content. 
  // We added "Plan Tomorrow" as stage 3.
  // "Day Closed" is stage 4.

  return (
    <div className="h-full flex flex-col p-8 pt-safe mt-6 relative overflow-y-auto no-scrollbar">
      <div className="absolute top-0 right-0 p-4 pt-safe z-50">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
          <Icons.X size={20} className="text-white/60" />
        </button>
      </div>

      <div className="flex space-x-2 mb-8 justify-center shrink-0">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 w-8 rounded-full ${i <= stage ? 'bg-[#00D4AA]' : 'bg-white/10'}`} />
        ))}
      </div>
      <h2 className="text-3xl font-bold text-center shrink-0">{stages[stage]?.q}</h2>
      <div className="flex-1">
        {stages[stage]?.content}
      </div>
    </div>
  );
};

import HistoryScreen from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';

// SettingsScreen moved to components/SettingsScreen.tsx

// --- Main App ---

// AppContent is the inner component with access to language context
function AppContent() {
  const [screen, setScreen] = useState<Screen>('ONBOARDING');
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [user, setUser] = useState<UserSettings | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, completedDaysThisWeek: 0, missedDaysThisWeek: 7, lastCompletedDate: null, freezesAvailable: 0, freezesUsed: 0, lastFreezeEarned: null });
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<{ summary: string; insights: string[]; recommendation: string; grade: string } | null>(null);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);
  const [userXp, setUserXp] = useState(0);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [showSmartScanner, setShowSmartScanner] = useState(false);

  // Language from context
  const { language, setLanguage, t } = useLanguage();
  const { openPaywall } = usePremium();

  // Load health metrics
  const loadHealthMetrics = async () => {
    const metrics = await getHealthMetrics();
  };

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Sync: Initial Pull
  useEffect(() => {
    const initSync = async () => {
      if (syncService.token) {
        const data = await syncService.pullData();
        if (data) {
          if (data.settings) setUser(prev => ({ ...prev, ...data.settings } as UserSettings));
          if (data.logs) setLogs(data.logs);
          if (data.habits) setHabits(data.habits);
          setSyncStatus('idle');
        }
      }
    };
    initSync();
  }, []);

  // Sync: Auto-Push on Change
  // Telegram Auto-Login & Sync
  useEffect(() => {
    const initAuth = async () => {
      // 1. Try Telegram Auth first
      // @ts-ignore
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData && !syncService.token) {
        // @ts-ignore
        await syncService.loginTelegram(window.Telegram.WebApp.initData);
      }

      // 2. Pull data if token exists
      if (syncService.token) {
        const data = await syncService.pullData();
        if (data) {
          if (data.settings) setUser(prev => ({ ...prev, ...data.settings } as UserSettings));
          if (data.logs) setLogs(data.logs);
          if (data.habits) setHabits(data.habits);
          setSyncStatus('idle');
        }
      }
    };
    initAuth();
  }, []);

  // Sync: Auto-Push on Change
  useEffect(() => {
    if (!user || !syncService.token) return;

    const timeout = setTimeout(async () => {
      setSyncStatus('syncing');
      const success = await syncService.pushData({
        settings: user,
        logs,
        habits
      });
      setSyncStatus(success ? 'idle' : 'error');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [user, logs, habits]);

  // Load data on mount
  useEffect(() => {
    const savedUser = loadUserSettings();
    if (savedUser?.onboardingComplete) {
      // Economy Migration: Ensure new fields exist
      if (savedUser.coins === undefined) {
        savedUser.coins = INITIAL_ECONOMY.coins;
        savedUser.inventory = INITIAL_ECONOMY.inventory;
        savedUser.equipped = INITIAL_ECONOMY.equipped;
      }
      setUser(savedUser);
      setScreen('DASHBOARD');

      // DEMO: Auto-init Bad Habit if none exist
      const badHabits = loadBadHabits();
      if (badHabits.length === 0) {
        const template = AVAILABLE_BAD_HABITS.find(h => h.id === 'smoking');
        if (template) {
          saveBadHabits([{
            ...template,
            icon: template.iconId,
            limit: 10,
            baseline: 15,
            logs: [],
            restorationXP: 0,
            currentStreak: 0
          }]);
          // Force re-render/update
          // Note: In real app we need a setBadHabits state or event bus, 
          // but components read from localStorage on mount.
        }
      }

      // Load logs
      const allLogs = loadAllDailyLogs();
      setLogs(allLogs);

      // Calculate streak
      const calculatedStreak = calculateStreak(allLogs);
      setStreak(calculatedStreak);

      // Get or create today's log
      const selectedHabitLabels = savedUser.selectedHabits.map(id => {
        const habit = AVAILABLE_HABITS.find(h => h.id === id);
        return { id, label: habit ? habit.label : id, labelRu: habit ? habit.labelRu : id, completed: false };
      });
      const todayLog = getOrCreateTodayLog(selectedHabitLabels.length > 0 ? selectedHabitLabels : MOCK_HABITS);
      setHabits(todayLog.habits);
      setMeals(todayLog.meals.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      setTodayFocusMinutes(todayLog.metrics.focusMinutes || 0);

      // Load health metrics
      loadHealthMetrics();

      // Load XP
      const gamification = loadGamificationData();
      setUserXp(gamification.xp);

      // Update social stats (sync)
      loadGroups().forEach(group => {
        updateGroupMemberStats(group.id, savedUser.name, calculatedStreak.currentStreak, gamification.xp);
      });
    }
  }, []);

  // Save today's log whenever habits or meals change
  useEffect(() => {
    if (user?.onboardingComplete && habits.length > 0) {
      const todayLog: DailyLog = {
        date: getTodayDate(),
        meals,
        habits,
        metrics: {
          steps: healthMetrics?.steps || 0,
          sleepHours: healthMetrics?.sleepHours || 0,
          activeMinutes: healthMetrics?.activeMinutes || 0,
          focusMinutes: todayFocusMinutes,
        },
        closed: false,
      };
      saveDailyLog(todayLog);
    }
  }, [habits, meals, user, healthMetrics, todayFocusMinutes]);

  // Handle metric updates
  const handleMetricUpdate = (type: 'steps' | 'sleep' | 'active', value: number) => {
    if (!healthMetrics) return;

    const updated = { ...healthMetrics };

    if (type === 'steps') {
      updated.steps = value;
      updated.stepsProgress = Math.min((value / updated.stepsGoal) * 100, 100);
    } else if (type === 'sleep') {
      updated.sleepHours = value;
      updated.sleepProgress = Math.min((value / updated.sleepGoal) * 100, 100);
    } else if (type === 'active') {
      updated.activeMinutes = value;
      updated.activeProgress = Math.min((value / updated.activeGoal) * 100, 100);
    }

    updated.source = 'manual';
    updated.lastUpdated = new Date();

    setHealthMetrics(updated);
  };

  const handleFocusComplete = (minutes: number) => {
    setTodayFocusMinutes(prev => prev + minutes);
    // Refresh XP
    setUserXp(loadGamificationData().xp);
  };

  // Handle Add Daily Task
  const handleAddTask = (text: string, date: string) => {
    if (!user) return;
    const newTask = {
      id: Date.now().toString(),
      title: text,
      completed: false,
      date
    };
    const updatedUser = {
      ...user,
      dailyTasks: [...(user.dailyTasks || []), newTask]
    };
    setUser(updatedUser);
    saveUserSettings(updatedUser);
  };

  // Handle Toggle Daily Task
  const handleToggleTask = (taskId: string) => {
    if (!user) return;
    const updatedTasks = (user.dailyTasks || []).map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedUser = { ...user, dailyTasks: updatedTasks };
    setUser(updatedUser);
    saveUserSettings(updatedUser);
  };

  // Weekly Review handler
  const handleRequestWeeklyReview = async () => {
    const summary = getWeeklySummary(logs);
    const review = await generateWeeklyReview({
      ...summary,
      currentStreak: streak.currentStreak
    });
    setWeeklyReview(review);
    setShowWeeklyReview(true);
  };

  // Sync Social Stats
  useEffect(() => {
    if (user && screen === 'SOCIAL') {
      const groups = loadGroups();
      groups.forEach(g => {
        updateGroupMemberStats(g.id, user.name, streak.currentStreak, userXp);
      });
    }
  }, [user, streak, userXp, screen]);

  // Navigation Logic
  const handleOnboardingComplete = (settings: UserSettings) => {
    setUser(settings);

    // Initialize habits from selected
    const selectedHabitLabels = settings.selectedHabits.map(id => {
      const habit = AVAILABLE_HABITS.find(h => h.id === id);
      return { id, label: habit ? habit.label : id, labelRu: habit ? habit.labelRu : id, completed: false };
    });
    setHabits(selectedHabitLabels);

    setScreen('DASHBOARD');
  };

  const handleAddMeal = (meal: Meal) => {
    setMeals([...meals, meal]);
    setScreen('DASHBOARD');
  };

  const toggleHabit = (id: string) => {
    hapticMedium(); // Vibrate on habit toggle

    // Coin Reward for Completion
    const habit = habits.find(h => h.id === id);
    if (habit && !habit.completed) {
      addCoins(10);
      if (user) setUser((prev) => prev ? ({ ...prev, coins: (prev.coins || 0) + 10 }) : null);
    }

    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const addHabit = (habit: Habit) => {
    setHabits([...habits, habit]);
  };

  const handleCheckInFinish = (insight: string) => {
    hapticSuccess(); // Celebration vibration on day close
    // Update today's log as closed
    const todayLog: DailyLog = {
      date: getTodayDate(),
      meals,
      habits,
      metrics: {
        steps: 8432,
        sleepHours: 7.33,
        activeMinutes: 45,
      },
      insight,
      closed: true,
    };
    saveDailyLog(todayLog);

    // Recalculate streak
    const allLogs = loadAllDailyLogs();
    setLogs(allLogs);
    setStreak(calculateStreak(allLogs));

    setScreen('HISTORY');
  };

  const handleReset = () => {
    clearAllData();
    setUser(null);
    setHabits([]);
    setMeals([]);
    setLogs([]);
    setStreak({ currentStreak: 0, longestStreak: 0, completedDaysThisWeek: 0, missedDaysThisWeek: 7, lastCompletedDate: null });
    setScreen('ONBOARDING');
  };

  const showTabBar = ['DASHBOARD', 'HISTORY', 'SOCIAL', 'SETTINGS', 'SHOP'].includes(screen);

  return (
    <div className="relative w-full h-screen bg-[#000000] text-white overflow-hidden font-sans selection:bg-[#00D4AA]/30">
      {/* Global Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1E] via-black to-[#0d0d0d] z-0" />

      {/* Content Container - max-width for desktop view constraint */}
      <div className="relative z-10 w-full h-full max-w-md mx-auto bg-black/20 shadow-2xl overflow-hidden flex flex-col pt-14">
        {user && screen !== 'ONBOARDING' && (
          <div className="absolute top-0 right-0 p-4 z-50">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => !user.isPro && openPaywall()}
                className={`backdrop-blur-md px-3 py-1 rounded-full border text-xs font-mono transition ${user.isPro ? 'bg-black/40 border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-black/40 border-white/10 text-white/50 hover:bg-white/10'}`}
              >
                {user.isPro ? (language === 'ru' ? 'ПРЕМИУМ' : 'PRO ACCESS') : (language === 'ru' ? 'БЕСПЛАТНО' : 'FREE PLAN')}
              </button>

              {/* Shop Button */}
              <button
                onClick={() => setScreen('SHOP')}
                className="backdrop-blur-md px-3 py-1 rounded-full border border-[#FFD700]/30 bg-black/40 text-[#FFD700] text-xs font-bold flex items-center space-x-1 hover:bg-[#FFD700]/10 transition"
              >
                <span>{user.coins?.toLocaleString() || 0}</span>
                <span>🟡</span>
              </button>

              {/* AI Coach Button */}
              <button
                onClick={() => setScreen('COACH')}
                className="backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/30 bg-black/40 text-blue-400 text-xs font-bold flex items-center space-x-1 hover:bg-blue-500/10 transition"
              >
                <span>AI</span>
              </button>

              {/* Profile / Auth Button */}
              <button
                onClick={() => setIsAuthOpen(true)}
                className={`backdrop-blur-md px-2 py-1 rounded-full border border-white/10 bg-black/40 text-white/70 text-xs font-bold flex items-center space-x-1 hover:bg-white/10 transition ${syncStatus === 'syncing' ? 'animate-pulse' : ''}`}
              >
                <Icons.User size={14} className={syncStatus === 'error' ? 'text-red-500' : ''} />
                {syncService.token && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
              </button>
            </div>
          </div>
        )}

        {isAuthOpen && (
          <AuthScreen
            onSuccess={() => {
              setIsAuthOpen(false);
              // Force a pull after login to merge/update
              syncService.pullData().then(data => {
                if (data?.settings) setUser(prev => ({ ...prev, ...data.settings } as UserSettings));
                if (data?.logs) setLogs(data.logs);
                if (data?.habits) setHabits(data.habits);
              });
            }}
            onClose={() => setIsAuthOpen(false)}
          />
        )}

        {screen === 'COACH' && user && (
          <AICoachScreen
            user={user}
            streak={streak}
            logs={logs}
            onClose={() => setScreen('DASHBOARD')}
          />
        )}

        {screen === 'ONBOARDING' && <OnboardingScreen onComplete={handleOnboardingComplete} />}

        {screen === 'DASHBOARD' && user && (
          <Dashboard
            user={user}
            habits={habits}
            meals={meals}
            streak={streak}
            healthMetrics={healthMetrics}
            toggleHabit={toggleHabit}
            updateHabit={updateHabit}
            onAddHabit={addHabit}
            todayMood={todayMood}
            onMoodChange={setTodayMood}
            goToAddMeal={() => setShowSmartScanner(true)}
            closeDay={() => setScreen('CHECK_IN')}
            onMetricUpdate={handleMetricUpdate}
            logs={logs}

            onOpenFocus={() => setIsFocusOpen(true)}
            onRefreshXp={() => setUserXp(loadGamificationData().xp)}
            userXp={userXp}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
          />
        )}

        {screen === 'ADD_MEAL' && (
          <AddMealScreen onSave={handleAddMeal} onCancel={() => setScreen('DASHBOARD')} />
        )}

        {screen === 'CHECK_IN' && (
          <CheckInScreen
            onFinish={handleCheckInFinish}
            onClose={() => setScreen('DASHBOARD')}
            meals={meals}
            habits={habits}
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              saveUserSettings(updated);
            }}
          />
        )}

        {screen === 'HISTORY' && (
          <HistoryScreen logs={logs} streak={streak} onRequestWeeklyReview={handleRequestWeeklyReview} />
        )}

        {screen === 'SOCIAL' && user && (
          <SocialScreen
            userId={user.name}
            userName={user.name}
            userStreak={streak.currentStreak}
            userXp={user.xp}
            onChallengeComplete={addXp}
          />
        )}

        {screen === 'LOOKS' && (
          <UmaxScreen />
        )}

        {/* Weekly Review Modal */}
        {showWeeklyReview && weeklyReview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowWeeklyReview(false)}>
            <div className={`${GLASS_PANEL} p-6 w-full max-w-sm border-[#00D4AA]/30 animate-slide-up max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Weekly Review</h3>
                <div className={`text-3xl font-bold ${weeklyReview.grade === 'A' ? 'text-[#00D4AA]' : weeklyReview.grade === 'B' ? 'text-yellow-400' : 'text-orange-400'}`}>
                  {weeklyReview.grade}
                </div>
              </div>

              <p className="text-white/70 mb-6">{weeklyReview.summary}</p>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Insights</h4>
                {weeklyReview.insights.map((insight, i) => (
                  <div key={i} className={`${GLASS_PANEL_LIGHT} p-3 flex items-start space-x-3`}>
                    <span className="text-[#00D4AA]">💡</span>
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>

              <div className={`${GLASS_PANEL_LIGHT} p-4 mb-6 border-l-4 border-[#00D4AA]`}>
                <h4 className="text-xs font-semibold text-[#00D4AA] uppercase tracking-wider mb-2">Recommendation</h4>
                <p className="text-sm">{weeklyReview.recommendation}</p>
              </div>

              <button onClick={() => setShowWeeklyReview(false)} className={`w-full py-3 ${ACCENT_BUTTON}`}>
                Got it!
              </button>
            </div>
          </div>
        )}

        {screen === 'SETTINGS' && user && (
          <SettingsScreen
            user={user}
            onUpdate={setUser}
            onReset={handleReset}
            onDeviceChange={loadHealthMetrics}
            streak={streak}
            onStreakUpdate={setStreak}
          />
        )}

        {screen === 'SHOP' && user && (
          <ShopScreen
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              saveUserSettings(updated);
            }}
            onClose={() => setScreen('DASHBOARD')}
          />
        )}

        {/* Tab Bar */}
        {showTabBar && (
          <TabBar current={screen} onChange={setScreen} />
        )}
        <InstallPrompt />
      </div>

      {/* Focus Mode Overlay */}
      {isFocusOpen && <FocusScreen onBackendExit={() => setIsFocusOpen(false)} onComplete={handleFocusComplete} />}

      {/* Smart Food Scanner Overlay */}
      {showSmartScanner && (
        <SmartFoodScanner
          onFoodAdded={(food) => {
            handleAddMeal({
              name: food.name,
              macros: food.macros,
              type: 'Lunch' as const,
              id: Date.now().toString(),
              timestamp: new Date()
            });
            setShowSmartScanner(false);
          }}
          onClose={() => setShowSmartScanner(false)}
        />
      )}
    </div>
  );
}

// Wrapped export with LanguageProvider
export default function App() {
  return (
    <LanguageProvider>
      <PremiumProvider>
        <AppContent />
      </PremiumProvider>
    </LanguageProvider>
  );
}