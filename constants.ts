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
export const AVAILABLE_HABITS = [
  { id: 'water', label: '2L Water', icon: '💧', category: 'health' },
  { id: 'workout', label: 'Workout', icon: '💪', category: 'fitness' },
  { id: 'no-sugar', label: 'No Sugar', icon: '🍬', category: 'nutrition' },
  { id: 'meditation', label: 'Meditation', icon: '🧘', category: 'mindfulness' },
  { id: 'steps', label: '10K Steps', icon: '🚶', category: 'fitness' },
  { id: 'sleep', label: '7+ Hours Sleep', icon: '😴', category: 'health' },
  { id: 'vegetables', label: 'Eat Vegetables', icon: '🥗', category: 'nutrition' },
  { id: 'no-alcohol', label: 'No Alcohol', icon: '🍷', category: 'health' },
  { id: 'journaling', label: 'Journaling', icon: '📝', category: 'mindfulness' },
  { id: 'stretch', label: 'Stretching', icon: '🤸', category: 'fitness' },
] as const;

// Default targets
export const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 80,
};

// Default habits for quick start (first 3)
export const MOCK_HABITS = [
  { id: 'water', label: '💧 2L Water', completed: false },
  { id: 'workout', label: '💪 Workout', completed: false },
  { id: 'no-sugar', label: '🍬 No Sugar', completed: false },
];