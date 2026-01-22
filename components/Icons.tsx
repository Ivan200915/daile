import React from 'react';
import {
  Activity,
  Moon,
  Footprints,
  Plus,
  Camera,
  Check,
  ChevronRight,
  BarChart2,
  Zap,
  Droplets,
  Dumbbell,
  Ban,
  X,
  Lightbulb,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  Settings,
  Mic,
  Users,
  Trophy,
  MessageCircle,
  Heart,
  Star,
  Gift,
  Bell,
  Share2,
  Home,
  Target,
  Flame,
  CheckCircle
} from 'lucide-react';

// Brand colors - exported for use elsewhere
export const BRAND_COLORS = {
  primary: '#00D4AA',
  secondary: '#FF6B6B',
  accent: '#FFD700',
  blue: '#3B82F6',
  orange: '#FF6B00',
};

// Export all icons directly for simplicity
export const Icons = {
  // Navigation
  Home,
  Chart: BarChart2,
  BarChart2,
  Settings,
  Calendar,
  CheckCircle,

  // Health metrics
  Steps: Footprints,
  Sleep: Moon,
  Active: Activity,
  Energy: Zap,

  // Habits
  Water: Droplets,
  Workout: Dumbbell,
  NoSugar: Ban,
  Target,
  Flame,

  // Actions
  Plus,
  Camera,
  Check,
  Close: X,
  ArrowRight,
  ChevronRight,

  // Features
  Mic,
  Users,
  Trophy,
  MessageCircle,
  Heart,
  Star,
  Gift,
  Bell,
  Share: Share2,

  // Misc
  Idea: Lightbulb,
  Gallery: ImageIcon,
};

// Unified icon sizes
export const IconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};