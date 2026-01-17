// Weekly Stats Service - Weekly workout frequency tracking
// ==========================================================

import { StorageManager } from './StorageManager.js';
import { STORAGE_KEYS } from '../config/constants.js';
import { getWeekStart, getTodayString } from '../utils/dateUtils.js';

export class WeeklyStatsService {
    /**
     * Get weekly stats data
     */
    static getWeeklyStats() {
        return StorageManager.load(STORAGE_KEYS.WEEKLY_STATS, {
            currentWeekWorkouts: [],
            lastWorkoutDate: null
        });
    }

    /**
     * Update stats after completing workout
     */
    static updateWeeklyStats() {
        const today = getTodayString();
        const weeklyData = this.getWeeklyStats();
        const weekStart = getWeekStart();

        // Filter out workouts from previous weeks
        weeklyData.currentWeekWorkouts = (weeklyData.currentWeekWorkouts || [])
            .filter(date => new Date(date) >= weekStart);

        // Add today's workout if not already counted
        if (!weeklyData.currentWeekWorkouts.includes(today)) {
            weeklyData.currentWeekWorkouts.push(today);
        }

        weeklyData.lastWorkoutDate = today;

        StorageManager.save(STORAGE_KEYS.WEEKLY_STATS, weeklyData);
        return weeklyData;
    }

    /**
     * Get current week's workout count
     */
    static getCurrentWeekCount() {
        const weeklyData = this.getWeeklyStats();
        const weekStart = getWeekStart();

        // Filter workouts to only include current week
        const currentWeekWorkouts = (weeklyData.currentWeekWorkouts || [])
            .filter(date => new Date(date) >= weekStart);

        return currentWeekWorkouts.length;
    }

    /**
     * Reset weekly stats
     */
    static resetWeeklyStats() {
        const weeklyData = {
            currentWeekWorkouts: [],
            lastWorkoutDate: null
        };
        return StorageManager.save(STORAGE_KEYS.WEEKLY_STATS, weeklyData);
    }
}
