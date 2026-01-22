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
  CheckCircle,
  Leaf,
  Edit,
  Snowflake,
  Frown,
  Meh,
  Smile,
  SmilePlus,
  Cat,
  Dog,
  Rabbit,
  Bird
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
  Leaf,
  Edit,

  // Moods
  Frown,
  Meh,
  Smile,
  SmilePlus,

  // Pets
  Cat,
  Dog,
  Rabbit,
  Bird,

  // Habits (aliases)
  Water: Droplets,
  Workout: Dumbbell,
  NoSugar: Ban,
  Target,
  Flame,

  // Habits (direct - for iconId lookup)
  Droplets,
  Dumbbell,
  Ban,
  Moon,
  Footprints,
  Activity,
  Snowflake,
  Zap,

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