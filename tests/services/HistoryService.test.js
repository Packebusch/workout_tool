// HistoryService Progression Tests
// =================================

import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryService } from '../../src/services/HistoryService.js';
import { ProgressionService } from '../../src/services/ProgressionService.js';
import { STORAGE_KEYS } from '../../src/config/constants.js';

describe('HistoryService - Progression Features', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('saveWorkout', () => {
        it('should save workout to history', () => {
            const workout = {
                date: new Date().toISOString(),
                duration: 1200,
                reps: 100,
                calories: 150,
                fitnessLevel: 'Intermediate',
                workoutType: 'squats',
                difficulty: 'advanced'
            };

            HistoryService.saveWorkout(workout);

            const history = HistoryService.getHistory();
            expect(history.sessions.length).toBe(1);
            expect(history.sessions[0].reps).toBe(100);
        });

        it('should enrich workout with progression info', () => {
            ProgressionService.initializeDefaultProgressions();
            ProgressionService.setLevel('squats', 2);

            const workout = {
                date: new Date().toISOString(),
                duration: 1200,
                reps: 100,
                calories: 150,
                fitnessLevel: 'Intermediate',
                workoutType: 'squats',
                difficulty: 'advanced'
            };

            HistoryService.saveWorkout(workout);

            const history = HistoryService.getHistory();
            expect(history.sessions[0].progressionLevel).toBe(2);
            expect(history.sessions[0].variation).toBe('Jump Squat');
        });

        it('should not overwrite existing progression info', () => {
            const workout = {
                date: new Date().toISOString(),
                duration: 1200,
                reps: 100,
                calories: 150,
                fitnessLevel: 'Intermediate',
                workoutType: 'squats',
                difficulty: 'advanced',
                progressionLevel: 3,
                variation: 'Assisted Pistol'
            };

            HistoryService.saveWorkout(workout);

            const history = HistoryService.getHistory();
            expect(history.sessions[0].progressionLevel).toBe(3);
            expect(history.sessions[0].variation).toBe('Assisted Pistol');
        });

        it('should default to level 1 if no progression data', () => {
            // Clear progressions
            localStorage.clear();

            const workout = {
                date: new Date().toISOString(),
                duration: 1200,
                reps: 100,
                calories: 150,
                fitnessLevel: 'Intermediate',
                workoutType: 'squats',
                difficulty: 'advanced'
            };

            HistoryService.saveWorkout(workout);

            const history = HistoryService.getHistory();
            expect(history.sessions[0].progressionLevel).toBe(1);
            expect(history.sessions[0].variation).toBeNull();
        });

        it('should keep only last 50 workouts', () => {
            for (let i = 0; i < 55; i++) {
                HistoryService.saveWorkout({
                    date: new Date().toISOString(),
                    reps: i,
                    workoutType: 'squats'
                });
            }

            const history = HistoryService.getHistory();
            expect(history.sessions.length).toBe(50);
            // Most recent should be first (index 0), with reps = 54
            expect(history.sessions[0].reps).toBe(54);
        });
    });

    describe('getRecentFitnessLevels', () => {
        beforeEach(() => {
            // Add some workouts
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                fitnessLevel: 'Elite'
            });
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                fitnessLevel: 'Advanced'
            });
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                fitnessLevel: 'Intermediate'
            });
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'burpees',
                fitnessLevel: 'Elite'
            });
        });

        it('should return recent fitness levels for workout type', () => {
            const levels = HistoryService.getRecentFitnessLevels('squats', 2);
            expect(levels).toEqual(['Intermediate', 'Advanced']);
        });

        it('should filter by workout type', () => {
            const levels = HistoryService.getRecentFitnessLevels('burpees', 2);
            expect(levels).toEqual(['Elite']);
        });

        it('should return all if count exceeds available', () => {
            const levels = HistoryService.getRecentFitnessLevels('squats', 10);
            expect(levels.length).toBe(3);
        });

        it('should return empty array if no sessions', () => {
            const levels = HistoryService.getRecentFitnessLevels('pullups', 2);
            expect(levels).toEqual([]);
        });
    });

    describe('getSessionsByProgressionLevel', () => {
        beforeEach(() => {
            // Add workouts at different levels
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                progressionLevel: 1,
                reps: 100
            });
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                progressionLevel: 2,
                reps: 50
            });
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                progressionLevel: 1,
                reps: 110
            });
        });

        it('should filter by progression level', () => {
            const sessions = HistoryService.getSessionsByProgressionLevel('squats', 1);
            expect(sessions.length).toBe(2);
            expect(sessions.every(s => s.progressionLevel === 1)).toBe(true);
        });

        it('should return empty array for non-existent level', () => {
            const sessions = HistoryService.getSessionsByProgressionLevel('squats', 99);
            expect(sessions).toEqual([]);
        });
    });

    describe('getBestAtProgressionLevel', () => {
        beforeEach(() => {
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                progressionLevel: 1,
                reps: 100
            });
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                progressionLevel: 1,
                reps: 120
            });
            HistoryService.saveWorkout({
                date: new Date().toISOString(),
                workoutType: 'squats',
                progressionLevel: 1,
                reps: 90
            });
        });

        it('should return best session at level', () => {
            const best = HistoryService.getBestAtProgressionLevel('squats', 1);
            expect(best).not.toBeNull();
            expect(best.reps).toBe(120);
        });

        it('should return null if no sessions at level', () => {
            const best = HistoryService.getBestAtProgressionLevel('squats', 5);
            expect(best).toBeNull();
        });
    });

    describe('Graceful handling of missing data', () => {
        it('should handle sessions without progression fields', () => {
            // Simulate old session without progression data
            const history = { sessions: [
                { date: new Date().toISOString(), workoutType: 'squats', reps: 100, fitnessLevel: 'Intermediate' }
            ]};
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify({ version: 1, data: history }));

            const levels = HistoryService.getRecentFitnessLevels('squats', 2);
            expect(levels).toEqual(['Intermediate']);

            // Should not crash when filtering by progression level
            const sessions = HistoryService.getSessionsByProgressionLevel('squats', 1);
            expect(sessions).toEqual([]);
        });
    });
});
