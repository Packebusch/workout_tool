// Progression Service - Exercise progression ladder management
// ============================================================

import { StorageManager } from './StorageManager.js';
import {
    STORAGE_KEYS,
    PROGRESSION_LADDERS,
    PROGRESSION_CONFIG,
    PROGRESSION_MESSAGES
} from '../config/constants.js';
import { getRandomItem } from '../utils/calculations.js';

export class ProgressionService {
    /**
     * Get all progressions data from storage
     */
    static getProgressions() {
        return StorageManager.load(STORAGE_KEYS.PROGRESSIONS, {});
    }

    /**
     * Save progressions data to storage
     */
    static saveProgressions(data) {
        return StorageManager.save(STORAGE_KEYS.PROGRESSIONS, data);
    }

    /**
     * Get progression data for a specific exercise type
     * @param {string} exerciseType - e.g., 'squats', 'burpees'
     * @returns {Object|null} - Progression data or null if not found
     */
    static getExerciseProgression(exerciseType) {
        const progressions = this.getProgressions();
        return progressions[exerciseType] || null;
    }

    /**
     * Get current level for an exercise
     * @param {string} exerciseType
     * @returns {number} - Current level (defaults to 1)
     */
    static getCurrentLevel(exerciseType) {
        const progression = this.getExerciseProgression(exerciseType);
        return progression?.currentLevel || 1;
    }

    /**
     * Get current variation name for an exercise
     * @param {string} exerciseType
     * @returns {string|null} - Variation name or null
     */
    static getCurrentVariation(exerciseType) {
        const progression = this.getExerciseProgression(exerciseType);
        if (progression) {
            return progression.variation;
        }

        // If no progression exists, return level 1 variation
        const ladder = PROGRESSION_LADDERS[exerciseType];
        if (ladder && ladder.levels.length > 0) {
            return ladder.levels[0].variation;
        }

        return null;
    }

    /**
     * Get level configuration (thresholds) for a specific level
     * @param {string} exerciseType
     * @param {number} level
     * @returns {Object|null} - Level config or null
     */
    static getLevelConfig(exerciseType, level) {
        const ladder = PROGRESSION_LADDERS[exerciseType];
        if (!ladder) return null;

        return ladder.levels.find(l => l.level === level) || null;
    }

    /**
     * Get maximum level available for an exercise
     * @param {string} exerciseType
     * @returns {number} - Max level
     */
    static getMaxLevel(exerciseType) {
        const ladder = PROGRESSION_LADDERS[exerciseType];
        if (!ladder || ladder.levels.length === 0) return 1;

        return Math.max(...ladder.levels.map(l => l.level));
    }

    /**
     * Record a session at the current progression level
     * Called after each workout to update tracking counters
     * @param {string} exerciseType
     * @param {string} fitnessLevel - 'Beginner', 'Intermediate', 'Advanced', 'Elite'
     */
    static recordSession(exerciseType, fitnessLevel) {
        const progressions = this.getProgressions();

        // Initialize if needed
        if (!progressions[exerciseType]) {
            this.#initializeExercise(exerciseType, progressions);
        }

        const progression = progressions[exerciseType];

        // Increment session count
        progression.sessionsAtLevel = (progression.sessionsAtLevel || 0) + 1;

        // Track Elite performances
        if (fitnessLevel === 'Elite') {
            progression.eliteCountAtLevel = (progression.eliteCountAtLevel || 0) + 1;
        }

        // Track recent fitness levels for regression detection
        if (!progression.recentFitnessLevels) {
            progression.recentFitnessLevels = [];
        }
        progression.recentFitnessLevels.unshift(fitnessLevel);
        // Keep only last 5
        progression.recentFitnessLevels = progression.recentFitnessLevels.slice(0, 5);

        this.saveProgressions(progressions);
    }

    /**
     * Check if user is eligible to progress to next level
     * @param {string} exerciseType
     * @param {number} sorenessLevel - Current soreness (0-5)
     * @param {string} trend - 'improving', 'plateau', 'declining'
     * @returns {Object} - { eligible: boolean, reason: string }
     */
    static checkProgressionEligibility(exerciseType, sorenessLevel, trend) {
        const progression = this.getExerciseProgression(exerciseType);

        if (!progression) {
            return { eligible: false, reason: 'No progression data' };
        }

        const currentLevel = progression.currentLevel;
        const maxLevel = this.getMaxLevel(exerciseType);

        // Already at max level
        if (currentLevel >= maxLevel) {
            return { eligible: false, reason: 'Already at maximum level' };
        }

        // Check minimum sessions at level
        if (progression.sessionsAtLevel < PROGRESSION_CONFIG.minSessionsForProgression) {
            return {
                eligible: false,
                reason: `Need ${PROGRESSION_CONFIG.minSessionsForProgression - progression.sessionsAtLevel} more sessions at this level`
            };
        }

        // Check Elite performance count
        if (progression.eliteCountAtLevel < PROGRESSION_CONFIG.minEliteCountForProgression) {
            return {
                eligible: false,
                reason: `Need ${PROGRESSION_CONFIG.minEliteCountForProgression - progression.eliteCountAtLevel} more Elite performances`
            };
        }

        // Check soreness level
        if (sorenessLevel > PROGRESSION_CONFIG.maxSorenessForProgression) {
            return {
                eligible: false,
                reason: 'Soreness level too high for progression'
            };
        }

        // Check trend - don't progress if declining
        if (trend === 'declining') {
            return {
                eligible: false,
                reason: 'Performance is declining - focus on consistency first'
            };
        }

        // All conditions met!
        return { eligible: true, reason: 'Ready for progression!' };
    }

    /**
     * Check if regression is needed
     * @param {string} exerciseType
     * @param {string[]} recentFitnessLevels - Array of recent fitness levels (most recent first)
     * @param {number} sorenessLevel - Current soreness (0-5)
     * @returns {Object} - { needed: boolean, reason: string }
     */
    static checkRegressionNeeded(exerciseType, recentFitnessLevels, sorenessLevel) {
        const progression = this.getExerciseProgression(exerciseType);

        if (!progression || progression.currentLevel <= 1) {
            return { needed: false, reason: 'Already at minimum level' };
        }

        // Check for consecutive Beginner performances
        if (recentFitnessLevels && recentFitnessLevels.length >= PROGRESSION_CONFIG.consecutiveBeginnerForRegression) {
            const recentLevels = recentFitnessLevels.slice(0, PROGRESSION_CONFIG.consecutiveBeginnerForRegression);
            const allBeginner = recentLevels.every(level => level === 'Beginner');

            if (allBeginner) {
                return {
                    needed: true,
                    reason: `${PROGRESSION_CONFIG.consecutiveBeginnerForRegression} consecutive Beginner performances`
                };
            }
        }

        // Check for high soreness
        if (sorenessLevel >= PROGRESSION_CONFIG.minSorenessForRegression) {
            return {
                needed: true,
                reason: 'High soreness level - consider stepping back'
            };
        }

        return { needed: false, reason: '' };
    }

    /**
     * Progress to next level
     * @param {string} exerciseType
     * @returns {Object|null} - New progression data or null if failed
     */
    static progressToNextLevel(exerciseType) {
        const progressions = this.getProgressions();

        if (!progressions[exerciseType]) {
            return null;
        }

        const progression = progressions[exerciseType];
        const maxLevel = this.getMaxLevel(exerciseType);

        if (progression.currentLevel >= maxLevel) {
            return null; // Already at max
        }

        const newLevel = progression.currentLevel + 1;
        const newConfig = this.getLevelConfig(exerciseType, newLevel);

        if (!newConfig) {
            return null;
        }

        // Update progression
        progression.currentLevel = newLevel;
        progression.variation = newConfig.variation;
        progression.startedDate = new Date().toISOString();
        progression.sessionsAtLevel = 0;
        progression.eliteCountAtLevel = 0;
        progression.recentFitnessLevels = [];

        this.saveProgressions(progressions);

        return progression;
    }

    /**
     * Regress to previous level
     * @param {string} exerciseType
     * @returns {Object|null} - New progression data or null if failed
     */
    static regressToPreviousLevel(exerciseType) {
        const progressions = this.getProgressions();

        if (!progressions[exerciseType]) {
            return null;
        }

        const progression = progressions[exerciseType];

        if (progression.currentLevel <= 1) {
            return null; // Already at minimum
        }

        const newLevel = progression.currentLevel - 1;
        const newConfig = this.getLevelConfig(exerciseType, newLevel);

        if (!newConfig) {
            return null;
        }

        // Update progression
        progression.currentLevel = newLevel;
        progression.variation = newConfig.variation;
        progression.startedDate = new Date().toISOString();
        progression.sessionsAtLevel = 0;
        progression.eliteCountAtLevel = 0;
        progression.recentFitnessLevels = [];

        this.saveProgressions(progressions);

        return progression;
    }

    /**
     * Manually set level for an exercise
     * @param {string} exerciseType
     * @param {number} level
     * @returns {Object|null} - New progression data or null if failed
     */
    static setLevel(exerciseType, level) {
        const ladder = PROGRESSION_LADDERS[exerciseType];
        if (!ladder) return null;

        const levelConfig = ladder.levels.find(l => l.level === level);
        if (!levelConfig) return null;

        const progressions = this.getProgressions();

        progressions[exerciseType] = {
            currentLevel: level,
            variation: levelConfig.variation,
            startedDate: new Date().toISOString(),
            sessionsAtLevel: 0,
            eliteCountAtLevel: 0,
            recentFitnessLevels: []
        };

        this.saveProgressions(progressions);

        return progressions[exerciseType];
    }

    /**
     * Initialize default progressions for all exercise types
     * Called on app startup if progressions don't exist
     */
    static initializeDefaultProgressions() {
        const progressions = this.getProgressions();
        let needsSave = false;

        for (const exerciseType of Object.keys(PROGRESSION_LADDERS)) {
            if (!progressions[exerciseType]) {
                this.#initializeExercise(exerciseType, progressions);
                needsSave = true;
            }
        }

        if (needsSave) {
            this.saveProgressions(progressions);
        }
    }

    /**
     * Get a random message for progression context
     * @param {string} messageType - 'readyToProgress', 'firstSessionAtLevel', etc.
     * @param {Object} replacements - Variables to replace in message
     * @returns {string}
     */
    static getMessage(messageType, replacements = {}) {
        const messages = PROGRESSION_MESSAGES[messageType];
        if (!messages || messages.length === 0) {
            return '';
        }

        let message = getRandomItem(messages);

        // Replace placeholders
        for (const [key, value] of Object.entries(replacements)) {
            message = message.replace(`{${key}}`, value);
        }

        return message;
    }

    /**
     * Get progression summary for display
     * @param {string} exerciseType
     * @returns {Object} - Summary data
     */
    static getProgressionSummary(exerciseType) {
        const progression = this.getExerciseProgression(exerciseType);
        const ladder = PROGRESSION_LADDERS[exerciseType];

        if (!ladder) {
            return null;
        }

        const currentLevel = progression?.currentLevel || 1;
        const maxLevel = this.getMaxLevel(exerciseType);
        const currentConfig = this.getLevelConfig(exerciseType, currentLevel);

        return {
            exerciseType,
            exerciseName: ladder.name,
            currentLevel,
            maxLevel,
            variation: currentConfig?.variation || ladder.levels[0].variation,
            note: currentConfig?.note || null,
            sessionsAtLevel: progression?.sessionsAtLevel || 0,
            eliteCountAtLevel: progression?.eliteCountAtLevel || 0,
            progressToNext: {
                sessionsNeeded: Math.max(0, PROGRESSION_CONFIG.minSessionsForProgression - (progression?.sessionsAtLevel || 0)),
                eliteNeeded: Math.max(0, PROGRESSION_CONFIG.minEliteCountForProgression - (progression?.eliteCountAtLevel || 0))
            }
        };
    }

    /**
     * Initialize a single exercise in progressions object
     * @private
     */
    static #initializeExercise(exerciseType, progressions) {
        const ladder = PROGRESSION_LADDERS[exerciseType];
        if (!ladder || ladder.levels.length === 0) return;

        const firstLevel = ladder.levels[0];

        progressions[exerciseType] = {
            currentLevel: 1,
            variation: firstLevel.variation,
            startedDate: new Date().toISOString(),
            sessionsAtLevel: 0,
            eliteCountAtLevel: 0,
            recentFitnessLevels: []
        };
    }
}
