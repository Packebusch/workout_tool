// Utility Functions
// ==================

/**
 * Generate a UUID v4
 */
export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Add weeks to a date
 */
export function addWeeks(date, weeks) {
    const result = new Date(date);
    result.setDate(result.getDate() + (weeks * 7));
    return result.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

/**
 * Calculate workout frequency (workouts per week)
 */
export function calculateWorkoutFrequency(history, weeks = 4) {
    const now = new Date();
    const weeksAgo = new Date(now.getTime() - (weeks * 7 * 24 * 60 * 60 * 1000));

    const recentWorkouts = history.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weeksAgo;
    });

    return recentWorkouts.length / weeks;
}

/**
 * Calculate average of array
 */
export function average(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Get last N items from array
 */
export function lastN(array, n) {
    return array.slice(0, n);
}

/**
 * Round to nearest integer
 */
export function roundToInt(num) {
    return Math.round(num);
}
