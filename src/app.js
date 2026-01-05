// Workout Tracker - Main Application
// ====================================

import { StateManager } from './models/State.js';
import { StorageManager } from './services/StorageManager.js';
import { TimerService } from './services/TimerService.js';
import { WorkoutService } from './services/WorkoutService.js';
import { HistoryService } from './services/HistoryService.js';
import { StreakService } from './services/StreakService.js';
import { ChartService } from './services/ChartService.js';
import { WakeLockService } from './services/WakeLockService.js';
import { UIController } from './ui/UIController.js';
import { HistoryUIController } from './ui/HistoryUIController.js';
import { DIFFICULTY_LEVELS, WORKOUT_CONFIGS, MOTIVATIONAL_MESSAGES } from './config/constants.js';
import { getRandomItem } from './utils/calculations.js';

class WorkoutApp {
    constructor() {
        // Initialize state
        this.stateManager = new StateManager();

        // Initialize UI controllers
        this.ui = new UIController();
        this.historyUI = new HistoryUIController();

        // Initialize services
        this.timerService = new TimerService(this.stateManager, {
            onTick: () => this.#handleTimerTick(),
            onComplete: () => this.#handleWorkoutComplete()
        });

        this.workoutService = new WorkoutService(this.stateManager, {
            onMilestone: (milestone) => this.#handleMilestone(milestone)
        });

        this.chartService = new ChartService();
        this.wakeLockService = new WakeLockService();

        // Current chart period
        this.currentChartPeriod = 7;

        // Performance optimization: batch UI updates
        this.pendingUIUpdate = false;

        // Initialize app
        this.#init();
    }

    /**
     * Initialize application
     */
    #init() {
        // Check storage availability
        if (!StorageManager.isAvailable()) {
            console.error('localStorage not available');
            this.ui.showMotivationalMessage('Warning: Storage not available. Data will not be saved.');
        }

        // Set up event listeners
        this.#setupEventListeners();

        // Update initial UI
        this.#updateUI();
        this.#updateStreak();

        // Initialize completion modal handlers
        this.#setupModalHandlers();

        // Initialize history panel handlers
        this.#setupHistoryHandlers();

        console.log('Workout Tracker initialized!');
    }

    /**
     * Set up event listeners
     */
    #setupEventListeners() {
        // Control buttons
        this.ui.getElement('startBtn').addEventListener('click', () => this.#startWorkout());
        this.ui.getElement('pauseBtn').addEventListener('click', () => this.#togglePause());
        this.ui.getElement('resetBtn').addEventListener('click', () => this.#resetWorkout());

        // Rep counter
        this.ui.getElement('countButton').addEventListener('click', () => this.#incrementRep());

        // Keyboard support (spacebar)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' &&
                !this.stateManager.get('isPaused') &&
                this.stateManager.get('isRunning')) {
                e.preventDefault();
                this.#incrementRep();
            }
        });

        // Difficulty change
        this.ui.getElement('difficulty').addEventListener('change', () => {
            if (!this.stateManager.get('isRunning')) {
                const difficulty = this.ui.getSelectedDifficulty();
                const duration = DIFFICULTY_LEVELS[difficulty].duration;
                this.stateManager.setState({
                    totalSeconds: duration,
                    remainingSeconds: duration
                });
                this.#updateUI();
            }
        });

        // About section toggle
        const aboutToggle = this.ui.getElement('aboutToggle');
        const aboutDetails = this.ui.getElement('aboutDetails');
        if (aboutToggle && aboutDetails) {
            aboutToggle.addEventListener('click', () => {
                aboutDetails.classList.toggle('open');
                aboutToggle.textContent = aboutDetails.classList.contains('open')
                    ? '✕ Close'
                    : 'ℹ️ Why this matters';
            });
        }
    }

    /**
     * Set up modal handlers
     */
    #setupModalHandlers() {
        document.getElementById('saveWorkoutBtn').addEventListener('click', () => {
            this.#saveWorkout();
        });

        document.getElementById('discardWorkoutBtn').addEventListener('click', () => {
            const confirmed = confirm('Discard this workout without saving?');
            if (confirmed) {
                this.historyUI.closeCompletionModal();
                this.#resetWorkout();
            }
        });
    }

    /**
     * Set up history panel handlers
     */
    #setupHistoryHandlers() {
        // Toggle history
        this.ui.getElement('historyToggleBtn').addEventListener('click', () => {
            const isOpen = this.historyUI.toggleHistory();
            if (isOpen) {
                this.#renderHistory();
            }
        });

        document.getElementById('closeHistoryBtn').addEventListener('click', () => {
            this.historyUI.closeHistory();
        });

        // Close on outside click
        document.getElementById('historyPanel').addEventListener('click', (e) => {
            if (e.target.id === 'historyPanel') {
                this.historyUI.closeHistory();
            }
        });

        // Clear history
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            const confirmed = confirm('Are you sure you want to clear all workout history? This cannot be undone.');
            if (confirmed) {
                HistoryService.clearHistory();
                this.#renderHistory();
                this.ui.showMotivationalMessage('History cleared!');
            }
        });

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => this.#exportData());
        document.getElementById('importBtn').addEventListener('click', () => this.#importData());

        // Chart period buttons
        document.querySelectorAll('.chart-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Use currentTarget instead of target for mobile compatibility
                const clickedButton = e.currentTarget;

                // Update active state
                document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
                clickedButton.classList.add('active');

                // Update chart period and clear cache to force re-render
                const newPeriod = parseInt(clickedButton.dataset.period);
                if (newPeriod !== this.currentChartPeriod) {
                    this.currentChartPeriod = newPeriod;
                    this.chartService.clearCache();
                    this.#renderChart();
                }
            });
        });
    }

    /**
     * Start workout
     */
    #startWorkout() {
        const config = this.ui.getWorkoutConfig();

        this.stateManager.setState({
            workoutType: config.workoutType,
            difficulty: config.difficulty,
            totalSeconds: DIFFICULTY_LEVELS[config.difficulty].duration,
            remainingSeconds: DIFFICULTY_LEVELS[config.difficulty].duration,
            lastMilestoneTime: DIFFICULTY_LEVELS[config.difficulty].duration,
            isRunning: true,
            isPaused: false,
            startTime: Date.now()
        });

        this.ui.setWorkoutControls('started');
        this.wakeLockService.request();

        const workoutName = WORKOUT_CONFIGS[config.workoutType].name;
        const difficultyName = DIFFICULTY_LEVELS[config.difficulty].name;
        this.ui.showMotivationalMessage(`${workoutName} - ${difficultyName} mode! LET'S GO!`);

        this.timerService.start();
    }

    /**
     * Toggle pause/resume
     */
    #togglePause() {
        const isPaused = this.stateManager.get('isPaused');

        if (isPaused) {
            // Resume
            this.stateManager.set('isPaused', false);
            this.ui.setWorkoutControls('resumed');
            this.ui.showMotivationalMessage("Back to work! Let's go!");
            this.wakeLockService.request();
            this.timerService.resume();
        } else {
            // Pause
            this.stateManager.set('isPaused', true);
            this.ui.setWorkoutControls('paused');
            this.ui.showMotivationalMessage("Paused - Take a breath!");
            this.wakeLockService.release();
            this.timerService.pause();
        }
    }

    /**
     * Reset workout
     */
    #resetWorkout() {
        const state = this.stateManager.getState();
        const confirmed = state.reps > 0 || state.remainingSeconds < state.totalSeconds
            ? confirm('Are you sure you want to reset? Current progress will be lost.')
            : true;

        if (!confirmed) return;

        this.timerService.stop();
        this.wakeLockService.release();

        const difficulty = this.ui.getSelectedDifficulty();
        this.stateManager.reset(difficulty);

        this.#updateUI();
        this.ui.setWorkoutControls('reset');
        this.ui.showMotivationalMessage("Ready to start? Choose your workout and hit Start!");
    }

    /**
     * Increment rep
     */
    #incrementRep() {
        if (!this.stateManager.get('isRunning') || this.stateManager.get('isPaused')) {
            return;
        }

        // Increment rep immediately (no delay)
        this.stateManager.incrementReps();

        // Update rep counter immediately
        const reps = this.stateManager.get('reps');
        this.ui.updateRepCounter(reps);

        // Check milestones (lightweight check)
        this.workoutService.checkRepMilestones();

        // Batch expensive UI updates using requestAnimationFrame
        if (!this.pendingUIUpdate) {
            this.pendingUIUpdate = true;
            requestAnimationFrame(() => {
                this.#updateMetrics();
                this.pendingUIUpdate = false;
            });
        }
    }

    /**
     * Handle timer tick
     */
    #handleTimerTick() {
        this.#updateUI();
        this.#updateMetrics();
        this.workoutService.checkTimeMilestones();
    }

    /**
     * Handle workout complete
     */
    #handleWorkoutComplete() {
        this.wakeLockService.release();
        this.stateManager.set('isRunning', false);
        this.ui.showMotivationalMessage("WORKOUT COMPLETE! Amazing job!");
        this.#showCompletionModal();
    }

    /**
     * Handle milestone
     */
    #handleMilestone(milestone) {
        this.ui.showMotivationalMessage(milestone.message);

        if (milestone.type === 'rep') {
            this.ui.celebrateMilestone(milestone.isMajor);
        }
    }

    /**
     * Update UI
     */
    #updateUI() {
        const state = this.stateManager.getState();
        this.ui.updateTimerDisplay(state.remainingSeconds, state.totalSeconds);
        this.ui.updateRepCounter(state.reps);
    }

    /**
     * Update metrics
     */
    #updateMetrics() {
        const metrics = this.workoutService.getMetrics();
        this.ui.updateCalories(metrics.calories);
    }

    /**
     * Update streak display
     */
    #updateStreak() {
        const streak = StreakService.getCurrentStreak();
        const needsRest = StreakService.needsRestDay();
        this.ui.updateStreak(streak, needsRest);
    }

    /**
     * Show completion modal
     */
    #showCompletionModal() {
        const state = this.stateManager.getState();
        const summary = this.workoutService.getWorkoutSummary();
        const history = HistoryService.getHistory();

        const record = HistoryService.getPersonalRecord(
            state.workoutType,
            state.difficulty,
            state.reps
        );

        const comparison = HistoryService.getProgressComparison(
            state.workoutType,
            state.difficulty,
            state.reps
        );

        const suggestion = this.workoutService.getProgressionSuggestion(history);

        this.historyUI.showCompletionModal(summary, record, comparison, suggestion);
    }

    /**
     * Save workout
     */
    #saveWorkout() {
        const summary = this.workoutService.getWorkoutSummary();

        const workout = {
            date: new Date().toISOString(),
            duration: summary.duration,
            reps: summary.reps,
            calories: summary.calories,
            fitnessLevel: summary.fitnessLevel,
            workoutType: summary.workoutType,
            difficulty: summary.difficulty
        };

        HistoryService.saveWorkout(workout);
        StreakService.updateStreak();

        this.historyUI.closeCompletionModal();
        this.#resetWorkout();
        this.#updateStreak();

        // Show week summary
        const weekSummary = HistoryService.getWeekSummary();
        const monthSummary = HistoryService.getMonthSummary();

        if (weekSummary) {
            let message = `Workout saved! 🎉\n`;
            message += `\nThis week: ${weekSummary.workouts} workout${weekSummary.workouts !== 1 ? 's' : ''}, ${weekSummary.reps} reps, ${weekSummary.calories} cals`;

            if (monthSummary) {
                message += `\nThis month: ${monthSummary.workouts} workouts, ${monthSummary.reps} reps`;
            }

            if (weekSummary.isBestWeek && HistoryService.getHistory().sessions.length > 7) {
                message += `\n\n🏆 BEST WEEK EVER! Keep it up!`;
            }

            this.ui.showMotivationalMessage(message);
        } else {
            this.ui.showMotivationalMessage('Workout saved! Great job!');
        }
    }

    /**
     * Render history panel
     */
    #renderHistory() {
        const history = HistoryService.getHistory();

        // Render lifetime stats
        const lifetimeStats = HistoryService.getLifetimeStats();
        this.historyUI.renderLifetimeStats(lifetimeStats);

        // Render chart
        this.#renderChart();

        // Render type stats
        const typeStats = HistoryService.getStatsByType();
        this.historyUI.renderTypeStats(typeStats);

        // Render workout list
        this.historyUI.renderWorkoutList(history.sessions);
    }

    /**
     * Render chart
     */
    #renderChart() {
        const history = HistoryService.getHistory();
        const canvas = this.historyUI.getChartCanvas();

        const legendHTML = this.chartService.renderChart(canvas, history, this.currentChartPeriod);
        this.historyUI.renderChartLegend(legendHTML);
    }

    /**
     * Export data
     */
    #exportData() {
        const data = StorageManager.exportAll();

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workout-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.ui.showMotivationalMessage('History exported successfully!');
    }

    /**
     * Import data
     */
    #importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                alert('File too large (max 5MB)');
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    const merge = confirm(
                        'Import options:\n\n' +
                        'OK = Merge with existing data (recommended)\n' +
                        'Cancel = Replace all existing data'
                    );

                    StorageManager.importAll(data, merge);

                    this.#updateStreak();
                    this.#renderHistory();

                    this.ui.showMotivationalMessage(
                        merge ? 'History merged successfully!' : 'History replaced successfully!'
                    );
                } catch (err) {
                    alert('Error importing file: ' + err.message);
                    console.error('Import error:', err);
                }
            };

            reader.onerror = () => {
                alert('Error reading file. Please try again.');
            };

            reader.readAsText(file);
        };

        input.click();
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.workoutApp = new WorkoutApp();
    });
} else {
    window.workoutApp = new WorkoutApp();
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/workout_tool/sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);

                // Check for updates immediately and every 10 seconds
                registration.update();
                setInterval(() => {
                    registration.update();
                }, 10000);

                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New version available - reloading...');
                            // Tell the new worker to skip waiting and take over
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });

        // Auto-reload on controller change
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                console.log('Controller changed - reloading page');
                window.location.reload();
            }
        });
    });
}
