// Theme Service - Light/Dark mode management
// =============================================

export class ThemeService {
    static THEME_KEY = 'user_theme_preference';

    /**
     * Initialize theme system
     * - Checks for saved preference
     * - Falls back to system preference
     * - Sets up system theme change listener
     */
    static init() {
        const savedTheme = localStorage.getItem(this.THEME_KEY);

        if (savedTheme && savedTheme !== 'auto') {
            this.setTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        // Listen for system theme changes (when in auto mode)
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                const savedTheme = localStorage.getItem(this.THEME_KEY);
                if (!savedTheme || savedTheme === 'auto') {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
    }

    /**
     * Set theme (light or dark)
     */
    static setTheme(theme) {
        // Remove both classes first
        document.body.classList.remove('dark-mode', 'light-mode');

        // Add the appropriate class
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.add('light-mode');
        }
        // If neither, let system preference take over (no class)

        // Don't save if it's just following system preference
        if (theme !== 'auto') {
            localStorage.setItem(this.THEME_KEY, theme);
        }
    }

    /**
     * Toggle between light and dark
     */
    static toggleTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        this.setTheme(isDark ? 'light' : 'dark');
    }

    /**
     * Get current theme
     */
    static getTheme() {
        return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    }

    /**
     * Get saved theme preference (including 'auto')
     */
    static getSavedPreference() {
        return localStorage.getItem(this.THEME_KEY) || 'auto';
    }
}
