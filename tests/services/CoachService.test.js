// CoachService Progression Tests
// ===============================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoachService } from '../../src/services/CoachService.js';
import { ProgressionService } from '../../src/services/ProgressionService.js';
import { SorenessService } from '../../src/services/SorenessService.js';
import { HistoryService } from '../../src/services/HistoryService.js';
import { PROGRESSION_LADDERS, STORAGE_KEYS } from '../../src/config/constants.js';

describe('CoachService - Progression Methods', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('assessProgressionSuggestion', () => {
        beforeEach(() => {
            ProgressionService.initializeDefaultProgressions();
        });

        it('should return null when no progression data', () => {
            localStorage.clear();
            const result = CoachService.assessProgressionSuggestion('squats', {}, { sessions: [] });
            expect(result).toBeNull();
        });

        it('should return null when conditions not met', () => {
            // Only 1 session, need 3 for progression
            ProgressionService.recordSession('squats', 'Elite');

            const result = CoachService.assessProgressionSuggestion('squats', {}, { sessions: [] });
            expect(result).toBeNull();
        });

        it('should return progress suggestion when all conditions met', () => {
            // Record 3 sessions with 2 Elite
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Advanced');

            // Mock soreness to be low
            vi.spyOn(SorenessService, 'getCurrentSorenessLevel').mockReturnValue(1);

            // Create history with improving trend
            const history = {
                sessions: [
                    { reps: 100 },
                    { reps: 95 },
                    { reps: 90 },
                    { reps: 85 },
                    { reps: 80 }
                ]
            };

            const result = CoachService.assessProgressionSuggestion('squats', {}, history);

            expect(result).not.toBeNull();
            expect(result.type).toBe('progress');
            expect(result.exerciseType).toBe('squats');
            expect(result.currentLevel).toBe(1);
            expect(result.nextLevel).toBe(2);
            expect(result.nextVariation).toBe('Jump Squat');
            expect(result.message).toBeTruthy();

            vi.restoreAllMocks();
        });

        it('should return regress suggestion when consecutive Beginner performances', () => {
            // Set to level 2
            ProgressionService.setLevel('squats', 2);

            // Record 2 Beginner performances
            ProgressionService.recordSession('squats', 'Beginner');
            ProgressionService.recordSession('squats', 'Beginner');

            // Mock soreness to be moderate (won't trigger soreness regression)
            vi.spyOn(SorenessService, 'getCurrentSorenessLevel').mockReturnValue(2);

            const result = CoachService.assessProgressionSuggestion('squats', {}, { sessions: [] });

            expect(result).not.toBeNull();
            expect(result.type).toBe('regress');
            expect(result.currentLevel).toBe(2);
            expect(result.previousLevel).toBe(1);
            expect(result.previousVariation).toBe('Air Squat');
            expect(result.reason).toContain('Beginner');

            vi.restoreAllMocks();
        });

        it('should return regress suggestion for high soreness', () => {
            // Set to level 2
            ProgressionService.setLevel('squats', 2);
            ProgressionService.recordSession('squats', 'Intermediate');

            // Mock high soreness
            vi.spyOn(SorenessService, 'getCurrentSorenessLevel').mockReturnValue(4);

            const result = CoachService.assessProgressionSuggestion('squats', {}, { sessions: [] });

            expect(result).not.toBeNull();
            expect(result.type).toBe('regress');
            expect(result.reason).toContain('soreness');

            vi.restoreAllMocks();
        });

        it('should not suggest regression at level 1', () => {
            ProgressionService.recordSession('squats', 'Beginner');
            ProgressionService.recordSession('squats', 'Beginner');

            vi.spyOn(SorenessService, 'getCurrentSorenessLevel').mockReturnValue(4);

            const result = CoachService.assessProgressionSuggestion('squats', {}, { sessions: [] });

            // Should not suggest regress because already at level 1
            expect(result).toBeNull();

            vi.restoreAllMocks();
        });

        it('should not suggest progress at max level', () => {
            const maxLevel = ProgressionService.getMaxLevel('squats');
            ProgressionService.setLevel('squats', maxLevel);

            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');
            ProgressionService.recordSession('squats', 'Elite');

            vi.spyOn(SorenessService, 'getCurrentSorenessLevel').mockReturnValue(0);

            const history = {
                sessions: [
                    { reps: 100 },
                    { reps: 95 },
                    { reps: 90 },
                    { reps: 85 },
                    { reps: 80 }
                ]
            };

            const result = CoachService.assessProgressionSuggestion('squats', {}, history);
            expect(result).toBeNull();

            vi.restoreAllMocks();
        });
    });

    describe('getProgressionContextMessage', () => {
        beforeEach(() => {
            ProgressionService.initializeDefaultProgressions();
        });

        it('should return first session message for session 1', () => {
            const message = CoachService.getProgressionContextMessage('squats', 1);
            expect(message).toBeTruthy();
            expect(typeof message).toBe('string');
        });

        it('should mention sessions or elite needed when not first session', () => {
            ProgressionService.recordSession('squats', 'Advanced');
            const message = CoachService.getProgressionContextMessage('squats', 2);
            expect(message).toBeTruthy();
            // Should mention sessions or elite needed
            expect(message.includes('session') || message.includes('Elite') || message.includes('Keep pushing')).toBe(true);
        });

        it('should mention elite needed when sessions are done', () => {
            ProgressionService.recordSession('squats', 'Advanced');
            ProgressionService.recordSession('squats', 'Advanced');
            ProgressionService.recordSession('squats', 'Advanced');

            const message = CoachService.getProgressionContextMessage('squats', 4);
            expect(message).toContain('Elite');
        });
    });

    describe('getProgressionStatus', () => {
        beforeEach(() => {
            ProgressionService.initializeDefaultProgressions();
        });

        it('should return null for unknown exercise', () => {
            const status = CoachService.getProgressionStatus('unknown');
            expect(status).toBeNull();
        });

        it('should return complete status object', () => {
            vi.spyOn(SorenessService, 'getCurrentSorenessLevel').mockReturnValue(1);

            const status = CoachService.getProgressionStatus('squats');

            expect(status).not.toBeNull();
            expect(status.exerciseType).toBe('squats');
            expect(status.currentLevel).toBe(1);
            expect(status.maxLevel).toBe(5);
            expect(status.variation).toBe('Air Squat');
            expect(typeof status.readyToProgress).toBe('boolean');
            expect(status.currentSoreness).toBe(1);
            expect(status.performanceTrend).toBeDefined();

            vi.restoreAllMocks();
        });

        it('should include blocked reason when not ready', () => {
            vi.spyOn(SorenessService, 'getCurrentSorenessLevel').mockReturnValue(1);

            const status = CoachService.getProgressionStatus('squats');

            expect(status.readyToProgress).toBe(false);
            expect(status.progressBlockedReason).toBeTruthy();

            vi.restoreAllMocks();
        });
    });

    describe('getPerformanceTrend', () => {
        it('should return insufficient_data for less than 5 sessions', () => {
            const history = {
                sessions: [
                    { reps: 100 },
                    { reps: 90 }
                ]
            };

            const result = CoachService.getPerformanceTrend(history);
            expect(result.trend).toBe('insufficient_data');
        });

        it('should return improving for increasing trend', () => {
            // Need >5% improvement from avg to recent avg
            const history = {
                sessions: [
                    { reps: 130 },
                    { reps: 125 },
                    { reps: 120 },
                    { reps: 100 },
                    { reps: 95 }
                ]
            };

            const result = CoachService.getPerformanceTrend(history);
            expect(result.trend).toBe('improving');
        });

        it('should return declining for decreasing trend', () => {
            const history = {
                sessions: [
                    { reps: 80 },
                    { reps: 85 },
                    { reps: 90 },
                    { reps: 95 },
                    { reps: 100 }
                ]
            };

            const result = CoachService.getPerformanceTrend(history);
            expect(result.trend).toBe('declining');
        });
    });
});
