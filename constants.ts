// iOS 26 "Liquid Glass" Style System

// The base panel style: translucent, blurred, soft border, specular highlight on top
export const GLASS_PANEL = `
  relative
  bg-[#1C1C1E]/60
  backdrop-blur-[30px]
  border border-white/10
  rounded-[28px]
  shadow-[0_8px_32px_rgba(0,0,0,0.3),_inset_0_1px_0_0_rgba(255,255,255,0.2)]
`;

// Lighter variant for nested cards or active states
export const GLASS_PANEL_LIGHT = `
  relative
  bg-white/10
  backdrop-blur-[20px]
  border border-white/15
  rounded-[20px]
  shadow-[0_4px_16px_rgba(0,0,0,0.1),_inset_0_1px_0_0_rgba(255,255,255,0.3)]
`;

// Interactive element (button/toggle)
export const GLASS_BUTTON = `
  transition-all duration-300
  active:scale-95
  bg-white/10 hover:bg-white/20
  backdrop-blur-md
  border border-white/20
  rounded-2xl
  shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]
`;

// Primary action button (Solid Accent with Glass feel)
export const ACCENT_BUTTON = `
  transition-all duration-300
  active:scale-95
  bg-[#00D4AA]
  text-[#1C1C1E]
  font-semibold
  rounded-2xl
  shadow-[0_0_20px_rgba(0,212,170,0.4),_inset_0_1px_0_0_rgba(255,255,255,0.4)]
`;

export const TEXT_GRADIENT = "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70";

// Available habits for user selection during onboarding
// Available habits for user selection during onboarding
export const AVAILABLE_HABITS = [
  { id: 'water', label: '2L Water', labelRu: '2 литра воды', category: 'health', iconId: 'Droplets', type: 'counter' as const, target: 8, unit: 'glasses', unitRu: 'стаканов' },
  { id: 'workout', label: 'Workout', labelRu: 'Тренировка', category: 'fitness', iconId: 'Dumbbell', type: 'boolean' as const },
  { id: 'no-sugar', label: 'No Sugar', labelRu: 'Без сахара', category: 'nutrition', iconId: 'Ban', type: 'boolean' as const },
  { id: 'meditation', label: 'Meditation', labelRu: 'Медитация', category: 'mindfulness', iconId: 'Moon', type: 'timer' as const, target: 10, unit: 'min', unitRu: 'мин' },
  { id: 'steps', label: '10K Steps', labelRu: '10 000 шагов', category: 'fitness', iconId: 'Footprints', type: 'counter' as const, target: 10000, unit: 'steps', unitRu: 'шагов' },
  { id: 'sleep', label: '7+ Hours Sleep', labelRu: '7+ часов сна', category: 'health', iconId: 'Moon', type: 'boolean' as const },
  { id: 'vegetables', label: 'Eat Vegetables', labelRu: 'Есть овощи', category: 'nutrition', iconId: 'Leaf', type: 'boolean' as const },
  { id: 'no-alcohol', label: 'No Alcohol', labelRu: 'Без алкоголя', category: 'health', iconId: 'Ban', type: 'boolean' as const },
  { id: 'journaling', label: 'Journaling', labelRu: 'Дневник', category: 'mindfulness', iconId: 'Edit', type: 'boolean' as const },
  { id: 'stretch', label: 'Stretching', labelRu: 'Растяжка', category: 'fitness', iconId: 'Activity', type: 'timer' as const, target: 15, unit: 'min', unitRu: 'мин' },
] as const;

export const AVAILABLE_BAD_HABITS = [
  { id: 'smoking', label: 'Smoking', labelRu: 'Курение', category: 'health', iconId: 'Cigarette' },
  { id: 'vaping', label: 'Vaping', labelRu: 'Вейп', category: 'health', iconId: 'Wind' },
  { id: 'sugar', label: 'Sweets', labelRu: 'Сладкое', category: 'health', iconId: 'Cookie' },
  { id: 'social-media', label: 'Social Media', labelRu: 'Соцсети', category: 'time', iconId: 'Smartphone' },
  { id: 'fast-food', label: 'Fast Food', labelRu: 'Фастфуд', category: 'health', iconId: 'Pizza' },
  { id: 'spending', label: 'Impulse Buying', labelRu: 'Траты', category: 'finance', iconId: 'CreditCard' },
] as const;

// Default targets
export const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 80,
};

// Default habits for quick start (first 3)
export const MOCK_HABITS = [
  { id: 'water', label: '2L Water', labelRu: '2 литра воды', completed: false },
  { id: 'workout', label: 'Workout', labelRu: 'Тренировка', completed: false },
  { id: 'no-sugar', label: 'No Sugar', labelRu: 'Без сахара', completed: false },
];