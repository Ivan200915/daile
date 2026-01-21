// Feedback Service
// Haptic feedback and sound effects for user interactions

// ==================== HAPTIC FEEDBACK ====================

// Check if vibration is supported
const supportsVibration = (): boolean => {
    return 'vibrate' in navigator;
};

// Check if Telegram WebApp haptic is available
const getTelegramHaptic = () => {
    // @ts-ignore
    return window.Telegram?.WebApp?.HapticFeedback;
};

// Light tap - for small interactions
export const hapticLight = () => {
    const tgHaptic = getTelegramHaptic();
    if (tgHaptic) {
        tgHaptic.impactOccurred('light');
    } else if (supportsVibration()) {
        navigator.vibrate(10);
    }
};

// Medium impact - for completing actions
export const hapticMedium = () => {
    const tgHaptic = getTelegramHaptic();
    if (tgHaptic) {
        tgHaptic.impactOccurred('medium');
    } else if (supportsVibration()) {
        navigator.vibrate(25);
    }
};

// Heavy impact - for important milestones
export const hapticHeavy = () => {
    const tgHaptic = getTelegramHaptic();
    if (tgHaptic) {
        tgHaptic.impactOccurred('heavy');
    } else if (supportsVibration()) {
        navigator.vibrate(50);
    }
};

// Success pattern - for achievements, day close
export const hapticSuccess = () => {
    const tgHaptic = getTelegramHaptic();
    if (tgHaptic) {
        tgHaptic.notificationOccurred('success');
    } else if (supportsVibration()) {
        navigator.vibrate([50, 50, 100]);
    }
};

// Warning pattern
export const hapticWarning = () => {
    const tgHaptic = getTelegramHaptic();
    if (tgHaptic) {
        tgHaptic.notificationOccurred('warning');
    } else if (supportsVibration()) {
        navigator.vibrate([100, 50, 100]);
    }
};

// Error pattern
export const hapticError = () => {
    const tgHaptic = getTelegramHaptic();
    if (tgHaptic) {
        tgHaptic.notificationOccurred('error');
    } else if (supportsVibration()) {
        navigator.vibrate([200, 100, 200]);
    }
};

// Level up celebration
export const hapticLevelUp = () => {
    const tgHaptic = getTelegramHaptic();
    if (tgHaptic) {
        tgHaptic.notificationOccurred('success');
        setTimeout(() => tgHaptic.impactOccurred('heavy'), 150);
        setTimeout(() => tgHaptic.impactOccurred('medium'), 300);
    } else if (supportsVibration()) {
        navigator.vibrate([50, 50, 100, 50, 150]);
    }
};

// ==================== SOUND EFFECTS ====================

// Simple beep using Web Audio API (optional)
export const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.frequency.value = 880; // A5 note
        oscillator.type = 'sine';

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
        // Silent fail
    }
};

// Achievement unlock sound
export const playAchievementSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();

        // Play two notes (chord)
        [523, 659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.value = freq;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);

            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
    } catch (e) {
        // Silent fail
    }
};
