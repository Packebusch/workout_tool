// Settings Controller - Settings tab management
// ==============================================

import { ThemeService } from '../services/ThemeService.js';
import { StorageManager } from '../services/StorageManager.js';

export class SettingsController {
    /**
     * Initialize settings view
     */
    static init() {
        this.attachListeners();
        this.updateThemeSelect();
    }

    /**
     * Attach event listeners
     */
    static attachListeners() {
        // Theme selector
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.handleThemeChange(e.target.value);
            });
        }

        // Export data button
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Clear data button
        const clearBtn = document.getElementById('clear-data-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.confirmClearData();
            });
        }
    }

    /**
     * Handle theme change
     */
    static handleThemeChange(theme) {
        if (theme === 'auto') {
            // Remove saved preference, let system decide
            localStorage.removeItem(ThemeService.THEME_KEY);
            ThemeService.init();
        } else {
            // Set specific theme
            ThemeService.setTheme(theme);
        }
    }

    /**
     * Update theme select to match current setting
     */
    static updateThemeSelect() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            const savedPreference = ThemeService.getSavedPreference();
            themeSelect.value = savedPreference;
        }
    }

    /**
     * Export all data as JSON
     */
    static exportData() {
        try {
            const data = StorageManager.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);

            this.showToast('Data exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed. Please try again.');
        }
    }

    /**
     * Confirm before clearing all data
     */
    static confirmClearData() {
        const confirmed = confirm(
            'Are you sure you want to clear all data?\n\n' +
            'This will permanently delete:\n' +
            '• All workout history\n' +
            '• All goals\n' +
            '• All soreness logs\n' +
            '• All settings\n\n' +
            'This action cannot be undone!'
        );

        if (confirmed) {
            this.clearAllData();
        }
    }

    /**
     * Clear all data from localStorage
     */
    static clearAllData() {
        try {
            localStorage.clear();
            this.showToast('All data cleared!');

            // Reload app after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Clear data failed:', error);
            this.showToast('Failed to clear data. Please try again.');
        }
    }

    /**
     * Show a temporary toast message
     */
    static showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: calc(70px + env(safe-area-inset-bottom, 0));
            left: 50%;
            transform: translateX(-50%);
            background: var(--color-surface);
            color: var(--color-text-primary);
            padding: 12px 24px;
            border-radius: 20px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            font-size: 0.9rem;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Fade in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // Fade out and remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}
