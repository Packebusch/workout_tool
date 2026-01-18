// ProgressionService Tests
// =========================

import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressionService } from '../../src/services/ProgressionService.js';
import { PROGRESSION_LADDERS, PROGRESSION_CONFIG, STORAGE_KEYS } from '../../src/config/constants.js';

describe('ProgressionService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('Data Access', () => {
        it('should return empty object when no progressions exist', () => {
            const progressions = ProgressionService.getProgressions();
            expect(progressions).toEqual({});
        });

        it('should save and retrieve progressions', () => {
            const testData = {
                squats: { currentLevel: 2, variation: 'Bulgarian Split Squat' }
            };
            ProgressionService.saveProgressions(testData);
            const loaded = ProgressionService.getProgressions();
            expect(loaded.squats.currentLevel).toBe(2);
        });

        it('should return null for non-existent exercise progression', () => {
            const progression = ProgressionService.getExerciseProgression('squats');
            expect(progression).toBeNull();
        });

        it('should get exercise progression after initialization', () => {
            ProgressionService.initializeDefaultProgressions();
            const progression = ProgressionService.getExerciseProgression('squats');
            expect(progression).not.toBeNull();
            expect(progression.currentLevel).toBe(1);
        });
    });

    describe('getCurrentLevel', () => {
        it('should return 1 for uninitialized exercise', () => {
            expect(ProgressionService.getCurrentLevel('squats')).toBe(1);
        });

        it('should return correct level after setting', () => {
            ProgressionService.setLevel('squats', 3);
            expect(ProgressionService.getCurrentLevel('squats')).toBe(3);
        });
    });

    describe('getCurrentVariation', () => {
        it('should return first variation for uninitialized exercise', () => {
            const variation = ProgressionService.getCurrentVariation('squats');
            expect(variation).toBe('Air Squat');
        });

        it('should return correct variation after level change', () => {
            ProgressionService.setLevel('squats', 2);
            expect(ProgressionService.getCurrentVariation('squats')).toBe('Jump Squat');
        });

        it('should return null for unknown exercise', () => {
            expect(ProgressionService.getCurrentVariation('unknown')).toBeNull();
        });
    });

    describe('getLevelConfig', () => {
        it('should return level configuration', () => {
            const config = ProgressionService.getLevelConfig('squats', 1);
            expect(config).not.toBeNull();
            expect(config.variation).toBe('Air Squat');
            expect(config.elite).toBe(10);
            expect(config.advanced).toBe(7);
        });

        it('should return null for invalid level', () => {
            expect(ProgressionService.getLevelConfig('squats', 99)).toBeNull();
        });

        it('should return null for unknown exercise', () => {
            expect(ProgressionService.getLevelConfig('unknown', 1)).toBeNull();
        });
    });

    describe('getMaxLevel', () => {
        it('should return max level for squats', () => {
            expect(ProgressionService.getMaxLevel('squats')).toBe(5);
        });

        it('should return max level for rows', () => {
            expect(ProgressionService.getMaxLevel('rows')).toBe(5);
        });

        it('should return 1 for unknown exercise', () => {
            expect(ProgressionService.getMaxLevel('unknown')).toBe(1);
        });
    });

    describe('recordSession', () => {
        it('should initialize progression if not exists', () => {
            ProgressionService.recordSession('squats', 'Intermediate');
            const progression = ProgressionService.getExerciseProgression('squats');
            expect(progression).not.toBeNull();
            expect(progression.sessionsAtLevel).toBe(1);
        });

        it('should increment session count', () => {
            ProgressionService.initializeDefaultProgressions();
            ProgressionService.recordSession('squats', 'Intermediate');
            ProgressionService.recordSession('squats', 'Advanced');
            const progression = ProgressionService.getExerciseProgression('squats');
            expect(progression.sessionsAtLevel).toBe(2);
        });

        it('should track Elite performances', () => {
            ProgressionService.initializeDefaultProgressions();
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Advanced');
            const progression = ProgressionService.getExerciseProgression('squats');
            expect(progression.eliteCountAtLevel).toBe(2);
        });

        it('should track recent fitness levels', () => {
            ProgressionService.initializeDefaultProgressions();
            ProgressionService.recordSession('squats', 'Beginner');
            ProgressionService.recordSession('squats', 'Intermediate');
            ProgressionService.recordSession('squats', 'Elite');
            const progression = ProgressionService.getExerciseProgression('squats');
            expect(progression.recentFitnessLevels).toEqual(['Elite', 'Intermediate', 'Beginner']);
        });

        it('should limit recent fitness levels to 5', () => {
            ProgressionService.initializeDefaultProgressions();
            for (let i = 0; i < 7; i++) {
                ProgressionService.recordSession('squats', 'Intermediate');
            }
            const progression = ProgressionService.getExerciseProgression('squats');
            expect(progression.recentFitnessLevels.length).toBe(5);
        });
    });

    describe('checkProgressionEligibility', () => {
        beforeEach(() => {
            ProgressionService.initializeDefaultProgressions();
        });

        it('should return not eligible if no data', () => {
            localStorage.clear();
            const result = ProgressionService.checkProgressionEligibility('squats', 0, 'improving');
            expect(result.eligible).toBe(false);
        });

        it('should return not eligible if not enough sessions', () => {
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            const result = ProgressionService.checkProgressionEligibility('squats', 0, 'improving');
            expect(result.eligible).toBe(false);
            expect(result.reason).toContain('more sessions');
        });

        it('should return not eligible if not enough Elite performances', () => {
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Advanced');
            ProgressionService.recordSession('squats', 'Advanced');
            const result = ProgressionService.checkProgressionEligibility('squats', 0, 'improving');
            expect(result.eligible).toBe(false);
            expect(result.reason).toContain('Elite');
        });

        it('should return not eligible if soreness too high', () => {
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            const result = ProgressionService.checkProgressionEligibility('squats', 4, 'improving');
            expect(result.eligible).toBe(false);
            expect(result.reason).toContain('Soreness');
        });

        it('should return not eligible if trend is declining', () => {
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            const result = ProgressionService.checkProgressionEligibility('squats', 0, 'declining');
            expect(result.eligible).toBe(false);
            expect(result.reason).toContain('declining');
        });

        it('should return eligible when all conditions met', () => {
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Advanced');
            const result = ProgressionService.checkProgressionEligibility('squats', 1, 'improving');
            expect(result.eligible).toBe(true);
        });

        it('should return not eligible if already at max level', () => {
            ProgressionService.setLevel('squats', 5);
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            const result = ProgressionService.checkProgressionEligibility('squats', 0, 'improving');
            expect(result.eligible).toBe(false);
            expect(result.reason).toContain('maximum');
        });
    });

    describe('checkRegressionNeeded', () => {
        beforeEach(() => {
            ProgressionService.initializeDefaultProgressions();
        });

        it('should return not needed at level 1', () => {
            const result = ProgressionService.checkRegressionNeeded('squats', ['Beginner', 'Beginner'], 0);
            expect(result.needed).toBe(false);
        });

        it('should return needed for consecutive Beginner performances', () => {
            ProgressionService.setLevel('squats', 2);
            const result = ProgressionService.checkRegressionNeeded('squats', ['Beginner', 'Beginner'], 0);
            expect(result.needed).toBe(true);
            expect(result.reason).toContain('Beginner');
        });

        it('should return not needed for mixed performances', () => {
            ProgressionService.setLevel('squats', 2);
            const result = ProgressionService.checkRegressionNeeded('squats', ['Beginner', 'Intermediate'], 0);
            expect(result.needed).toBe(false);
        });

        it('should return needed for high soreness', () => {
            ProgressionService.setLevel('squats', 2);
            const result = ProgressionService.checkRegressionNeeded('squats', ['Intermediate'], 4);
            expect(result.needed).toBe(true);
            expect(result.reason).toContain('soreness');
        });

        it('should return not needed for moderate soreness', () => {
            ProgressionService.setLevel('squats', 2);
            const result = ProgressionService.checkRegressionNeeded('squats', ['Intermediate'], 3);
            expect(result.needed).toBe(false);
        });
    });

    describe('progressToNextLevel', () => {
        beforeEach(() => {
            ProgressionService.initializeDefaultProgressions();
        });

        it('should progress to next level', () => {
            const result = ProgressionService.progressToNextLevel('squats');
            expect(result).not.toBeNull();
            expect(result.currentLevel).toBe(2);
            expect(result.variation).toBe('Jump Squat');
        });

        it('should reset counters on progression', () => {
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            const result = ProgressionService.progressToNextLevel('squats');
            expect(result.sessionsAtLevel).toBe(0);
            expect(result.eliteCountAtLevel).toBe(0);
        });

        it('should not progress past max level', () => {
            ProgressionService.setLevel('squats', 5);
            const result = ProgressionService.progressToNextLevel('squats');
            expect(result).toBeNull();
        });

        it('should return null for uninitialized exercise', () => {
            localStorage.clear();
            const result = ProgressionService.progressToNextLevel('squats');
            expect(result).toBeNull();
        });
    });

    describe('regressToPreviousLevel', () => {
        beforeEach(() => {
            ProgressionService.initializeDefaultProgressions();
        });

        it('should regress to previous level', () => {
            ProgressionService.setLevel('squats', 3);
            const result = ProgressionService.regressToPreviousLevel('squats');
            expect(result).not.toBeNull();
            expect(result.currentLevel).toBe(2);
            expect(result.variation).toBe('Jump Squat');
        });

        it('should reset counters on regression', () => {
            ProgressionService.setLevel('squats', 2);
            ProgressionService.recordSession('squats', 'Beginner');
            const result = ProgressionService.regressToPreviousLevel('squats');
            expect(result.sessionsAtLevel).toBe(0);
            expect(result.recentFitnessLevels).toEqual([]);
        });

        it('should not regress below level 1', () => {
            const result = ProgressionService.regressToPreviousLevel('squats');
            expect(result).toBeNull();
        });
    });

    describe('setLevel', () => {
        it('should set specific level', () => {
            const result = ProgressionService.setLevel('squats', 3);
            expect(result).not.toBeNull();
            expect(result.currentLevel).toBe(3);
            expect(result.variation).toBe('Bulgarian Split Squat');
        });

        it('should initialize counters to zero', () => {
            const result = ProgressionService.setLevel('squats', 2);
            expect(result.sessionsAtLevel).toBe(0);
            expect(result.eliteCountAtLevel).toBe(0);
        });

        it('should return null for invalid level', () => {
            const result = ProgressionService.setLevel('squats', 99);
            expect(result).toBeNull();
        });

        it('should return null for unknown exercise', () => {
            const result = ProgressionService.setLevel('unknown', 1);
            expect(result).toBeNull();
        });
    });

    describe('initializeDefaultProgressions', () => {
        it('should initialize all exercises', () => {
            ProgressionService.initializeDefaultProgressions();
            const progressions = ProgressionService.getProgressions();

            for (const exerciseType of Object.keys(PROGRESSION_LADDERS)) {
                expect(progressions[exerciseType]).toBeDefined();
                expect(progressions[exerciseType].currentLevel).toBe(1);
            }
        });

        it('should not overwrite existing progressions', () => {
            ProgressionService.setLevel('squats', 3);
            ProgressionService.initializeDefaultProgressions();
            expect(ProgressionService.getCurrentLevel('squats')).toBe(3);
        });

        it('should only initialize missing exercises', () => {
            ProgressionService.setLevel('squats', 2);
            ProgressionService.initializeDefaultProgressions();

            expect(ProgressionService.getCurrentLevel('squats')).toBe(2);
            expect(ProgressionService.getCurrentLevel('burpees')).toBe(1);
        });
    });

    describe('getMessage', () => {
        it('should return a message', () => {
            const message = ProgressionService.getMessage('readyToProgress');
            expect(message).not.toBe('');
            expect(typeof message).toBe('string');
        });

        it('should replace placeholders', () => {
            const message = ProgressionService.getMessage('levelUp', { variation: 'Test Variation' });
            expect(message).toContain('Test Variation');
        });

        it('should return empty string for unknown message type', () => {
            const message = ProgressionService.getMessage('unknownType');
            expect(message).toBe('');
        });
    });

    describe('getProgressionSummary', () => {
        it('should return summary for exercise', () => {
            ProgressionService.initializeDefaultProgressions();
            ProgressionService.recordSession('squats', 'Elite');

            const summary = ProgressionService.getProgressionSummary('squats');

            expect(summary).not.toBeNull();
            expect(summary.exerciseType).toBe('squats');
            expect(summary.exerciseName).toBe('Squats');
            expect(summary.currentLevel).toBe(1);
            expect(summary.maxLevel).toBe(5);
            expect(summary.variation).toBe('Air Squat');
            expect(summary.sessionsAtLevel).toBe(1);
            expect(summary.eliteCountAtLevel).toBe(1);
        });

        it('should calculate progress to next', () => {
            ProgressionService.initializeDefaultProgressions();
            ProgressionService.recordSession('squats', 'Elite');

            const summary = ProgressionService.getProgressionSummary('squats');

            expect(summary.progressToNext.sessionsNeeded).toBe(2);
            expect(summary.progressToNext.eliteNeeded).toBe(1);
        });

        it('should return null for unknown exercise', () => {
            const summary = ProgressionService.getProgressionSummary('unknown');
            expect(summary).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle all workout types in PROGRESSION_LADDERS', () => {
            const exerciseTypes = Object.keys(PROGRESSION_LADDERS);
            expect(exerciseTypes.length).toBeGreaterThan(0);

            for (const type of exerciseTypes) {
                ProgressionService.initializeDefaultProgressions();
                const summary = ProgressionService.getProgressionSummary(type);
                expect(summary).not.toBeNull();
                expect(summary.currentLevel).toBeGreaterThan(0);
            }
        });

        it('should handle progression through all levels', () => {
            ProgressionService.initializeDefaultProgressions();
            const maxLevel = ProgressionService.getMaxLevel('squats');

            for (let i = 1; i < maxLevel; i++) {
                const result = ProgressionService.progressToNextLevel('squats');
                expect(result).not.toBeNull();
                expect(result.currentLevel).toBe(i + 1);
            }

            // Should not go past max
            const finalResult = ProgressionService.progressToNextLevel('squats');
            expect(finalResult).toBeNull();
        });
    });
});
