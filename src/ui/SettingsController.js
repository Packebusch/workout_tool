// Settings Controller - Settings tab management
// ==============================================

import { StorageManager } from '../services/StorageManager.js';
import { ProgressionService } from '../services/ProgressionService.js';
import { PROGRESSION_LADDERS } from '../config/constants.js';

export class SettingsController {
    /**
     * Initialize settings view
     */
    static init() {
        this.attachListeners();
        this.renderProgressionSettings();
    }

    /**
     * Attach event listeners
     */
    static attachListeners() {
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

    /**
     * Render exercise progressions settings section
     */
    static renderProgressionSettings() {
        const container = document.getElementById('progressionSettings');
        if (!container) return;

        // Initialize progressions if needed
        ProgressionService.initializeDefaultProgressions();

        let html = '';

        for (const [exerciseType, ladder] of Object.entries(PROGRESSION_LADDERS)) {
            const summary = ProgressionService.getProgressionSummary(exerciseType);
            if (!summary) continue;

            html += `
                <div class="progression-setting-item" data-exercise="${exerciseType}">
                    <div class="progression-setting-header">
                        <span class="progression-exercise-name">${ladder.name}</span>
                        <span class="progression-level-badge">Level ${summary.currentLevel}</span>
                    </div>
                    <div class="progression-setting-variation">
                        <span>${summary.variation}</span>
                        <button class="progression-info-btn"
                                data-exercise="${exerciseType}"
                                data-level="${summary.currentLevel}"
                                aria-label="Exercise info">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                        </button>
                    </div>
                    <div class="progression-setting-controls">
                        <button class="progression-level-btn decrease"
                                data-exercise="${exerciseType}"
                                data-action="decrease"
                                ${summary.currentLevel <= 1 ? 'disabled' : ''}>−</button>
                        <span class="progression-level-display">${summary.currentLevel} / ${summary.maxLevel}</span>
                        <button class="progression-level-btn increase"
                                data-exercise="${exerciseType}"
                                data-action="increase"
                                ${summary.currentLevel >= summary.maxLevel ? 'disabled' : ''}>+</button>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;

        // Attach event listeners for level buttons
        container.querySelectorAll('.progression-level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exerciseType = e.target.dataset.exercise;
                const action = e.target.dataset.action;
                this.handleProgressionLevelChange(exerciseType, action);
            });
        });

        // Attach event listeners for info buttons
        container.querySelectorAll('.progression-info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const button = e.currentTarget;
                const exerciseType = button.dataset.exercise;
                const level = parseInt(button.dataset.level, 10);
                this.showExerciseInfoModal(exerciseType, level);
            });
        });
    }

    /**
     * Show exercise info modal
     */
    static showExerciseInfoModal(exerciseType, level) {
        const ladder = PROGRESSION_LADDERS[exerciseType];
        if (!ladder) return;

        const levelConfig = ladder.levels.find(l => l.level === level);
        if (!levelConfig) return;

        const modal = document.getElementById('exerciseInfoModal');
        if (!modal) return;

        // Populate modal content
        const title = modal.querySelector('.exercise-info-title');
        const description = modal.querySelector('.exercise-info-description');
        const tipsList = modal.querySelector('.exercise-info-tips');
        const noteSection = modal.querySelector('.exercise-info-note');

        if (title) {
            title.textContent = levelConfig.variation;
        }

        if (description) {
            description.textContent = levelConfig.description || 'No description available.';
        }

        if (tipsList) {
            if (levelConfig.formTips && levelConfig.formTips.length > 0) {
                tipsList.innerHTML = levelConfig.formTips
                    .map(tip => `<li>${tip}</li>`)
                    .join('');
                tipsList.parentElement.style.display = 'block';
            } else {
                tipsList.parentElement.style.display = 'none';
            }
        }

        if (noteSection) {
            if (levelConfig.note) {
                noteSection.querySelector('.exercise-info-note-text').textContent = levelConfig.note;
                noteSection.style.display = 'block';
            } else {
                noteSection.style.display = 'none';
            }
        }

        // Show modal
        modal.classList.add('active');

        // Close handlers
        const closeBtn = modal.querySelector('.exercise-info-close');
        const backdrop = modal.querySelector('.exercise-info-backdrop');

        const closeModal = () => {
            modal.classList.remove('active');
            closeBtn.removeEventListener('click', closeModal);
            backdrop.removeEventListener('click', closeModal);
        };

        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
    }

    /**
     * Handle progression level change from settings
     */
    static handleProgressionLevelChange(exerciseType, action) {
        const currentLevel = ProgressionService.getCurrentLevel(exerciseType);
        const maxLevel = ProgressionService.getMaxLevel(exerciseType);

        let newLevel;
        if (action === 'increase' && currentLevel < maxLevel) {
            newLevel = currentLevel + 1;
        } else if (action === 'decrease' && currentLevel > 1) {
            newLevel = currentLevel - 1;
        } else {
            return; // No change needed
        }

        ProgressionService.setLevel(exerciseType, newLevel);
        this.renderProgressionSettings();

        const ladder = PROGRESSION_LADDERS[exerciseType];
        const variation = ProgressionService.getCurrentVariation(exerciseType);
        this.showToast(`${ladder.name}: Level ${newLevel} - ${variation}`);
    }
}
