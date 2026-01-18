// Calculation Utilities
// ======================

import { WORKOUT_CONFIGS, TARGET_REPS, PROGRESSION_LADDERS, PROGRESSION_CALORIE_MULTIPLIERS } from '../config/constants.js';

/**
 * Calculate calories burned
 * @param {string} workoutType - The workout type
 * @param {number} reps - Total reps completed
 * @param {number} elapsedMinutes - Duration in minutes
 * @param {number} progressionLevel - Current progression level (1-5)
 * @returns {number} - Calories burned
 */
export function calculateCalories(workoutType, reps, elapsedMinutes, progressionLevel = 1) {
    const config = WORKOUT_CONFIGS[workoutType];
    if (!config) return 0;

    // Apply progression multiplier (higher levels burn more calories)
    const multiplier = PROGRESSION_CALORIE_MULTIPLIERS[Math.min(progressionLevel, 5)] || 1;

    return Math.round(
        ((elapsedMinutes * config.caloriesPerMinute) + (reps * config.caloriesPerRep)) * multiplier
    );
}

/**
 * Calculate fitness level based on reps per minute
 * Uses progression-specific thresholds when workoutType and progressionLevel are provided
 * @param {number} reps - Total reps completed
 * @param {number} durationSeconds - Duration in seconds
 * @param {string|null} workoutType - The workout type (optional)
 * @param {number} progressionLevel - Current progression level (1-5)
 * @returns {string} - Fitness level: 'Beginner', 'Intermediate', 'Advanced', or 'Elite'
 */
export function calculateFitnessLevel(reps, durationSeconds, workoutType = null, progressionLevel = 1) {
    const repsPerMin = reps / (durationSeconds / 60);

    // If workoutType provided, use progression-specific thresholds
    if (workoutType && PROGRESSION_LADDERS[workoutType]) {
        const levelConfig = PROGRESSION_LADDERS[workoutType].levels.find(l => l.level === progressionLevel);
        if (levelConfig) {
            if (repsPerMin >= levelConfig.elite) return 'Elite';
            if (repsPerMin >= levelConfig.advanced) return 'Advanced';
            if (repsPerMin >= levelConfig.intermediate) return 'Intermediate';
            return 'Beginner';
        }
    }

    // Fallback to existing generic thresholds
    if (repsPerMin >= 10) return 'Elite';
    if (repsPerMin >= 7) return 'Advanced';
    if (repsPerMin >= 4) return 'Intermediate';
    return 'Beginner';
}

/**
 * Calculate pace (reps per minute)
 */
export function calculatePace(reps, elapsedMinutes) {
    return elapsedMinutes > 0 ? reps / elapsedMinutes : 0;
}

/**
 * Get target reps for workout type and difficulty
 */
export function getTargetReps(workoutType, difficulty) {
    return TARGET_REPS[difficulty]?.[workoutType] || 100;
}

/**
 * Calculate trend from session data
 * Uses normalized reps per minute to account for different workout durations
 */
export function calculateTrend(sessions) {
    if (sessions.length < 3) return 'neutral';

    // Normalize by duration - use reps per minute for fair comparison
    const repsPerMin = sessions.map(s => {
        const durationMinutes = s.duration / 60;
        return durationMinutes > 0 ? s.reps / durationMinutes : 0;
    });

    const avg = repsPerMin.reduce((a, b) => a + b, 0) / repsPerMin.length;
    const recent = repsPerMin.slice(0, Math.ceil(repsPerMin.length / 2));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

    if (recentAvg > avg * 1.05) return 'improving';
    if (recentAvg < avg * 0.95) return 'declining';
    return 'plateau';
}

/**
 * Get next difficulty level
 */
export function getNextDifficulty(current) {
    const levels = ['beginner', 'intermediate', 'advanced', 'elite'];
    const currentIndex = levels.indexOf(current);
    if (currentIndex < levels.length - 1) {
        return levels[currentIndex + 1];
    }
    return null;
}

/**
 * Compare two weeks' performance
 */
export function compareWeeks(thisWeek, lastWeek) {
    if (!thisWeek || !lastWeek) return null;

    const improvement = ((thisWeek.avgReps - lastWeek.avgReps) / lastWeek.avgReps) * 100;
    return Math.round(improvement);
}

/**
 * Get random item from array
 */
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
