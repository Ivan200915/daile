import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconBadgeProps {
  icon: LucideIcon;
  variant?: 'circle' | 'square' | 'plain';
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  onClick?: () => void;
}

const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  variant = 'circle',
  color = '#00D4AA',
  size = 'md',
  className = '',
  glowIntensity = 'medium',
  onClick
}) => {
  // Size mappings
  const containerSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  const glowStyles = {
    none: '',
    low: '0 0 10px',
    medium: '0 0 20px',
    high: '0 0 30px'
  };

  // Plain variant (just icon, no container)
  if (variant === 'plain') {
    return (
      <Icon
        size={iconSizes[size]}
        style={{ color }}
        className={className}
        onClick={onClick}
      />
    );
  }

  // Container variant (circle or square)
  const borderRadius = variant === 'circle' ? 'rounded-full' : 'rounded-xl';
  const glow = glowIntensity !== 'none' 
    ? `${glowStyles[glowIntensity]} ${color}33` 
    : '';

  return (
    <div
      className={`
        ${containerSizes[size]}
        ${borderRadius}
        bg-white/5
        backdrop-blur-sm
        flex items-center justify-center
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:bg-white/10 active:scale-95' : ''}
        ${className}
      `}
      style={{
        boxShadow: glow
      }}
      onClick={onClick}
    >
      <Icon size={iconSizes[size]} style={{ color }} />
    </div>
  );
};

export default IconBadge;
