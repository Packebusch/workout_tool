// History Service - Workout history management
// ==============================================

import { StorageManager } from './StorageManager.js';
import { STORAGE_KEYS } from '../config/constants.js';
import { filterSessionsByDateRange, getWeekStart, getMonthStart, getDaysAgo, getWeekKey } from '../utils/dateUtils.js';
import { calculateTrend } from '../utils/calculations.js';

export class HistoryService {
    /**
     * Get workout history
     */
    static getHistory() {
        return StorageManager.load(STORAGE_KEYS.HISTORY, { sessions: [] });
    }

    /**
     * Save workout to history
     */
    static saveWorkout(workout) {
        const history = this.getHistory();
        history.sessions.unshift(workout);

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
            const totalReps = sessions.reduce((sum, s) => sum + s.reps, 0);
            const avgReps = Math.round(totalReps / sessions.length);
            const bestReps = Math.max(...sessions.map(s => s.reps));
            const trend = calculateTrend(sessions);

            const lastWeek = this.#getWeekStats(sessions, 2);
            const thisWeek = this.#getWeekStats(sessions, 1);
            const weekComparison = this.#compareWeeks(thisWeek, lastWeek);

            return {
                type,
                count: sessions.length,
                avgReps,
                bestReps,
                trend,
                weekComparison
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
     * Get week stats (helper)
     */
    static #getWeekStats(sessions, weeksAgo) {
        const weekStart = getDaysAgo(weeksAgo * 7);
        const weekEnd = getDaysAgo((weeksAgo - 1) * 7);

        const weekSessions = filterSessionsByDateRange(sessions, weekStart, weekEnd);

        if (weekSessions.length === 0) return null;

        const totalReps = weekSessions.reduce((sum, s) => sum + s.reps, 0);
        return {
            avgReps: totalReps / weekSessions.length,
            count: weekSessions.length
        };
    }

    /**
     * Compare weeks (helper)
     */
    static #compareWeeks(thisWeek, lastWeek) {
        if (!thisWeek || !lastWeek) return null;

        const improvement = ((thisWeek.avgReps - lastWeek.avgReps) / lastWeek.avgReps) * 100;
        return Math.round(improvement);
    }
}
