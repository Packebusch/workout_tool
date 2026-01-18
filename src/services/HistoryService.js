// History Service - Workout history management
// ==============================================

import { StorageManager } from './StorageManager.js';
import { STORAGE_KEYS } from '../config/constants.js';
import { filterSessionsByDateRange, getWeekStart, getMonthStart, getDaysAgo, getWeekKey } from '../utils/dateUtils.js';
import { ProgressionService } from './ProgressionService.js';

export class HistoryService {
    /**
     * Get workout history
     */
    static getHistory() {
        return StorageManager.load(STORAGE_KEYS.HISTORY, { sessions: [] });
    }

    /**
     * Save workout to history
     * Automatically enriches workout with progression info if available
     */
    static saveWorkout(workout) {
        const history = this.getHistory();

        // Enrich workout with progression info if not already present
        let enrichedWorkout = workout;
        if (workout.workoutType && !workout.hasOwnProperty('progressionLevel')) {
            const progression = ProgressionService.getExerciseProgression(workout.workoutType);
            enrichedWorkout = {
                ...workout,
                progressionLevel: progression?.currentLevel || 1,
                variation: progression?.variation || null
            };
        }

        history.sessions.unshift(enrichedWorkout);

        // Keep only last 50 workouts
        if (history.sessions.length > 50) {
            history.sessions = history.sessions.slice(0, 50);
        }

        return StorageManager.save(STORAGE_KEYS.HISTORY, history);
    }

    /**
     * Clear all history
     */
    static clearHistory() {
        return StorageManager.save(STORAGE_KEYS.HISTORY, { sessions: [] });
    }

    /**
     * Get lifetime statistics
     */
    static getLifetimeStats() {
        const history = this.getHistory();

        if (history.sessions.length === 0) {
            return null;
        }

        // Calculate totals
        const totalWorkouts = history.sessions.length;
        const totalReps = history.sessions.reduce((sum, s) => sum + s.reps, 0);
        const totalCalories = history.sessions.reduce((sum, s) => sum + s.calories, 0);
        const totalDuration = history.sessions.reduce((sum, s) => sum + s.duration, 0);

        // Most productive day
        const dayOfWeekCounts = {};
        history.sessions.forEach(session => {
            const day = new Date(session.date).getDay();
            dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
        });

        const mostProductiveDay = Object.keys(dayOfWeekCounts).reduce((a, b) =>
            dayOfWeekCounts[a] > dayOfWeekCounts[b] ? a : b
        );

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return {
            totalWorkouts,
            totalReps,
            totalCalories,
            totalDuration,
            totalHours: Math.floor(totalDuration / 3600),
            totalMinutes: Math.floor((totalDuration % 3600) / 60),
            mostProductiveDay: dayNames[mostProductiveDay]
        };
    }

    /**
     * Get statistics by workout type
     */
    static getStatsByType() {
        const history = this.getHistory();
        if (history.sessions.length === 0) return [];

        // Group by type
        const byType = {};
        history.sessions.forEach(session => {
            const type = session.workoutType || 'burpees';
            if (!byType[type]) byType[type] = [];
            byType[type].push(session);
        });

        // Calculate stats for each type
        return Object.entries(byType).map(([type, sessions]) => {
            // Calculate average reps per minute (normalized)
            const totalRepsPerMin = sessions.reduce((sum, s) => {
                const minutes = s.duration / 60;
                return sum + (s.reps / minutes);
            }, 0);
            const avgRepsPerMin = totalRepsPerMin / sessions.length;

            // Best reps per minute
            const bestRepsPerMin = Math.max(...sessions.map(s => s.reps / (s.duration / 60)));

            // For display, also calculate average total reps (but this is for context only)
            const totalReps = sessions.reduce((sum, s) => sum + s.reps, 0);
            const avgReps = Math.round(totalReps / sessions.length);

            // Compare last session to previous session
            const sessionComparison = this.#compareLastSessions(sessions);

            // Derive trend from session comparison (consistent metrics)
            let trend = 'neutral';
            if (sessionComparison !== null) {
                if (sessionComparison > 5) trend = 'improving';
                else if (sessionComparison < -5) trend = 'declining';
                else trend = 'plateau';
            }

            return {
                type,
                count: sessions.length,
                avgReps,  // For display context
                avgRepsPerMin: avgRepsPerMin.toFixed(1),  // Normalized metric
                bestRepsPerMin: bestRepsPerMin.toFixed(1),  // Normalized best
                trend,
                sessionComparison
            };
        }).sort((a, b) => b.count - a.count);
    }

    /**
     * Get personal record for current workout
     */
    static getPersonalRecord(workoutType, difficulty, currentReps) {
        const history = this.getHistory();

        const similar = history.sessions.filter(
            s => s.workoutType === workoutType && s.difficulty === difficulty
        );

        if (similar.length === 0) return null;

        const bestSession = similar.reduce((best, current) =>
            current.reps > best.reps ? current : best
        );

        const recordReps = bestSession.reps;
        const isNewRecord = currentReps > recordReps;
        const improvement = isNewRecord ? currentReps - recordReps : 0;

        return {
            recordReps,
            currentReps,
            isNewRecord,
            improvement,
            recordDate: bestSession.date
        };
    }

    /**
     * Get progress comparison to last similar workout
     */
    static getProgressComparison(workoutType, difficulty, currentReps) {
        const history = this.getHistory();

        const similar = history.sessions.find(
            s => s.workoutType === workoutType && s.difficulty === difficulty
        );

        if (!similar) return null;

        const lastReps = similar.reps;
        const improvement = Math.round(((currentReps - lastReps) / lastReps) * 100);

        return {
            lastReps,
            currentReps,
            improvement
        };
    }

    /**
     * Get this week's summary
     */
    static getWeekSummary() {
        const history = this.getHistory();
        const weekStart = getWeekStart();

        const thisWeekWorkouts = filterSessionsByDateRange(history.sessions, weekStart);

        if (thisWeekWorkouts.length === 0) return null;

        const thisWeekReps = thisWeekWorkouts.reduce((sum, s) => sum + s.reps, 0);
        const thisWeekCalories = thisWeekWorkouts.reduce((sum, s) => sum + s.calories, 0);

        // Check for best week ever
        const weeklyGroups = {};
        history.sessions.forEach(s => {
            const weekKey = getWeekKey(s.date);
            if (!weeklyGroups[weekKey]) weeklyGroups[weekKey] = [];
            weeklyGroups[weekKey].push(s);
        });

        const bestWeekReps = Math.max(...Object.values(weeklyGroups).map(sessions =>
            sessions.reduce((sum, s) => sum + s.reps, 0)
        ));

        const isBestWeek = thisWeekReps === bestWeekReps && thisWeekReps > 0;

        return {
            workouts: thisWeekWorkouts.length,
            reps: thisWeekReps,
            calories: thisWeekCalories,
            isBestWeek
        };
    }

    /**
     * Get this month's summary
     */
    static getMonthSummary() {
        const history = this.getHistory();
        const monthStart = getMonthStart();

        const thisMonthWorkouts = filterSessionsByDateRange(history.sessions, monthStart);

        if (thisMonthWorkouts.length === 0) return null;

        const thisMonthReps = thisMonthWorkouts.reduce((sum, s) => sum + s.reps, 0);

        return {
            workouts: thisMonthWorkouts.length,
            reps: thisMonthReps
        };
    }

    /**
     * Compare last session to previous session
     * Uses reps per minute for fair comparison across different workout durations
     */
    static #compareLastSessions(sessions) {
        if (sessions.length < 2) return null;

        const lastSession = sessions[0];
        const prevSession = sessions[1];

        const lastRepsPerMin = lastSession.reps / (lastSession.duration / 60);
        const prevRepsPerMin = prevSession.reps / (prevSession.duration / 60);

        const improvement = ((lastRepsPerMin - prevRepsPerMin) / prevRepsPerMin) * 100;
        return Math.round(improvement);
    }

    /**
     * Get recent fitness levels for a specific workout type
     * @param {string} workoutType - The workout type (e.g., 'squats')
     * @param {number} count - Number of recent sessions to return
     * @returns {string[]} - Array of fitness levels (most recent first)
     */
    static getRecentFitnessLevels(workoutType, count = 2) {
        const history = this.getHistory();
        return history.sessions
            .filter(s => s.workoutType === workoutType)
            .slice(0, count)
            .map(s => s.fitnessLevel);
    }

    /**
     * Get workout history for a specific progression level
     * @param {string} workoutType - The workout type
     * @param {number} progressionLevel - The progression level
     * @returns {Object[]} - Array of sessions at that level
     */
    static getSessionsByProgressionLevel(workoutType, progressionLevel) {
        const history = this.getHistory();
        return history.sessions.filter(
            s => s.workoutType === workoutType && s.progressionLevel === progressionLevel
        );
    }

    /**
     * Get best performance at a specific progression level
     * @param {string} workoutType - The workout type
     * @param {number} progressionLevel - The progression level
     * @returns {Object|null} - Best session or null
     */
    static getBestAtProgressionLevel(workoutType, progressionLevel) {
        const sessions = this.getSessionsByProgressionLevel(workoutType, progressionLevel);
        if (sessions.length === 0) return null;

        return sessions.reduce((best, current) =>
            current.reps > best.reps ? current : best
        );
    }
}
