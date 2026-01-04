// Calculation Utilities
// ======================

import { WORKOUT_CONFIGS, TARGET_REPS } from '../config/constants.js';

/**
 * Calculate calories burned
 */
export function calculateCalories(workoutType, reps, elapsedMinutes) {
    const config = WORKOUT_CONFIGS[workoutType];
    if (!config) return 0;

    return Math.round(
        (elapsedMinutes * config.caloriesPerMinute) +
        (reps * config.caloriesPerRep)
    );
}

/**
 * Calculate fitness level based on reps per minute
 */
export function calculateFitnessLevel(reps, durationSeconds) {
    const repsPerMin = reps / (durationSeconds / 60);

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
 */
export function calculateTrend(sessions) {
    if (sessions.length < 3) return 'neutral';

    const reps = sessions.map(s => s.reps);
    const avg = reps.reduce((a, b) => a + b, 0) / reps.length;
    const recent = reps.slice(0, Math.ceil(reps.length / 2));
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
