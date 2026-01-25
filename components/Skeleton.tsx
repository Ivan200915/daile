// Skeleton Loading Components
// Reusable loading placeholders for smooth UX

import React from 'react';

// Basic skeleton box with shimmer animation
export const Skeleton = ({
    className = '',
    width,
    height
}: {
    className?: string;
    width?: string | number;
    height?: string | number;
}) => (
    <div
        className={`skeleton rounded-lg ${className}`}
        style={{
            width: width || '100%',
            height: height || '1rem',
            minHeight: height || '1rem'
        }}
    />
);

// Skeleton for text lines
export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
    <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                height={12}
                width={i === lines - 1 ? '70%' : '100%'}
            />
        ))}
    </div>
);

// Skeleton for circular avatar
export const SkeletonAvatar = ({ size = 48 }: { size?: number }) => (
    <div
        className="skeleton rounded-full"
        style={{ width: size, height: size }}
    />
);

// Skeleton for a card
export const SkeletonCard = ({ className = '' }: { className?: string }) => (
    <div className={`bg-white/5 rounded-2xl p-4 border border-white/10 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
            <SkeletonAvatar size={40} />
            <div className="flex-1">
                <Skeleton height={14} width="60%" className="mb-2" />
                <Skeleton height={10} width="40%" />
            </div>
        </div>
        <SkeletonText lines={2} />
    </div>
);

// Skeleton for meal card
export const SkeletonMealCard = () => (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="flex space-x-4">
            <Skeleton height={80} width={80} className="rounded-xl" />
            <div className="flex-1">
                <Skeleton height={16} width="70%" className="mb-2" />
                <Skeleton height={12} width="50%" className="mb-3" />
                <div className="flex space-x-2">
                    <Skeleton height={24} width={60} className="rounded-full" />
                    <Skeleton height={24} width={60} className="rounded-full" />
                    <Skeleton height={24} width={60} className="rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

// Skeleton for stats grid
export const SkeletonStats = () => (
    <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <Skeleton height={12} width="60%" className="mb-2 mx-auto" />
                <Skeleton height={24} width="40%" className="mx-auto" />
            </div>
        ))}
    </div>
);

// Loading overlay for full-screen loading
export const LoadingOverlay = ({ message = 'Загрузка...' }: { message?: string }) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#00D4AA] rounded-full animate-spin mb-4" />
        <p className="text-white/70 text-sm">{message}</p>
    </div>
);

export default Skeleton;
