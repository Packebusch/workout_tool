// calculations.js Tests
// ======================

import { describe, it, expect } from 'vitest';
import {
    calculateCalories,
    calculateFitnessLevel,
    calculatePace,
    calculateTrend,
    getNextDifficulty
} from '../../src/utils/calculations.js';
import { PROGRESSION_LADDERS, PROGRESSION_CALORIE_MULTIPLIERS } from '../../src/config/constants.js';

describe('calculateCalories', () => {
    it('should calculate base calories without progression multiplier', () => {
        // burpees: 10 cals/min + 1 cal/rep
        // 10 minutes, 100 reps = 100 + 100 = 200 calories
        const calories = calculateCalories('burpees', 100, 10);
        expect(calories).toBe(200);
    });

    it('should apply level 1 multiplier (1.0)', () => {
        const calories = calculateCalories('burpees', 100, 10, 1);
        expect(calories).toBe(200);
    });

    it('should apply level 2 multiplier (1.3)', () => {
        const calories = calculateCalories('burpees', 100, 10, 2);
        // 200 * 1.3 = 260
        expect(calories).toBe(260);
    });

    it('should apply level 3 multiplier (1.6)', () => {
        const calories = calculateCalories('burpees', 100, 10, 3);
        // 200 * 1.6 = 320
        expect(calories).toBe(320);
    });

    it('should apply level 4 multiplier (2.0)', () => {
        const calories = calculateCalories('burpees', 100, 10, 4);
        // 200 * 2.0 = 400
        expect(calories).toBe(400);
    });

    it('should apply level 5 multiplier (2.4)', () => {
        const calories = calculateCalories('burpees', 100, 10, 5);
        // 200 * 2.4 = 480
        expect(calories).toBe(480);
    });

    it('should cap multiplier at level 5', () => {
        const cals5 = calculateCalories('burpees', 100, 10, 5);
        const cals6 = calculateCalories('burpees', 100, 10, 6);
        // Level 6 should use level 5 multiplier
        expect(cals6).toBe(cals5);
    });

    it('should return 0 for unknown workout type', () => {
        expect(calculateCalories('unknown', 100, 10)).toBe(0);
    });

    it('should calculate correctly for different workout types', () => {
        // squats: 8 cals/min + 0.6 cal/rep
        // 10 minutes, 100 reps = 80 + 60 = 140 calories
        const squatCals = calculateCalories('squats', 100, 10, 1);
        expect(squatCals).toBe(140);

        // rows: 6 cals/min + 0.7 cal/rep
        // 10 minutes, 100 reps = 60 + 70 = 130 calories
        const rowCals = calculateCalories('rows', 100, 10, 1);
        expect(rowCals).toBe(130);
    });

    it('should maintain backward compatibility (no progression level)', () => {
        const withLevel = calculateCalories('burpees', 100, 10, 1);
        const withoutLevel = calculateCalories('burpees', 100, 10);
        expect(withLevel).toBe(withoutLevel);
    });
});

describe('calculateFitnessLevel', () => {
    describe('Generic thresholds (no workout type)', () => {
        it('should return Elite for 10+ reps per minute', () => {
            // 100 reps in 600 seconds (10 min) = 10 reps/min
            expect(calculateFitnessLevel(100, 600)).toBe('Elite');
            expect(calculateFitnessLevel(120, 600)).toBe('Elite');
        });

        it('should return Advanced for 7-9.99 reps per minute', () => {
            // 70 reps in 600 seconds = 7 reps/min
            expect(calculateFitnessLevel(70, 600)).toBe('Advanced');
            expect(calculateFitnessLevel(90, 600)).toBe('Advanced');
        });

        it('should return Intermediate for 4-6.99 reps per minute', () => {
            // 40 reps in 600 seconds = 4 reps/min
            expect(calculateFitnessLevel(40, 600)).toBe('Intermediate');
            expect(calculateFitnessLevel(60, 600)).toBe('Intermediate');
        });

        it('should return Beginner for under 4 reps per minute', () => {
            expect(calculateFitnessLevel(30, 600)).toBe('Beginner');
            expect(calculateFitnessLevel(10, 600)).toBe('Beginner');
        });
    });

    describe('Progression-specific thresholds', () => {
        it('should use squats level 1 thresholds', () => {
            // Squats level 1: elite=10, advanced=7, intermediate=4
            expect(calculateFitnessLevel(100, 600, 'squats', 1)).toBe('Elite');
            expect(calculateFitnessLevel(70, 600, 'squats', 1)).toBe('Advanced');
            expect(calculateFitnessLevel(40, 600, 'squats', 1)).toBe('Intermediate');
            expect(calculateFitnessLevel(20, 600, 'squats', 1)).toBe('Beginner');
        });

        it('should use squats level 2 thresholds', () => {
            // Squats level 2 (Jump Squat): elite=8, advanced=5.5, intermediate=3
            // 80 reps in 600 seconds = 8 reps/min
            expect(calculateFitnessLevel(80, 600, 'squats', 2)).toBe('Elite');
            // 55 reps = 5.5 reps/min
            expect(calculateFitnessLevel(55, 600, 'squats', 2)).toBe('Advanced');
            // 30 reps = 3 reps/min
            expect(calculateFitnessLevel(30, 600, 'squats', 2)).toBe('Intermediate');
            // 15 reps = 1.5 reps/min
            expect(calculateFitnessLevel(15, 600, 'squats', 2)).toBe('Beginner');
        });

        it('should use pullups level 1 thresholds (very low)', () => {
            // Pullups level 1 (Dead Hang): elite=0.5, advanced=0.33, intermediate=0.17
            // 600 seconds = 10 minutes
            // 5 reps / 10 min = 0.5 reps/min >= 0.5 (elite)
            expect(calculateFitnessLevel(5, 600, 'pullups', 1)).toBe('Elite');
            // 4 reps / 10 min = 0.4 reps/min >= 0.33 (advanced)
            expect(calculateFitnessLevel(4, 600, 'pullups', 1)).toBe('Advanced');
            // 2 reps / 10 min = 0.2 reps/min >= 0.17 (intermediate)
            expect(calculateFitnessLevel(2, 600, 'pullups', 1)).toBe('Intermediate');
            // 1 rep / 10 min = 0.1 reps/min < 0.17 (beginner)
            expect(calculateFitnessLevel(1, 600, 'pullups', 1)).toBe('Beginner');
        });

        it('should use jumping-jacks level 1 thresholds (high)', () => {
            // Jumping jacks level 1: elite=45, advanced=35, intermediate=25
            expect(calculateFitnessLevel(450, 600, 'jumping-jacks', 1)).toBe('Elite');
            expect(calculateFitnessLevel(350, 600, 'jumping-jacks', 1)).toBe('Advanced');
            expect(calculateFitnessLevel(250, 600, 'jumping-jacks', 1)).toBe('Intermediate');
            expect(calculateFitnessLevel(100, 600, 'jumping-jacks', 1)).toBe('Beginner');
        });

        it('should use different thresholds for different exercises', () => {
            // Same reps/min rate, different exercises
            // 70 reps in 600 seconds = 7 reps/min
            // Squats level 1: advanced=7, so 7 is exactly Advanced
            expect(calculateFitnessLevel(70, 600, 'squats', 1)).toBe('Advanced');
            // Pullups level 4: elite=6, so 7 reps/min is Elite
            expect(calculateFitnessLevel(70, 600, 'pullups', 4)).toBe('Elite');
        });
    });

    describe('Fallback behavior', () => {
        it('should fallback to generic thresholds for unknown workout type', () => {
            // 100 reps in 600 seconds = 10 reps/min (Elite with generic thresholds)
            expect(calculateFitnessLevel(100, 600, 'unknown', 1)).toBe('Elite');
            // 70 reps in 600 seconds = 7 reps/min (Advanced with generic thresholds)
            expect(calculateFitnessLevel(70, 600, 'unknown', 1)).toBe('Advanced');
        });

        it('should fallback to generic thresholds for invalid level', () => {
            // Level 99 doesn't exist, should use generic
            expect(calculateFitnessLevel(100, 600, 'squats', 99)).toBe('Elite');
        });

        it('should maintain backward compatibility (no workout type)', () => {
            const withType = calculateFitnessLevel(100, 600, null, 1);
            const withoutType = calculateFitnessLevel(100, 600);
            expect(withType).toBe(withoutType);
        });
    });
});

describe('calculatePace', () => {
    it('should calculate reps per minute', () => {
        expect(calculatePace(60, 10)).toBe(6);
        expect(calculatePace(100, 20)).toBe(5);
    });

    it('should return 0 for zero minutes', () => {
        expect(calculatePace(100, 0)).toBe(0);
    });
});

describe('calculateTrend', () => {
    it('should return neutral for less than 3 sessions', () => {
        expect(calculateTrend([{ reps: 100, duration: 600 }, { reps: 110, duration: 600 }])).toBe('neutral');
        expect(calculateTrend([])).toBe('neutral');
    });

    it('should return improving for increasing reps per minute', () => {
        // Sessions ordered newest first
        // Recent: 13 reps/min, 12 reps/min -> avg 12.5
        // Overall avg: (13+12+11+10)/4 = 11.5
        // 12.5 > 11.5 * 1.05 (12.075) -> improving
        const sessions = [
            { reps: 130, duration: 600 },  // 13 reps/min
            { reps: 120, duration: 600 },  // 12 reps/min
            { reps: 110, duration: 600 },  // 11 reps/min
            { reps: 100, duration: 600 }   // 10 reps/min
        ];
        expect(calculateTrend(sessions)).toBe('improving');
    });

    it('should return declining for decreasing reps per minute', () => {
        // Recent: 8 reps/min, 9 reps/min -> avg 8.5
        // Overall avg: (8+9+10+11)/4 = 9.5
        // 8.5 < 9.5 * 0.95 (9.025) -> declining
        const sessions = [
            { reps: 80, duration: 600 },   // 8 reps/min
            { reps: 90, duration: 600 },   // 9 reps/min
            { reps: 100, duration: 600 },  // 10 reps/min
            { reps: 110, duration: 600 }   // 11 reps/min
        ];
        expect(calculateTrend(sessions)).toBe('declining');
    });

    it('should return plateau for stable reps per minute', () => {
        const sessions = [
            { reps: 100, duration: 600 },  // 10 reps/min
            { reps: 101, duration: 600 },  // 10.1 reps/min
            { reps: 99, duration: 600 },   // 9.9 reps/min
            { reps: 100, duration: 600 }   // 10 reps/min
        ];
        expect(calculateTrend(sessions)).toBe('plateau');
    });

    it('should normalize by duration for fair comparison', () => {
        // This tests the fix: different durations but improving rate
        // Jan 17: 150 reps, 900 sec (15 min) = 10 reps/min
        // Jan 12: 70 reps, 600 sec (10 min) = 7 reps/min
        // Jan 4: 188 reps, 1200 sec (20 min) = 9.4 reps/min
        // Recent avg: (10+7)/2 = 8.5, Overall avg: (10+7+9.4)/3 = 8.8
        // This is close to plateau, but let's test a clearer case:

        // Shorter workout, better rate = improving
        const sessions = [
            { reps: 100, duration: 600 },   // 10 reps/min (recent, shorter but faster)
            { reps: 90, duration: 600 },    // 9 reps/min
            { reps: 200, duration: 1200 },  // 10 reps/min (longer workout, same rate)
            { reps: 150, duration: 1200 }   // 7.5 reps/min (oldest, poor rate despite more reps)
        ];
        // Recent: (10+9)/2 = 9.5, Overall: (10+9+10+7.5)/4 = 9.125
        // 9.5 > 9.125 * 1.05 = 9.58 -> not quite improving
        // Let me make a clearer case:

        const clearerSessions = [
            { reps: 120, duration: 600 },   // 12 reps/min
            { reps: 110, duration: 600 },   // 11 reps/min
            { reps: 180, duration: 1200 },  // 9 reps/min (more total reps but worse rate)
            { reps: 160, duration: 1200 }   // 8 reps/min
        ];
        // Recent: (12+11)/2 = 11.5, Overall: (12+11+9+8)/4 = 10
        // 11.5 > 10 * 1.05 (10.5) -> improving
        expect(calculateTrend(clearerSessions)).toBe('improving');
    });

    it('should handle zero duration gracefully', () => {
        const sessions = [
            { reps: 100, duration: 600 },
            { reps: 100, duration: 600 },
            { reps: 100, duration: 0 }  // Edge case: zero duration
        ];
        // Should not throw, zero duration gives 0 reps/min
        expect(() => calculateTrend(sessions)).not.toThrow();
    });
});

describe('getNextDifficulty', () => {
    it('should return next difficulty level', () => {
        expect(getNextDifficulty('beginner')).toBe('intermediate');
        expect(getNextDifficulty('intermediate')).toBe('advanced');
        expect(getNextDifficulty('advanced')).toBe('elite');
    });

    it('should return null for elite', () => {
        expect(getNextDifficulty('elite')).toBeNull();
    });
});
