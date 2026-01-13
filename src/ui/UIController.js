// UI Controller - Main UI management
// ====================================

import { CSS_CLASSES } from '../config/constants.js';
import { formatTime } from '../utils/dateUtils.js';

export class UIController {
    #elements;

    constructor() {
        this.#elements = this.#getElements();
    }

    /**
     * Get all DOM elements
     */
    #getElements() {
        return {
            timerDisplay: document.getElementById('timerDisplay'),
            progressBar: document.getElementById('progressBar'),
            repNumber: document.getElementById('repNumber'),
            countButton: document.getElementById('countButton'),
            count5Button: document.getElementById('count5Button'),
            count10Button: document.getElementById('count10Button'),
            motivationMessage: document.getElementById('motivationMessage'),
            calorieDisplay: document.getElementById('calorieDisplay'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            workoutType: document.getElementById('workoutType'),
            difficulty: document.getElementById('difficulty'),
            configSection: document.getElementById('configSection'),
            streakCount: document.getElementById('streakCount'),
            streakDisplay: document.getElementById('streakDisplay'),
            aboutToggle: document.getElementById('aboutToggle'),
            aboutDetails: document.getElementById('aboutDetails'),
            aboutSection: document.getElementById('aboutSection'),
            historyToggleBtn: document.getElementById('historyToggleBtn'),
            coachToggleBtn: document.getElementById('coachToggleBtn')
        };
    }

    /**
     * Get element by ID
     */
    getElement(id) {
        return this.#elements[id];
    }

    /**
     * Update timer display
     */
    updateTimerDisplay(seconds, totalSeconds) {
        this.#elements.timerDisplay.textContent = formatTime(seconds);
        this.#updateTimerColor(seconds);
        this.#updateProgressBar(seconds, totalSeconds);
    }

    /**
     * Update timer color based on time remaining
     */
    #updateTimerColor(seconds) {
        const el = this.#elements.timerDisplay;
        el.classList.remove(
            CSS_CLASSES.TIMER_FRESH,
            CSS_CLASSES.TIMER_MID,
            CSS_CLASSES.TIMER_FINAL,
            CSS_CLASSES.TIMER_CRITICAL
        );

        if (seconds > 900) {
            el.classList.add(CSS_CLASSES.TIMER_FRESH);
        } else if (seconds > 300) {
            el.classList.add(CSS_CLASSES.TIMER_MID);
        } else if (seconds > 60) {
            el.classList.add(CSS_CLASSES.TIMER_FINAL);
        } else {
            el.classList.add(CSS_CLASSES.TIMER_CRITICAL);
        }
    }

    /**
     * Update progress bar
     */
    #updateProgressBar(remaining, total) {
        const progress = ((total - remaining) / total) * 100;
        this.#elements.progressBar.style.width = `${progress}%`;

        this.#elements.progressBar.classList.remove(
            CSS_CLASSES.PROGRESS_MID,
            CSS_CLASSES.PROGRESS_FINAL,
            CSS_CLASSES.PROGRESS_CRITICAL
        );

        if (remaining <= 60) {
            this.#elements.progressBar.classList.add(CSS_CLASSES.PROGRESS_CRITICAL);
        } else if (remaining <= 300) {
            this.#elements.progressBar.classList.add(CSS_CLASSES.PROGRESS_FINAL);
        } else if (remaining <= 900) {
            this.#elements.progressBar.classList.add(CSS_CLASSES.PROGRESS_MID);
        }
    }

    /**
     * Update rep counter
     */
    updateRepCounter(reps) {
        this.#elements.repNumber.textContent = reps;
    }

    /**
     * Celebrate milestone
     */
    celebrateMilestone(isMajor = false) {
        this.#elements.countButton.classList.add(CSS_CLASSES.CELEBRATING);
        setTimeout(() => {
            this.#elements.countButton.classList.remove(CSS_CLASSES.CELEBRATING);
        }, 500);

        if (isMajor) {
            document.body.classList.add(CSS_CLASSES.CELEBRATING);
            setTimeout(() => {
                document.body.classList.remove(CSS_CLASSES.CELEBRATING);
            }, 800);
        }
    }

    /**
     * Show motivational message
     */
    showMotivationalMessage(message) {
        this.#elements.motivationMessage.textContent = message;
        this.#elements.motivationMessage.style.animation = 'none';
        setTimeout(() => {
            this.#elements.motivationMessage.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }

    /**
     * Update calories display
     */
    updateCalories(calories) {
        this.#elements.calorieDisplay.textContent = calories;
    }

    /**
     * Update streak display
     */
    updateStreak(streak, needsRest = false) {
        this.#elements.streakCount.textContent = streak;

        if (needsRest) {
            this.#elements.streakDisplay.style.color = '#ffaa00';
            this.#elements.streakDisplay.title =
                'You\'ve worked out 6+ days straight! Consider taking a rest day for recovery.';
        } else {
            this.#elements.streakDisplay.style.color = '';
            this.#elements.streakDisplay.title = '';
        }
    }

    /**
     * Set workout controls state
     */
    setWorkoutControls(state) {
        switch (state) {
            case 'started':
                this.#elements.startBtn.disabled = true;
                this.#elements.pauseBtn.disabled = false;
                this.#elements.countButton.disabled = false;
                this.#elements.count5Button.disabled = false;
                this.#elements.count10Button.disabled = false;
                this.#elements.configSection.style.display = 'none';
                if (this.#elements.aboutSection) {
                    this.#elements.aboutSection.style.display = 'none';
                }
                break;

            case 'paused':
                this.#elements.pauseBtn.textContent = 'Resume';
                this.#elements.countButton.disabled = true;
                this.#elements.count5Button.disabled = true;
                this.#elements.count10Button.disabled = true;
                break;

            case 'resumed':
                this.#elements.pauseBtn.textContent = 'Pause';
                this.#elements.countButton.disabled = false;
                this.#elements.count5Button.disabled = false;
                this.#elements.count10Button.disabled = false;
                break;

            case 'reset':
                this.#elements.startBtn.disabled = false;
                this.#elements.pauseBtn.disabled = true;
                this.#elements.pauseBtn.textContent = 'Pause';
                this.#elements.countButton.disabled = true;
                this.#elements.count5Button.disabled = true;
                this.#elements.count10Button.disabled = true;
                this.#elements.configSection.style.display = 'block';
                if (this.#elements.aboutSection) {
                    this.#elements.aboutSection.style.display = 'block';
                }
                break;
        }
    }

    /**
     * Get selected workout configuration
     */
    getWorkoutConfig() {
        return {
            workoutType: this.#elements.workoutType.value,
            difficulty: this.#elements.difficulty.value
        };
    }

    /**
     * Get selected difficulty
     */
    getSelectedDifficulty() {
        return this.#elements.difficulty.value;
    }
}
