// Haptic Feedback Utility - iOS-style vibration patterns
// ========================================================

/**
 * Haptic feedback patterns for different interactions
 * Uses Vibration API (supported on most mobile devices)
 */
export const Haptics = {
    /**
     * Light tap - for subtle interactions
     * Use for: button taps, selections
     */
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    /**
     * Medium impact - for standard interactions
     * Use for: toggles, switches
     */
    medium: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
    },

    /**
     * Heavy impact - for significant interactions
     * Use for: delete actions, important changes
     */
    heavy: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    },

    /**
     * Success pattern - for positive feedback
     * Use for: workout completion, goal achievement
     */
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([10, 50, 10]);
        }
    },

    /**
     * Error pattern - for negative feedback
     * Use for: failed actions, validation errors
     */
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 100, 50]);
        }
    },

    /**
     * Warning pattern - for attention-grabbing
     * Use for: confirmation dialogs, important notices
     */
    warning: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 50, 30]);
        }
    },

    /**
     * Selection pattern - for picking items
     * Use for: swipe gestures, drag operations
     */
    selection: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(15);
        }
    },

    /**
     * Check if haptics are supported
     */
    isSupported: () => {
        return 'vibrate' in navigator;
    }
};

// Export default for convenience
export default Haptics;
