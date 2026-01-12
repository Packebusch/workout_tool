// Storage Manager - localStorage with error handling and versioning
// ===================================================================

import { STORAGE_KEYS } from '../config/constants.js';

export class StorageManager {
    static #errorListeners = [];

    /**
     * Save data to localStorage with error handling
     */
    static save(key, data) {
        try {
            const versioned = {
                version: STORAGE_KEYS.VERSION,
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(versioned));
            return true;
        } catch (error) {
            console.error(`Storage save failed for ${key}:`, error);
            this.#notifyError('save', key, error);
            return false;
        }
    }

    /**
     * Load data from localStorage with error handling
     */
    static load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);

            // Handle both versioned and legacy data
            if (parsed.version !== undefined) {
                return this.#migrate(parsed);
            }

            // Legacy data without version
            return parsed;
        } catch (error) {
            console.error(`Storage load failed for ${key}:`, error);
            this.#notifyError('load', key, error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Storage remove failed for ${key}:`, error);
            this.#notifyError('remove', key, error);
            return false;
        }
    }

    /**
     * Check if localStorage is available
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage usage info
     */
    static getUsageInfo() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            return {
                used: totalSize,
                usedKB: (totalSize / 1024).toFixed(2),
                available: true
            };
        } catch (error) {
            return { available: false };
        }
    }

    /**
     * Migrate data from old versions
     */
    static #migrate(versionedData) {
        const { version, data } = versionedData;

        // Future: handle version migrations
        // if (version < 2) {
        //     data = migrateV1toV2(data);
        // }

        return data;
    }

    /**
     * Subscribe to storage errors
     */
    static onError(callback) {
        this.#errorListeners.push(callback);
        return () => {
            this.#errorListeners = this.#errorListeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify error listeners
     */
    static #notifyError(operation, key, error) {
        const errorInfo = {
            operation,
            key,
            error,
            timestamp: Date.now()
        };

        this.#errorListeners.forEach(callback => {
            try {
                callback(errorInfo);
            } catch (err) {
                console.error('Error listener failed:', err);
            }
        });
    }

    /**
     * Clear all app data
     */
    static clearAll() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                if (typeof key === 'string') {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }

    /**
     * Export all data as JSON
     */
    static exportAll() {
        return {
            version: STORAGE_KEYS.VERSION,
            exportDate: new Date().toISOString(),
            history: this.load(STORAGE_KEYS.HISTORY, { sessions: [] }),
            streak: this.load(STORAGE_KEYS.STREAK, {
                streak: 0,
                lastWorkoutDate: null,
                longestStreak: 0
            }),
            goals: this.load(STORAGE_KEYS.GOALS, { goals: [] }),
            soreness: this.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null }),
            coachState: this.load(STORAGE_KEYS.COACH_STATE, {
                lastRecommendation: null,
                preferences: {
                    notificationsEnabled: true,
                    coachingStyle: 'balanced',
                    reminderFrequency: 'daily'
                },
                achievements: []
            })
        };
    }

    /**
     * Import data with validation
     */
    static importAll(data, merge = false) {
        try {
            // Validate structure
            if (!data.history || !data.streak) {
                throw new Error('Invalid import data: missing required fields');
            }

            if (!Array.isArray(data.history.sessions)) {
                throw new Error('Invalid import data: history.sessions must be an array');
            }

            // Ensure new fields exist with defaults
            if (!data.goals) data.goals = { goals: [] };
            if (!data.soreness) data.soreness = { entries: [], latestEntry: null };
            if (!data.coachState) data.coachState = {
                lastRecommendation: null,
                preferences: {
                    notificationsEnabled: true,
                    coachingStyle: 'balanced',
                    reminderFrequency: 'daily'
                },
                achievements: []
            };

            if (merge) {
                return this.#mergeImportData(data);
            } else {
                this.save(STORAGE_KEYS.HISTORY, data.history);
                this.save(STORAGE_KEYS.STREAK, data.streak);
                this.save(STORAGE_KEYS.GOALS, data.goals);
                this.save(STORAGE_KEYS.SORENESS, data.soreness);
                this.save(STORAGE_KEYS.COACH_STATE, data.coachState);
                return { success: true, merged: false };
            }
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }

    /**
     * Merge imported data with existing data
     */
    static #mergeImportData(importedData) {
        const existing = {
            history: this.load(STORAGE_KEYS.HISTORY, { sessions: [] }),
            streak: this.load(STORAGE_KEYS.STREAK, {
                streak: 0,
                lastWorkoutDate: null,
                longestStreak: 0
            }),
            goals: this.load(STORAGE_KEYS.GOALS, { goals: [] }),
            soreness: this.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null }),
            coachState: this.load(STORAGE_KEYS.COACH_STATE, {
                lastRecommendation: null,
                preferences: {
                    notificationsEnabled: true,
                    coachingStyle: 'balanced',
                    reminderFrequency: 'daily'
                },
                achievements: []
            })
        };

        // Merge sessions (avoid duplicates by date)
        const existingDates = new Set(existing.history.sessions.map(s => s.date));
        const newSessions = importedData.history.sessions.filter(
            s => !existingDates.has(s.date)
        );

        existing.history.sessions = [...existing.history.sessions, ...newSessions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 50); // Keep max 50 most recent

        // Merge streaks - use better values
        const mergedStreak = {
            streak: Math.max(existing.streak.streak || 0, importedData.streak.streak || 0),
            lastWorkoutDate: existing.streak.lastWorkoutDate || importedData.streak.lastWorkoutDate,
            longestStreak: Math.max(
                existing.streak.longestStreak || 0,
                importedData.streak.longestStreak || 0
            )
        };

        // Update most recent workout date
        if (importedData.streak.lastWorkoutDate) {
            const importedDate = new Date(importedData.streak.lastWorkoutDate);
            const existingDate = existing.streak.lastWorkoutDate
                ? new Date(existing.streak.lastWorkoutDate)
                : new Date(0);

            if (importedDate > existingDate) {
                mergedStreak.lastWorkoutDate = importedData.streak.lastWorkoutDate;
                mergedStreak.streak = importedData.streak.streak;
            }
        }

        // Merge goals (avoid duplicates by id)
        const existingGoalIds = new Set(existing.goals.goals.map(g => g.id));
        const newGoals = importedData.goals.goals.filter(g => !existingGoalIds.has(g.id));
        existing.goals.goals = [...existing.goals.goals, ...newGoals]
            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
            .slice(0, 30); // Keep max 30 most recent

        // Merge soreness entries (avoid duplicates by id)
        const existingSorenessIds = new Set(existing.soreness.entries.map(e => e.id));
        const newSorenessEntries = importedData.soreness.entries.filter(e => !existingSorenessIds.has(e.id));
        existing.soreness.entries = [...existing.soreness.entries, ...newSorenessEntries]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 200); // Keep max 200 most recent entries

        // Update latest soreness entry
        if (existing.soreness.entries.length > 0) {
            existing.soreness.latestEntry = {
                timestamp: existing.soreness.entries[0].timestamp,
                overallLevel: existing.soreness.entries[0].overallLevel,
                affectedAreas: existing.soreness.entries[0].affectedAreas.map(a => a.area)
            };
        }

        // Merge coach state - prefer imported if more recent
        if (importedData.coachState.lastRecommendation &&
            importedData.coachState.lastRecommendation.timestamp >
            (existing.coachState.lastRecommendation?.timestamp || 0)) {
            existing.coachState.lastRecommendation = importedData.coachState.lastRecommendation;
        }

        // Merge achievements (avoid duplicates)
        const existingAchievements = new Set(existing.coachState.achievements.map(a =>
            `${a.type}-${a.date}`
        ));
        const newAchievements = importedData.coachState.achievements.filter(a =>
            !existingAchievements.has(`${a.type}-${a.date}`)
        );
        existing.coachState.achievements = [...existing.coachState.achievements, ...newAchievements]
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // Save merged data
        this.save(STORAGE_KEYS.HISTORY, existing.history);
        this.save(STORAGE_KEYS.STREAK, mergedStreak);
        this.save(STORAGE_KEYS.GOALS, existing.goals);
        this.save(STORAGE_KEYS.SORENESS, existing.soreness);
        this.save(STORAGE_KEYS.COACH_STATE, existing.coachState);

        return {
            success: true,
            merged: true,
            newSessions: newSessions.length,
            newGoals: newGoals.length,
            newSorenessEntries: newSorenessEntries.length,
            newAchievements: newAchievements.length
        };
    }
}
