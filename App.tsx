import React, { useState, useEffect, useRef } from 'react';
import {
  GLASS_PANEL,
  GLASS_PANEL_LIGHT,
  GLASS_BUTTON,
  ACCENT_BUTTON,
  MOCK_HABITS,
  TEXT_GRADIENT,
  AVAILABLE_HABITS,
  DEFAULT_TARGETS
} from './constants';
import { Screen, Meal, Habit, UserSettings, DailyLog, StreakData } from './types';
import { Icons } from './components/Icons';
import { analyzeFoodImage, generateDailyInsight, generateWeeklyReview } from './services/geminiService';
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
import { createInvoice, openTelegramInvoice } from './services/paymentService';
import type { Language } from './locales';

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

// Tab Bar Component
const TabBar = ({ current, onChange }: { current: Screen, onChange: (s: Screen) => void }) => {
  const tabs = [
    { key: 'DASHBOARD' as Screen, icon: Icons.Active, label: 'Today' },
    { key: 'HISTORY' as Screen, icon: Icons.Chart, label: 'History' },
    { key: 'SETTINGS' as Screen, icon: Icons.Settings, label: 'Settings' },
  ];

  return (
    <div className={`${GLASS_PANEL} rounded-t-[24px] rounded-b-none border-b-0 px-4 py-3 pb-8 flex justify-around items-center`}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex flex-col items-center space-y-1 transition-all ${current === tab.key ? 'text-[#00D4AA]' : 'text-white/40'}`}
        >
          <tab.icon size={22} />
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Screens ---

const OnboardingScreen = ({ onComplete }: { onComplete: (settings: UserSettings) => void }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>(['water', 'workout', 'no-sugar']);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

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
    <div className="h-full flex flex-col px-5 pt-24 pb-10 relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#00D4AA]/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 flex-1 flex flex-col items-center overflow-y-auto overflow-x-visible no-scrollbar pb-6 p-1">
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-white/20 to-transparent backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(0,212,170,0.3)] flex items-center justify-center mb-4">
              <Icons.Active size={40} className="text-[#00D4AA]" />
            </div>
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
              {AVAILABLE_HABITS.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-4 text-left ${GLASS_PANEL_LIGHT} flex items-center space-x-3 ${selectedHabits.includes(habit.id) ? 'ring-2 ring-[#00D4AA] bg-[#00D4AA]/10' : ''}`}
                >
                  <span className="text-2xl">{habit.icon}</span>
                  <span className="text-sm font-medium">{habit.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="w-full flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-center">{t.onboarding.yourStats}</h2>
            <p className="text-white/50 text-sm mb-6 text-center">Helps calculate personalized calorie goals</p>
            <div className="space-y-4">
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
              selectedHabits,
              onboardingComplete: true
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
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Meal | null>(null);
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);

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
        const data = await analyzeFoodImage(dataUrl);
        if (data) {
          setResult({
            id: Date.now().toString(),
            type: mealType,
            name: data.name,
            macros: data.macros,
            imageUri: dataUrl,
            timestamp: new Date()
          });
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
        const data = await analyzeFoodImage(dataUrl);
        if (data) {
          setResult({
            id: Date.now().toString(),
            type: mealType,
            name: data.name,
            macros: data.macros,
            imageUri: dataUrl,
            timestamp: new Date()
          });
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
            <div className="absolute top-6 left-0 right-0 flex justify-center space-x-2 px-4 z-20">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setMealType(t)}
                  className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium border transition-all ${mealType === t ? 'bg-[#00D4AA] border-[#00D4AA] text-black' : 'bg-black/40 border-white/10'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="h-[200px] glass-panel-bottom relative flex flex-col items-center justify-center pb-8 pt-4 z-10 bg-black">
            <p className="text-white/60 mb-6 font-medium">Capture your {mealType.toLowerCase()}</p>
            <div className="flex items-center justify-between w-full px-10">
              <label className="p-3 rounded-full bg-white/10 backdrop-blur active:scale-95 transition cursor-pointer">
                <Icons.Gallery size={24} />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white/30 p-1">
                <div className="w-full h-full bg-white rounded-full" />
              </button>

              <button onClick={onCancel} className="p-3 rounded-full bg-white/10 backdrop-blur active:scale-95 transition">
                <Icons.Close size={24} />
              </button>
            </div>
          </div>
        </>
      ) : (
        // Result View
        <div className="h-full relative flex flex-col">
          <div className="h-[45%] w-full relative shrink-0">
            <img src={image} className="w-full h-full object-cover" alt="Meal" />
            <button onClick={() => setImage(null)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full backdrop-blur-md z-20">
              <Icons.ArrowRight className="rotate-180" size={20} />
            </button>
          </div>

          <div className={`flex-1 ${GLASS_PANEL} rounded-t-[32px] -mt-6 z-10 p-6 flex flex-col animate-slide-up overflow-hidden`}>
            {analyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                <p>Analyzing with Gemini AI...</p>
              </div>
            ) : result ? (
              <>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
                  <h2 className="text-3xl font-bold mb-1">{result.name}</h2>
                  <div className="flex items-center space-x-2 text-[#00D4AA] mb-6">
                    <Icons.Energy size={18} fill="currentColor" />
                    <span className="text-xl font-semibold">~{getCalorieRange()} kcal</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { l: 'Protein', v: getAdjustedMacros()?.protein + 'g' },
                      { l: 'Fat', v: getAdjustedMacros()?.fat + 'g' },
                      { l: 'Carbs', v: getAdjustedMacros()?.carbs + 'g' }
                    ].map((m) => (
                      <div key={m.l} className={`${GLASS_PANEL_LIGHT} p-3 flex flex-col items-center`}>
                        <span className="text-xs text-white/50">{m.l}</span>
                        <span className="font-semibold text-lg">{m.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-white/50 mb-2">Portion Size</p>
                    <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
                      {[
                        { label: 'Small', mult: 0.7 },
                        { label: 'Medium', mult: 1 },
                        { label: 'Large', mult: 1.3 }
                      ].map(s => (
                        <button
                          key={s.label}
                          onClick={() => setPortionMultiplier(s.mult)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${portionMultiplier === s.mult ? 'bg-white/20' : 'text-white/50'}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    onClick={() => {
                      const adjustedMacros = getAdjustedMacros();
                      if (adjustedMacros) {
                        onSave({
                          ...result,
                          type: mealType,
                          macros: adjustedMacros
                        });
                      }
                    }}
                    className={`w-full py-4 ${ACCENT_BUTTON} text-lg`}
                  >
                    Add Meal
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
            <Icons.Close size={24} />
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
  goToAddMeal,
  closeDay,
  onMetricUpdate
}: {
  user: UserSettings,
  habits: Habit[],
  meals: Meal[],
  streak: StreakData,
  healthMetrics: HealthMetrics | null,
  toggleHabit: (id: string) => void,
  goToAddMeal: () => void,
  closeDay: () => void,
  onMetricUpdate: (type: 'steps' | 'sleep' | 'active', value: number) => void
}) => {
  const [editingMetric, setEditingMetric] = useState<{ type: 'steps' | 'sleep' | 'active', current: number } | null>(null);
  const { t, language } = useLanguage();

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
    <div className="h-full flex flex-col px-5 pt-24 space-y-5 overflow-y-auto no-scrollbar pb-28">
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
          <span className="text-2xl">🔥</span>
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

      {/* Main Stats - Dual Rings */}
      <div className={`${GLASS_PANEL} p-4 relative overflow-hidden shrink-0`}>
        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-[#00D4AA]/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex justify-around items-center">
          <ProgressRing progress={calPercent} label={`${totalCals}`} subLabel={`/ ${user.targetCalories} kcal`} size={65} />
          <ProgressRing progress={proteinPercent} label={`${totalProtein}g`} subLabel={`/ ${user.targetProtein}g protein`} color="#FF6B6B" size={65} />
        </div>
      </div>

      {/* Metrics Row - Editable */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 shrink-0">
        {[
          { type: 'steps' as const, icon: Icons.Steps, val: formatSteps(metrics.steps), label: 'Steps', progress: metrics.stepsProgress },
          { type: 'sleep' as const, icon: Icons.Sleep, val: formatSleep(metrics.sleepHours), label: 'Sleep', progress: metrics.sleepProgress },
          { type: 'active' as const, icon: Icons.Active, val: formatActive(metrics.activeMinutes), label: 'Active', progress: metrics.activeProgress },
        ].map((m, i) => (
          <button
            key={i}
            onClick={() => handleMetricClick(m.type)}
            className={`flex-none w-28 ${GLASS_PANEL_LIGHT} p-3 flex flex-col justify-between h-28 hover:bg-white/10 transition-all cursor-pointer active:scale-95`}
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#00D4AA]">
              <m.icon size={16} />
            </div>
            <div>
              <p className="text-lg font-bold">{m.val}</p>
              <p className="text-xs text-white/50">{m.label}</p>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#00D4AA] transition-all duration-500" style={{ width: `${m.progress}%` }} />
            </div>
          </button>
        ))}
      </div>

      {/* Meals */}
      <div className="shrink-0">
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-xl font-bold">{t.dashboard.meals}</h3>
          <button onClick={goToAddMeal} className="text-[#00D4AA] text-sm font-medium flex items-center">
            <Icons.Plus size={16} className="mr-1" /> {t.common.add}
          </button>
        </div>
        <div className="space-y-3">
          {meals.map(meal => (
            <div key={meal.id} className={`${GLASS_PANEL_LIGHT} p-3 flex items-center space-x-3`}>
              {meal.imageUri ? (
                <img src={meal.imageUri} className="w-12 h-12 rounded-xl object-cover" alt={meal.name} />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10" />
              )}
              <div className="flex-1">
                <p className="font-medium">{meal.name}</p>
                <p className="text-xs text-white/50">{meal.type} • ~{meal.macros.calories} kcal</p>
              </div>
            </div>
          ))}
          {meals.length < 4 && (
            <button onClick={goToAddMeal} className="w-full h-16 rounded-[20px] border border-dashed border-white/20 flex items-center justify-center text-white/30 hover:bg-white/5 transition">
              <Icons.Camera size={20} className="mr-2" /> {t.dashboard.logMeal}
            </button>
          )}
        </div>
      </div>

      {/* Habits */}
      <div className="shrink-0">
        <h3 className="text-xl font-bold mb-3">{t.dashboard.habits}</h3>
        <div className="grid grid-cols-1 gap-3">
          {habits.map(habit => (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${habit.completed ? 'bg-[#00D4AA] border-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.3)]' : 'bg-white/5 border-white/10'}`}
            >
              <span className={`font-medium ${habit.completed ? 'text-black' : 'text-white'}`}>{habit.label}</span>
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${habit.completed ? 'border-black/20 bg-black/10' : 'border-white/30'}`}>
                {habit.completed && <Icons.Check size={14} className="text-black" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={closeDay} className={`w-full py-4 ${GLASS_PANEL} border-[#00D4AA]/30 text-[#00D4AA] font-semibold mt-4 shadow-lg hover:shadow-[0_0_20px_rgba(0,212,170,0.2)] transition shrink-0`}>
        {t.dashboard.closeDay}
      </button>
    </div>
  );
};

const CheckInScreen = ({ onFinish, meals, habits }: { onFinish: (insight: string) => void, meals: Meal[], habits: Habit[] }) => {
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

  const stages = [
    {
      q: "How was your day?",
      content: (
        <div className="flex justify-between text-4xl mt-8">
          {['😫', '😕', '😐', '🙂', '😊'].map((e, i) => (
            <button
              key={e}
              onClick={() => { setMood(i + 1); setStage(1); }}
              className={`hover:scale-125 transition duration-200 ${mood === i + 1 ? 'scale-125' : ''}`}
            >
              {e}
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
    }
  ];

  if (stage === 3) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-y-auto no-scrollbar">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00D4AA]/20 to-transparent pointer-events-none" />
        <div className="z-10 w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-2">Day Closed! ✨</h2>
          <p className="text-white/60 mb-8">See you tomorrow.</p>

          <div className={`${GLASS_PANEL} p-6 w-full mb-6 flex flex-col items-start text-left`}>
            <div className="flex items-center space-x-2 text-[#00D4AA] mb-3">
              <Icons.Idea size={20} />
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

  return (
    <div className="h-full flex flex-col p-8 pt-20 relative overflow-y-auto no-scrollbar">
      <div className="flex space-x-2 mb-8 justify-center shrink-0">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 w-8 rounded-full ${i <= stage ? 'bg-[#00D4AA]' : 'bg-white/10'}`} />
        ))}
      </div>
      <h2 className="text-3xl font-bold text-center shrink-0">{stages[stage].q}</h2>
      <div className="flex-1">
        {stages[stage].content}
      </div>
    </div>
  );
};

const HistoryScreen = ({ logs, streak, onRequestWeeklyReview }: {
  logs: DailyLog[],
  streak: StreakData,
  onRequestWeeklyReview: () => void
}) => {
  const [activeTab, setActiveTab] = useState<'Calendar' | 'Stats' | 'AI Coach'>('Calendar');
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
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

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
            <span>❄️</span>
            <span className="text-sm font-medium text-blue-300">{streak.freezesAvailable}</span>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className={`p-1 rounded-xl bg-white/10 flex shrink-0`}>
        {(['Calendar', 'Stats', 'AI Coach'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab ? 'bg-white/20 shadow-sm' : 'text-white/50'}`}
          >
            {tab === 'Calendar' ? t.history.calendar : tab === 'Stats' ? t.history.stats : t.history.aiCoach}
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
                <p className="text-xs text-white/50">{t.history.current} 🔥</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{streak.longestStreak}</p>
                <p className="text-xs text-white/50">{t.history.longest}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{streak.freezesAvailable}</p>
                <p className="text-xs text-white/50">{t.history.freezes} ❄️</p>
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
        </>
      )}

      {activeTab === 'AI Coach' && (
        <div className="space-y-4">
          <div className={`${GLASS_PANEL} p-6 text-center`}>
            <span className="text-5xl mb-4 block">🤖</span>
            <h3 className="text-xl font-bold mb-2">{t.history.weeklyAICoach}</h3>
            <p className="text-sm text-white/60 mb-6">
              {t.history.weeklyAICoachDesc}
            </p>
            <button
              onClick={onRequestWeeklyReview}
              className={`w-full py-4 ${ACCENT_BUTTON} flex items-center justify-center space-x-2`}
            >
              <span>{t.history.generateReview}</span>
              <Icons.ArrowRight size={18} />
            </button>
          </div>

          {/* Sample Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white/70">{t.history.recentInsights}</h4>
            {[
              { icon: '🏃', txt: "More steps = better sleep quality" },
              { icon: '🥗', txt: "High protein lunch reduced snacking" },
              { icon: '⚡', txt: "Energy peaks after morning workouts" },
            ].map((ins, i) => (
              <div key={i} className={`${GLASS_PANEL_LIGHT} p-4 flex items-center space-x-3`}>
                <span className="text-2xl">{ins.icon}</span>
                <p className="text-sm font-medium">{ins.txt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsScreen = ({
  user,
  onUpdate,
  onReset,
  onDeviceChange,
  language,
  onLanguageChange
}: {
  user: UserSettings,
  onUpdate: (u: UserSettings) => void,
  onReset: () => void,
  onDeviceChange: () => void,
  language?: Language,
  onLanguageChange?: (lang: Language) => void
}) => {
  const { t } = useLanguage();
  const [calories, setCalories] = useState(user.targetCalories.toString());
  const [protein, setProtein] = useState(user.targetProtein.toString());
  const [connectedDevice, setConnectedDevice] = useState<TerraUser | null>(getConnectedDevice());
  const [showProviders, setShowProviders] = useState(false);

  const save = () => {
    const updated = {
      ...user,
      targetCalories: parseInt(calories) || DEFAULT_TARGETS.calories,
      targetProtein: parseInt(protein) || DEFAULT_TARGETS.protein,
    };
    saveUserSettings(updated);
    onUpdate(updated);
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

  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    // Default price 499 RUB for Premium
    const link = await createInvoice(499, 'Premium Month');
    setIsUpgrading(false);

    if (link) {
      openTelegramInvoice(link);
    } else {
      alert('Could not create invoice. Please try again later.');
    }
  };

  return (
    <div className="flex-1 px-5 pt-20 flex flex-col space-y-6 overflow-y-auto no-scrollbar pb-28">
      <h2 className="text-2xl font-bold">{t.settings.title}</h2>

      {/* Connected Devices */}
      <div className={`${GLASS_PANEL} p-5 space-y-4`}>
        <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider">{t.settings.connectedDevices}</h3>

        {connectedDevice && connectedProvider ? (
          <div className={`${GLASS_PANEL_LIGHT} p-4 flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{connectedProvider.icon}</span>
              <div>
                <p className="font-semibold">{connectedProvider.name}</p>
                <p className="text-xs text-[#00D4AA]">✓ Connected</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-red-400 text-sm"
            >
              {t.common.disconnect}
            </button>
          </div>
        ) : (
          <>
            {!showProviders ? (
              <button
                onClick={() => setShowProviders(true)}
                className={`w-full p-4 ${GLASS_PANEL_LIGHT} flex items-center justify-center space-x-2 text-[#00D4AA]`}
              >
                <Icons.Plus size={18} />
                <span className="font-medium">{t.settings.connectFitness}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-white/50 mb-3">Select your device:</p>
                <div className="grid grid-cols-2 gap-2">
                  {TERRA_PROVIDERS.slice(0, 6).map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => handleConnect(provider.id)}
                      className={`${GLASS_PANEL_LIGHT} p-3 flex items-center space-x-2 text-left hover:bg-white/20 transition`}
                    >
                      <span className="text-xl">{provider.icon}</span>
                      <span className="text-sm font-medium">{provider.name}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowProviders(false)}
                  className="w-full text-center text-white/50 text-sm mt-2"
                >
                  {t.common.cancel}
                </button>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-white/40 text-center">
          {t.settings.syncsAuto}
        </p>
      </div>

      {/* Goals Section */}
      <div className={`${GLASS_PANEL} p-5 space-y-4`}>
        <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider">{t.settings.dailyGoals}</h3>

        <div className="space-y-3">
          <div className={`${GLASS_PANEL_LIGHT} p-4`}>
            <label className="text-sm text-white/50 block mb-2">{t.settings.caloriesGoal}</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-transparent text-xl font-semibold outline-none"
            />
          </div>
          <div className={`${GLASS_PANEL_LIGHT} p-4`}>
            <label className="text-sm text-white/50 block mb-2">{t.settings.proteinGoal}</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full bg-transparent text-xl font-semibold outline-none"
            />
          </div>
        </div>

        <button onClick={save} className={`w-full py-3 ${ACCENT_BUTTON}`}>
          {t.settings.saveGoals}
        </button>
      </div>

      {/* Subscription Placeholder */}
      <div className={`${GLASS_PANEL} p-5`}>
        <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">{t.settings.subscription}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{t.settings.freePlan}</p>
            <p className="text-xs text-white/50">{t.settings.freeFeatures}</p>
          </div>
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className={`px-4 py-2 ${GLASS_BUTTON} text-[#00D4AA] text-sm font-semibold disabled:opacity-50`}
          >
            {isUpgrading ? 'Loading...' : t.common.upgrade}
          </button>
        </div>
      </div>

      {/* Goal */}
      <div className={`${GLASS_PANEL_LIGHT} p-4`}>
        <p className="text-sm text-white/50">{t.settings.yourGoal}</p>
        <p className="font-semibold">{user.goal}</p>
      </div>

      {/* Language Selector */}
      {onLanguageChange && (
        <div className={`${GLASS_PANEL} p-5`}>
          <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">Language / Язык</h3>
          <div className="flex space-x-3">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`flex-1 py-3 ${GLASS_BUTTON} flex items-center justify-center space-x-2 ${language === lang ? 'ring-2 ring-[#00D4AA]' : ''}`}
              >
                <span className="text-xl">{lang === 'en' ? '🇬🇧' : '🇷🇺'}</span>
                <span className="font-medium">{LANGUAGE_NAMES[lang]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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

// --- Main App ---

// AppContent is the inner component with access to language context
function AppContent() {
  const [screen, setScreen] = useState<Screen>('ONBOARDING');
  const [user, setUser] = useState<UserSettings | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, completedDaysThisWeek: 0, missedDaysThisWeek: 7, lastCompletedDate: null, freezesAvailable: 0, freezesUsed: 0, lastFreezeEarned: null });
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<{ summary: string; insights: string[]; recommendation: string; grade: string } | null>(null);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  // Language from context
  const { language, setLanguage, t } = useLanguage();

  // Load health metrics
  const loadHealthMetrics = async () => {
    const metrics = await getHealthMetrics();
    setHealthMetrics(metrics);
  };

  // Load data on mount
  useEffect(() => {
    const savedUser = loadUserSettings();
    if (savedUser?.onboardingComplete) {
      setUser(savedUser);
      setScreen('DASHBOARD');

      // Load logs
      const allLogs = loadAllDailyLogs();
      setLogs(allLogs);

      // Calculate streak
      setStreak(calculateStreak(allLogs));

      // Get or create today's log
      const selectedHabitLabels = savedUser.selectedHabits.map(id => {
        const habit = AVAILABLE_HABITS.find(h => h.id === id);
        return { id, label: habit ? `${habit.icon} ${habit.label}` : id, completed: false };
      });
      const todayLog = getOrCreateTodayLog(selectedHabitLabels.length > 0 ? selectedHabitLabels : MOCK_HABITS);
      setHabits(todayLog.habits);
      setMeals(todayLog.meals.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));

      // Load health metrics
      loadHealthMetrics();
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
        },
        closed: false,
      };
      saveDailyLog(todayLog);
    }
  }, [habits, meals, user, healthMetrics]);

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

  // Navigation Logic
  const handleOnboardingComplete = (settings: UserSettings) => {
    setUser(settings);

    // Initialize habits from selected
    const selectedHabitLabels = settings.selectedHabits.map(id => {
      const habit = AVAILABLE_HABITS.find(h => h.id === id);
      return { id, label: habit ? `${habit.icon} ${habit.label}` : id, completed: false };
    });
    setHabits(selectedHabitLabels);

    setScreen('DASHBOARD');
  };

  const handleAddMeal = (meal: Meal) => {
    setMeals([...meals, meal]);
    setScreen('DASHBOARD');
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const handleCheckInFinish = (insight: string) => {
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

  const showTabBar = ['DASHBOARD', 'HISTORY', 'SETTINGS'].includes(screen);

  return (
    <div className="relative w-full h-screen bg-[#000000] text-white overflow-hidden font-sans selection:bg-[#00D4AA]/30">
      {/* Global Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1E] via-black to-[#0d0d0d] z-0" />

      {/* Content Container - max-width for desktop view constraint */}
      <div className="relative z-10 w-full h-full max-w-md mx-auto bg-black/20 shadow-2xl overflow-hidden flex flex-col">
        {screen === 'ONBOARDING' && <OnboardingScreen onComplete={handleOnboardingComplete} />}

        {screen === 'DASHBOARD' && user && (
          <Dashboard
            user={user}
            habits={habits}
            meals={meals}
            streak={streak}
            healthMetrics={healthMetrics}
            toggleHabit={toggleHabit}
            goToAddMeal={() => setScreen('ADD_MEAL')}
            closeDay={() => setScreen('CHECK_IN')}
            onMetricUpdate={handleMetricUpdate}
          />
        )}

        {screen === 'ADD_MEAL' && (
          <AddMealScreen onSave={handleAddMeal} onCancel={() => setScreen('DASHBOARD')} />
        )}

        {screen === 'CHECK_IN' && (
          <CheckInScreen onFinish={handleCheckInFinish} meals={meals} habits={habits} />
        )}

        {screen === 'HISTORY' && (
          <HistoryScreen logs={logs} streak={streak} onRequestWeeklyReview={handleRequestWeeklyReview} />
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
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {/* Tab Bar */}
        {showTabBar && (
          <TabBar current={screen} onChange={setScreen} />
        )}
      </div>
    </div>
  );
}

// Wrapped export with LanguageProvider
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}