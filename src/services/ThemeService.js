// Theme Service - Manage app themes
// ==================================

const STORAGE_KEY = 'workout-tracker-theme';
const THEMES = ['peloton', 'sunset', 'ocean'];

export class ThemeService {
    /**
     * Get current theme
     */
    static getCurrentTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return THEMES.includes(saved) ? saved : 'peloton';
    }

    /**
     * Set theme
     */
    static setTheme(theme) {
        if (!THEMES.includes(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            return;
        }

        // Store in localStorage
        localStorage.setItem(STORAGE_KEY, theme);

        // Apply to document
        if (theme === 'peloton') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    /**
     * Cycle to next theme
     */
    static cycleTheme() {
        const current = this.getCurrentTheme();
        const currentIndex = THEMES.indexOf(current);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const nextTheme = THEMES[nextIndex];

        this.setTheme(nextTheme);
        return nextTheme;
    }

    /**
     * Get theme display name
     */
    static getThemeName(theme) {
        const names = {
            'peloton': 'Peloton',
            'sunset': 'Sunset',
            'ocean': 'Ocean'
        };
        return names[theme] || theme;
    }

    /**
     * Initialize theme on app load
     */
    static init() {
        const theme = this.getCurrentTheme();
        this.setTheme(theme);
    }
}
