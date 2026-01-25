// Haptic Feedback Service
// Supports Telegram WebApp haptics and browser Vibration API

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'selection' | 'success' | 'warning' | 'error') => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;

    if (tg?.HapticFeedback) {
        switch (style) {
            case 'light':
            case 'medium':
            case 'heavy':
            case 'rigid':
            case 'soft':
                tg.HapticFeedback.impactOccurred(style);
                break;
            case 'selection':
                tg.HapticFeedback.selectionChanged();
                break;
            case 'success':
            case 'warning':
            case 'error':
                tg.HapticFeedback.notificationOccurred(style);
                break;
        }
    } else if (navigator.vibrate) {
        // Fallback for browser
        switch (style) {
            case 'light':
            case 'selection':
                navigator.vibrate(5);
                break;
            case 'medium':
            case 'soft':
            case 'rigid':
                navigator.vibrate(10);
                break;
            case 'heavy':
                navigator.vibrate(20);
                break;
            case 'success':
                navigator.vibrate([10, 30, 10]);
                break;
            case 'warning':
                navigator.vibrate([30, 50, 10]);
                break;
            case 'error':
                navigator.vibrate([50, 50, 50]);
                break;
        }
    }
};
