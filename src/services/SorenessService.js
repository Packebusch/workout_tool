// Soreness Service - Muscle soreness tracking and recovery pattern analysis
// ===========================================================================

import { StorageManager } from './StorageManager.js';
import { STORAGE_KEYS, WORKOUT_MUSCLE_IMPACT, RECOVERY_THRESHOLDS } from '../config/constants.js';
import { generateId, average } from '../utils/utils.js';

export class SorenessService {
    /**
     * Log a new soreness entry
     */
    static logSoreness(sorenessData) {
        const data = StorageManager.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null });

        const newEntry = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            overallLevel: sorenessData.overallLevel || 0,
            affectedAreas: sorenessData.affectedAreas || [],
            notes: sorenessData.notes || '',
            relatedWorkout: sorenessData.relatedWorkout || null
        };

        data.entries.unshift(newEntry);

        // Update latest entry cache
        data.latestEntry = {
            timestamp: newEntry.timestamp,
            overallLevel: newEntry.overallLevel,
            affectedAreas: newEntry.affectedAreas.map(a => a.area)
        };

        // Keep max 200 entries (roughly 3 months of daily logging)
        if (data.entries.length > 200) {
            data.entries = data.entries.slice(0, 200);
        }

        StorageManager.save(STORAGE_KEYS.SORENESS, data);
        return newEntry;
    }

    /**
     * Update an existing soreness entry
     */
    static updateSoreness(id, updates) {
        const data = StorageManager.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null });
        const entryIndex = data.entries.findIndex(e => e.id === id);

        if (entryIndex === -1) {
            return null;
        }

        data.entries[entryIndex] = {
            ...data.entries[entryIndex],
            ...updates
        };

        // Update latest entry cache if this was the latest
        if (entryIndex === 0) {
            data.latestEntry = {
                timestamp: data.entries[0].timestamp,
                overallLevel: data.entries[0].overallLevel,
                affectedAreas: data.entries[0].affectedAreas.map(a => a.area)
            };
        }

        StorageManager.save(STORAGE_KEYS.SORENESS, data);
        return data.entries[entryIndex];
    }

    /**
     * Delete a soreness entry
     */
    static deleteSoreness(id) {
        const data = StorageManager.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null });
        data.entries = data.entries.filter(e => e.id !== id);

        // Update latest entry cache
        if (data.entries.length > 0) {
            data.latestEntry = {
                timestamp: data.entries[0].timestamp,
                overallLevel: data.entries[0].overallLevel,
                affectedAreas: data.entries[0].affectedAreas.map(a => a.area)
            };
        } else {
            data.latestEntry = null;
        }

        StorageManager.save(STORAGE_KEYS.SORENESS, data);
        return true;
    }

    /**
     * Get recent soreness entries
     */
    static getRecentSoreness(hours = 24) {
        const data = StorageManager.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null });
        const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));

        return data.entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= cutoff;
        });
    }

    /**
     * Get soreness history for N days
     */
    static getSorenessHistory(days = 7) {
        const data = StorageManager.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null });
        const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

        return data.entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= cutoff;
        });
    }

    /**
     * Get the most recent soreness entry
     */
    static getLatestSoreness() {
        const data = StorageManager.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null });
        return data.entries[0] || null;
    }

    /**
     * Get current overall soreness level (0-5)
     */
    static getCurrentSorenessLevel() {
        const latest = this.getLatestSoreness();
        if (!latest) return 0;

        // If entry is older than 24 hours, consider soreness has reduced
        const age = Date.now() - new Date(latest.timestamp).getTime();
        const ageHours = age / (1000 * 60 * 60);

        if (ageHours > 48) return 0; // Assume recovered after 48 hours
        if (ageHours > 24) return Math.max(0, latest.overallLevel - 2); // Reduce by 2 levels

        return latest.overallLevel;
    }

    /**
     * Get currently affected muscle groups
     */
    static getAffectedMuscleGroups() {
        const latest = this.getLatestSoreness();
        if (!latest) return [];

        // Only return muscle groups with level >= 2
        return latest.affectedAreas
            .filter(area => area.level >= 2)
            .map(area => area.area);
    }

    /**
     * Analyze soreness patterns over time
     */
    static getSorenessPattern(days = 14) {
        const history = this.getSorenessHistory(days);

        if (history.length === 0) {
            return {
                averageLevel: 0,
                trend: 'none',
                mostAffectedAreas: []
            };
        }

        // Calculate average soreness level
        const avgLevel = average(history.map(e => e.overallLevel));

        // Determine trend (comparing first half vs second half)
        const midpoint = Math.floor(history.length / 2);
        const firstHalf = history.slice(midpoint);
        const secondHalf = history.slice(0, midpoint);

        const firstHalfAvg = average(firstHalf.map(e => e.overallLevel));
        const secondHalfAvg = average(secondHalf.map(e => e.overallLevel));

        let trend = 'stable';
        if (secondHalfAvg > firstHalfAvg * 1.2) trend = 'increasing';
        else if (secondHalfAvg < firstHalfAvg * 0.8) trend = 'decreasing';

        // Find most affected muscle groups
        const areaFrequency = {};
        history.forEach(entry => {
            entry.affectedAreas.forEach(area => {
                if (area.level >= 3) {
                    areaFrequency[area.area] = (areaFrequency[area.area] || 0) + 1;
                }
            });
        });

        const mostAffectedAreas = Object.entries(areaFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([area]) => area);

        return {
            averageLevel: avgLevel.toFixed(1),
            trend,
            mostAffectedAreas
        };
    }

    /**
     * Determine if user needs recovery
     */
    static needsRecovery() {
        const currentLevel = this.getCurrentSorenessLevel();
        return currentLevel >= RECOVERY_THRESHOLDS.sorenessRest;
    }

    /**
     * Correlate soreness with workouts
     */
    static correlateSorenessWithWorkouts(history) {
        const sorenessData = this.getSorenessHistory(30); // Last 30 days

        if (sorenessData.length === 0 || history.sessions.length === 0) {
            return {};
        }

        const correlation = {};

        // For each workout type, find soreness entries 24-48 hours after
        history.sessions.forEach(workout => {
            const workoutDate = new Date(workout.date);
            const after24h = new Date(workoutDate.getTime() + (24 * 60 * 60 * 1000));
            const after48h = new Date(workoutDate.getTime() + (48 * 60 * 60 * 1000));

            const relevantSoreness = sorenessData.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                return entryDate >= after24h && entryDate <= after48h;
            });

            if (relevantSoreness.length > 0) {
                const avgSoreness = average(relevantSoreness.map(e => e.overallLevel));
                const type = workout.workoutType;

                if (!correlation[type]) {
                    correlation[type] = { totalSoreness: 0, count: 0 };
                }

                correlation[type].totalSoreness += avgSoreness;
                correlation[type].count++;
            }
        });

        // Calculate averages
        Object.keys(correlation).forEach(type => {
            correlation[type].average = (correlation[type].totalSoreness / correlation[type].count).toFixed(1);
        });

        return correlation;
    }

    /**
     * Predict soreness from a workout type
     */
    static getPredictedSoreness(workoutType, history) {
        const correlation = this.correlateSorenessWithWorkouts(history);
        return correlation[workoutType]?.average || 2; // Default to 2 (moderate) if no data
    }

    /**
     * Get recovery time estimate for a muscle group
     */
    static getRecoveryTime(muscleGroup) {
        const history = this.getSorenessHistory(30);

        if (history.length < 5) {
            return { hours: 48, confidence: 'low' }; // Default estimate
        }

        // Find instances where this muscle group recovered (went from >= 3 to < 2)
        const recoveryTimes = [];

        for (let i = 0; i < history.length - 1; i++) {
            const current = history[i];
            const next = history[i + 1];

            const currentLevel = current.affectedAreas.find(a => a.area === muscleGroup)?.level || 0;
            const nextLevel = next.affectedAreas.find(a => a.area === muscleGroup)?.level || 0;

            if (nextLevel >= 3 && currentLevel < 2) {
                const timeDiff = new Date(next.timestamp) - new Date(current.timestamp);
                recoveryTimes.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
            }
        }

        if (recoveryTimes.length === 0) {
            return { hours: 48, confidence: 'low' };
        }

        const avgRecovery = average(recoveryTimes);
        return {
            hours: Math.round(avgRecovery),
            confidence: recoveryTimes.length >= 3 ? 'high' : 'medium'
        };
    }

    /**
     * Auto-prune old entries (keep last 200)
     */
    static pruneOldEntries() {
        const data = StorageManager.load(STORAGE_KEYS.SORENESS, { entries: [], latestEntry: null });

        if (data.entries.length > 200) {
            data.entries = data.entries.slice(0, 200);
            StorageManager.save(STORAGE_KEYS.SORENESS, data);
        }
    }
}
