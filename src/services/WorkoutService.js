// Workout Service - Core workout business logic
// ===============================================

import { REP_MILESTONES, TIME_MILESTONES, MOTIVATIONAL_MESSAGES } from '../config/constants.js';
import { calculateCalories, calculateFitnessLevel, calculatePace, getTargetReps, getNextDifficulty } from '../utils/calculations.js';
import { getRandomItem } from '../utils/calculations.js';

export class WorkoutService {
    #stateManager;
    #onMilestone;

    constructor(stateManager, { onMilestone } = {}) {
        this.#stateManager = stateManager;
        this.#onMilestone = onMilestone;
    }

    /**
     * Check for rep milestones
     */
    checkRepMilestones() {
        const currentReps = this.#stateManager.get('reps');
        const lastMilestone = this.#stateManager.get('lastMilestoneRep');

        for (const milestone of REP_MILESTONES) {
            if (currentReps === milestone && lastMilestone < milestone) {
                this.#stateManager.set('lastMilestoneRep', milestone);

                if (this.#onMilestone) {
                    this.#onMilestone({
                        type: 'rep',
                        value: milestone,
                        message: MOTIVATIONAL_MESSAGES.repMilestones[milestone],
                        isMajor: milestone >= 100
                    });
                }
                break;
            }
        }

        // Performance-based motivation every 30 reps
        if (currentReps % 30 === 0 && currentReps > 0 && !REP_MILESTONES.includes(currentReps)) {
            const message = this.#getPerformanceMessage();
            if (message && this.#onMilestone) {
                this.#onMilestone({
                    type: 'performance',
                    message
                });
            }
        }
    }

    /**
     * Check for time milestones
     */
    checkTimeMilestones() {
        const remaining = this.#stateManager.get('remainingSeconds');
        const lastMilestone = this.#stateManager.get('lastMilestoneTime');

        for (const { time, messageType } of TIME_MILESTONES) {
            if (remaining === time && lastMilestone !== time) {
                this.#stateManager.set('lastMilestoneTime', time);

                const messages = MOTIVATIONAL_MESSAGES[messageType];
                const message = getRandomItem(messages);

                if (this.#onMilestone) {
                    this.#onMilestone({
                        type: 'time',
                        value: time,
                        message,
                        messageType
                    });
                }
                break;
            }
        }

        // Periodic encouragement every 2 minutes
        const elapsed = this.#stateManager.get('totalSeconds') - remaining;
        if (elapsed > 120 && elapsed < 1080 && elapsed % 120 === 0) {
            if (![900, 600, 300].includes(remaining)) {
                const messages = remaining > 600
                    ? MOTIVATIONAL_MESSAGES.early
                    : MOTIVATIONAL_MESSAGES.mid;
                const message = getRandomItem(messages);

                if (this.#onMilestone) {
                    this.#onMilestone({
                        type: 'periodic',
                        message
                    });
                }
            }
        }
    }

    /**
     * Calculate current metrics
     */
    getMetrics() {
        const workoutType = this.#stateManager.get('workoutType');
        const reps = this.#stateManager.get('reps');
        const totalSeconds = this.#stateManager.get('totalSeconds');
        const remaining = this.#stateManager.get('remainingSeconds');
        const elapsedMinutes = (totalSeconds - remaining) / 60;

        return {
            calories: calculateCalories(workoutType, reps, elapsedMinutes),
            pace: calculatePace(reps, elapsedMinutes),
            elapsed: totalSeconds - remaining,
            elapsedMinutes
        };
    }

    /**
     * Get workout summary for completion
     */
    getWorkoutSummary() {
        const state = this.#stateManager.getState();
        const metrics = this.getMetrics();

        return {
            reps: state.reps,
            duration: metrics.elapsed,
            calories: metrics.calories,
            fitnessLevel: calculateFitnessLevel(state.reps, metrics.elapsed),
            workoutType: state.workoutType,
            difficulty: state.difficulty,
            pace: metrics.pace
        };
    }

    /**
     * Get progression suggestion
     */
    getProgressionSuggestion(history) {
        const workoutType = this.#stateManager.get('workoutType');
        const difficulty = this.#stateManager.get('difficulty');

        // Get last 3 workouts of same type
        const sameType = history.sessions
            .filter(s => s.workoutType === workoutType)
            .slice(0, 3);

        if (sameType.length < 3) return null;

        // Check if all same difficulty and performing well
        const allSameDifficulty = sameType.every(s => s.difficulty === difficulty);
        if (!allSameDifficulty) return null;

        // Check if trending upward
        const avgReps = sameType.reduce((sum, s) => sum + s.reps, 0) / sameType.length;
        const targetReps = getTargetReps(workoutType, difficulty);

        if (avgReps > targetReps * 1.1) {
            const nextDifficulty = getNextDifficulty(difficulty);
            if (nextDifficulty) {
                return `Ready to level up? Try ${nextDifficulty} mode!`;
            }
        }

        return null;
    }

    /**
     * Get performance-based message
     */
    #getPerformanceMessage() {
        const metrics = this.getMetrics();
        const pace = metrics.pace;

        if (pace > 8) return MOTIVATIONAL_MESSAGES.performance.crushing;
        if (pace > 6) return MOTIVATIONAL_MESSAGES.performance.onTrack;
        if (pace > 4) return MOTIVATIONAL_MESSAGES.performance.strong;
        return MOTIVATIONAL_MESSAGES.performance.pushIt;
    }
}
