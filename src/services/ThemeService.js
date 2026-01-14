// Theme Service - Dark mode only
// ===============================

export class ThemeService {
    /**
     * Initialize theme system
     * - Always uses dark mode
     */
    static init() {
        document.body.classList.add('dark-mode');
    }

    /**
     * Get current theme (always dark)
     */
    static getTheme() {
        return 'dark';
    }
}
