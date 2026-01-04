// Streak Service - Workout streak tracking
// ==========================================

import { StorageManager } from './StorageManager.js';
import { STORAGE_KEYS } from '../config/constants.js';
import { getTodayString, getYesterdayString } from '../utils/dateUtils.js';

export class StreakService {
    /**
     * Get streak data
     */
    static getStreakData() {
        return StorageManager.load(STORAGE_KEYS.STREAK, {
            streak: 0,
            lastWorkoutDate: null,
            longestStreak: 0
        });
    }

    /**
     * Update streak after completing workout
     */
    static updateStreak() {
        const today = getTodayString();
        const streakData = this.getStreakData();

        // Already worked out today
        if (streakData.lastWorkoutDate === today) {
            return streakData;
        }

        const yesterday = getYesterdayString();

        if (streakData.lastWorkoutDate === yesterday) {
            // Continue streak
            streakData.streak++;
        } else if (!streakData.lastWorkoutDate || streakData.lastWorkoutDate === '') {
            // First workout
            streakData.streak = 1;
        } else {
            // Streak broken, start new
            streakData.streak = 1;
        }

        streakData.lastWorkoutDate = today;
        streakData.longestStreak = Math.max(
            streakData.longestStreak || 0,
            streakData.streak
        );

        StorageManager.save(STORAGE_KEYS.STREAK, streakData);
        return streakData;
    }

    /**
     * Check if user needs a rest day
     */
    static needsRestDay() {
        const streakData = this.getStreakData();
        const today = getTodayString();

        // If already worked out today, don't suggest rest
        if (streakData.lastWorkoutDate === today) {
            return false;
        }

        // 6+ consecutive days = suggest rest
        return streakData.streak >= 6;
    }

    /**
     * Reset streak
     */
    static resetStreak() {
        const streakData = {
            streak: 0,
            lastWorkoutDate: null,
            longestStreak: 0
        };
        return StorageManager.save(STORAGE_KEYS.STREAK, streakData);
    }

    /**
     * Get current streak count
     */
    static getCurrentStreak() {
        const streakData = this.getStreakData();
        return streakData.streak;
    }

    /**
     * Get longest streak
     */
    static getLongestStreak() {
        const streakData = this.getStreakData();
        return streakData.longestStreak || 0;
    }
}
