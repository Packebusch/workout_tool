// Coach Service - Intelligent coaching recommendations and motivational guidance
// ===============================================================================

import { GoalService } from './GoalService.js';
import { SorenessService } from './SorenessService.js';
import { StreakService } from './StreakService.js';
import { HistoryService } from './HistoryService.js';
import {
    TARGET_REPS,
    DIFFICULTY_LEVELS,
    WORKOUT_MUSCLE_IMPACT,
    COACH_MESSAGES,
    RECOVERY_THRESHOLDS,
    WORKOUT_CONFIGS
} from '../config/constants.js';
import { addWeeks, calculateWorkoutFrequency, average, lastN, roundToInt, randomItem } from '../utils/utils.js';
import { calculateTrend } from '../utils/calculations.js';

export class CoachService {
    /**
     * MAIN GOAL SUGGESTION - Smart goal generation with progressive overload
     */
    static assessAndSuggestGoal(workoutType, difficulty, history, sorenessService) {
        // Check if user has history for this workout type + difficulty
        const relevantWorkouts = history.sessions.filter(
            w => w.workoutType === workoutType && w.difficulty === difficulty
        );

        // INITIAL ASSESSMENT - No history, conservative starting goal
        if (relevantWorkouts.length === 0) {
            return this.calculateInitialGoal(workoutType, difficulty);
        }

        // Check if user is ready for new goal
        if (!this.shouldSuggestNewGoal(workoutType, difficulty, history)) {
            return null;
        }

        // Has history - calculate progressive goal
        const bestPerformance = Math.max(...relevantWorkouts.map(w => w.reps));
        const avgPerformance = average(relevantWorkouts.map(w => w.reps));
        const recentWorkouts = lastN(relevantWorkouts, 3);
        const recentPerformance = average(recentWorkouts.map(w => w.reps));

        // Apply progressive overload (5-10% improvement)
        let improvement = 0.075; // 7.5% default

        // Adjust based on trend
        if (recentPerformance > avgPerformance * 1.1) {
            improvement = 0.10; // User is improving fast, push harder
        } else if (recentPerformance < avgPerformance * 0.9) {
            improvement = 0.05; // User declining, be conservative
        }

        // Adjust based on soreness
        const currentSoreness = SorenessService.getCurrentSorenessLevel();
        if (currentSoreness >= 3) {
            improvement *= 0.7; // Reduce target if sore (5.25% instead of 7.5%)
        }

        const targetReps = roundToInt(bestPerformance * (1 + improvement));
        const targetDuration = DIFFICULTY_LEVELS[difficulty].duration;

        // Calculate deadline (2-3 weeks depending on frequency)
        const avgWorkoutsPerWeek = calculateWorkoutFrequency(history, 4);
        const weeksToGoal = avgWorkoutsPerWeek >= 3 ? 2 : 3;
        const deadline = addWeeks(new Date(), weeksToGoal);

        const improvementPercent = Math.round(improvement * 100);

        return {
            workoutType,
            difficulty,
            targetReps,
            targetDuration,
            deadline,
            reasoning: `You hit ${bestPerformance} reps last time. Let's aim for ${targetReps} - that's ${improvementPercent}% improvement!`,
            confidence: this.#calculateConfidence(relevantWorkouts.length, recentPerformance, avgPerformance)
        };
    }

    /**
     * Calculate initial goal for first-time workout
     */
    static calculateInitialGoal(workoutType, difficulty) {
        // Use 60% of TARGET_REPS for conservative starting goal
        const baseTarget = TARGET_REPS[difficulty][workoutType];
        const targetReps = roundToInt(baseTarget * 0.6);
        const targetDuration = DIFFICULTY_LEVELS[difficulty].duration;
        const deadline = addWeeks(new Date(), 3);

        return {
            workoutType,
            difficulty,
            targetReps,
            targetDuration,
            deadline,
            reasoning: `Let's start with ${targetReps} reps as your first goal. We'll adjust based on how you do!`,
            confidence: 'initial_assessment'
        };
    }

    /**
     * Determine if user is ready for a new goal
     */
    static shouldSuggestNewGoal(workoutType, difficulty, history) {
        // Check if user already has active goal for this workout
        const activeGoals = GoalService.getGoalsForWorkout(workoutType, difficulty);

        if (activeGoals.length > 0) {
            const mostRecentGoal = activeGoals[0];
            // Don't suggest new goal if current goal < 50% complete
            if (mostRecentGoal.bestAttempt.percentageAchieved < 50) {
                return false;
            }
        }

        // Check if user has done this workout enough times to suggest new goal
        const relevantWorkouts = history.sessions.filter(
            w => w.workoutType === workoutType && w.difficulty === difficulty
        );

        if (relevantWorkouts.length < 2) {
            return false; // Need at least 2 workouts for pattern
        }

        return true;
    }

    /**
     * Calculate confidence level for goal suggestion
     */
    static #calculateConfidence(workoutCount, recentPerf, avgPerf) {
        if (workoutCount >= 5 && Math.abs(recentPerf - avgPerf) < avgPerf * 0.1) {
            return 'high';
        } else if (workoutCount >= 3) {
            return 'medium';
        }
        return 'low';
    }

    /**
     * Get comprehensive workout recommendation
     */
    static getWorkoutRecommendation(history) {
        const streak = StreakService.getCurrentStreak();
        const currentSoreness = SorenessService.getCurrentSorenessLevel();
        const affectedMuscles = SorenessService.getAffectedMuscleGroups();

        // 1. Check if should rest
        const restCheck = this.shouldRestToday(history);
        if (restCheck.shouldRest && restCheck.confidence !== 'low') {
            return {
                type: 'rest',
                message: randomItem(COACH_MESSAGES.restDay),
                reason: restCheck.factors.join(', '),
                confidence: restCheck.confidence
            };
        }

        // 2. Get active goals and prioritize workouts matching them
        const activeGoals = GoalService.getGoals('active');
        if (activeGoals.length > 0) {
            // Find goal with approaching deadline or low progress
            const urgentGoals = activeGoals.filter(g => {
                if (g.deadline) {
                    const daysUntil = Math.floor((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    return daysUntil <= 7;
                }
                return false;
            });

            if (urgentGoals.length > 0) {
                const goal = urgentGoals[0];
                // Check if muscles are recovered
                const workoutMuscles = WORKOUT_MUSCLE_IMPACT[goal.workoutType].primary;
                const conflict = workoutMuscles.some(m => affectedMuscles.includes(m));

                if (!conflict) {
                    return {
                        type: 'workout',
                        workoutType: goal.workoutType,
                        difficulty: goal.difficulty,
                        message: `Focus on your goal: ${WORKOUT_CONFIGS[goal.workoutType].name}!`,
                        reason: `Goal deadline approaching (${Math.floor((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left)`,
                        confidence: 'high'
                    };
                }
            }
        }

        // 3. Avoid workouts that impact sore muscles
        let availableWorkouts = Object.keys(WORKOUT_CONFIGS);
        if (affectedMuscles.length > 0) {
            availableWorkouts = availableWorkouts.filter(type => {
                const impactedMuscles = WORKOUT_MUSCLE_IMPACT[type].primary;
                return !impactedMuscles.some(m => affectedMuscles.includes(m));
            });

            if (availableWorkouts.length > 0) {
                const suggested = availableWorkouts[0];
                return {
                    type: 'workout',
                    workoutType: suggested,
                    difficulty: this.#suggestDifficulty(suggested, history),
                    message: randomItem(COACH_MESSAGES.sorenessAwareness),
                    reason: `Your ${affectedMuscles.join(', ')} muscles need recovery`,
                    confidence: 'medium'
                };
            }
        }

        // 4. Check variety (avoid same workout 3+ times in a row)
        const recentWorkouts = lastN(history.sessions, 3);
        if (recentWorkouts.length >= 2) {
            const lastType = recentWorkouts[0].workoutType;
            const allSameType = recentWorkouts.every(w => w.workoutType === lastType);

            if (allSameType) {
                const differentWorkouts = availableWorkouts.filter(t => t !== lastType);
                if (differentWorkouts.length > 0) {
                    const suggested = differentWorkouts[0];
                    return {
                        type: 'workout',
                        workoutType: suggested,
                        difficulty: this.#suggestDifficulty(suggested, history),
                        message: randomItem(COACH_MESSAGES.varietySuggestion),
                        reason: `You've done ${WORKOUT_CONFIGS[lastType].name} 3 times in a row`,
                        confidence: 'medium'
                    };
                }
            }
        }

        // 5. Default: Suggest any workout with appropriate difficulty
        const suggested = availableWorkouts[0] || 'burpees';
        return {
            type: 'workout',
            workoutType: suggested,
            difficulty: this.#suggestDifficulty(suggested, history),
            message: "Ready for a great workout? Let's go!",
            reason: 'Keep up the momentum!',
            confidence: 'medium'
        };
    }

    /**
     * Suggest appropriate difficulty based on performance
     */
    static #suggestDifficulty(workoutType, history) {
        const relevantWorkouts = history.sessions.filter(w => w.workoutType === workoutType);

        if (relevantWorkouts.length === 0) {
            return 'intermediate'; // Default for new workout type
        }

        // Get most recent difficulty
        const lastDifficulty = relevantWorkouts[0].difficulty;

        // Check performance trend
        const trend = calculateTrend(relevantWorkouts);

        if (trend === 'improving' && relevantWorkouts.length >= 3) {
            // Suggest next difficulty level
            const difficulties = Object.keys(DIFFICULTY_LEVELS);
            const currentIndex = difficulties.indexOf(lastDifficulty);
            if (currentIndex < difficulties.length - 1) {
                return difficulties[currentIndex + 1];
            }
        } else if (trend === 'declining') {
            // Suggest easier difficulty
            const difficulties = Object.keys(DIFFICULTY_LEVELS);
            const currentIndex = difficulties.indexOf(lastDifficulty);
            if (currentIndex > 0) {
                return difficulties[currentIndex - 1];
            }
        }

        return lastDifficulty; // Maintain current difficulty
    }

    /**
     * Determine if user should rest today
     */
    static shouldRestToday(history) {
        const factors = [];
        let score = 0;

        // Factor 1: Soreness (weight: 40%)
        const currentSoreness = SorenessService.getCurrentSorenessLevel();
        if (currentSoreness >= 4) {
            score += 40;
            factors.push("High soreness level");
        } else if (currentSoreness >= 3) {
            score += 25;
            factors.push("Moderate soreness");
        }

        // Factor 2: Streak (weight: 30%)
        const streak = StreakService.getCurrentStreak();
        if (streak >= 7) {
            score += 30;
            factors.push("7+ day streak - recovery needed");
        } else if (streak >= 6) {
            score += 20;
            factors.push("6 day streak");
        }

        // Factor 3: Recent intensity (weight: 20%)
        const last3Workouts = lastN(history.sessions, 3);
        if (last3Workouts.length >= 3) {
            const avgIntensity = average(last3Workouts.map(w =>
                WORKOUT_MUSCLE_IMPACT[w.workoutType]?.intensity || 3
            ));

            if (avgIntensity >= 4.5) {
                score += 20;
                factors.push("High recent intensity");
            } else if (avgIntensity >= 4.0) {
                score += 10;
            }
        }

        // Factor 4: Performance decline (weight: 10%)
        if (history.sessions.length >= 5) {
            const trend = calculateTrend(lastN(history.sessions, 5));
            if (trend === 'declining') {
                score += 10;
                factors.push("Performance declining");
            }
        }

        // Decision
        if (score >= 50) {
            return { shouldRest: true, confidence: 'high', factors };
        } else if (score >= 30) {
            return { shouldRest: true, confidence: 'moderate', factors };
        } else {
            return { shouldRest: false, confidence: 'low', factors: [] };
        }
    }

    /**
     * Get goal progress update message
     */
    static getGoalProgressUpdate(goalId) {
        const goal = GoalService.getGoalById(goalId);
        if (!goal) return null;

        const progress = goal.bestAttempt.percentageAchieved;
        const attemptsCount = goal.attempts;

        // Milestone celebrations
        if (progress >= 100) {
            return randomItem(COACH_MESSAGES.goalCompleted);
        } else if (progress >= 75) {
            return "🔥 75% there! You're SO close - don't give up now!";
        } else if (progress >= 50) {
            return "💪 Halfway to your goal! Keep the momentum going!";
        } else if (progress >= 25) {
            return "📈 25% progress! You're on your way!";
        }

        // Deadline pressure
        if (goal.deadline) {
            const daysRemaining = Math.floor((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysRemaining <= 3 && daysRemaining > 0) {
                return `⏰ ${daysRemaining} days left! Time to push hard!`;
            } else if (daysRemaining <= 7) {
                return `📅 One week to go! You've got this!`;
            }
        }

        // Encouragement based on attempts
        if (attemptsCount === 1) {
            return "Great start! Keep working toward your goal!";
        } else if (attemptsCount >= 5 && progress < 50) {
            return "Keep at it! Every workout gets you closer!";
        }

        return `You're making progress - ${Math.round(progress)}% complete!`;
    }

    /**
     * Get motivational message based on context
     */
    static getMotivationalMessage(context) {
        switch (context.context) {
            case 'workout_completed':
                return randomItem(COACH_MESSAGES.goalEncouragement);
            case 'goal_milestone':
                return this.getGoalProgressUpdate(context.goalId);
            case 'rest_day':
                return randomItem(COACH_MESSAGES.restDay);
            default:
                return "Keep pushing! You're doing great!";
        }
    }

    /**
     * Celebrate goal milestone
     */
    static celebrateGoalMilestone(goalId, progress) {
        if (progress >= 100) {
            return {
                message: randomItem(COACH_MESSAGES.goalCompleted),
                animation: 'confetti',
                level: 'epic'
            };
        } else if (progress >= 75) {
            return {
                message: "🔥 75% complete! Almost there!",
                animation: 'pulse',
                level: 'high'
            };
        } else if (progress >= 50) {
            return {
                message: "💪 Halfway there! Fantastic progress!",
                animation: 'pulse',
                level: 'medium'
            };
        } else if (progress >= 25) {
            return {
                message: "📈 25% done! Keep going!",
                animation: 'pulse',
                level: 'low'
            };
        }

        return null;
    }

    /**
     * Get recovery recommendation
     */
    static getRecoveryRecommendation() {
        const currentSoreness = SorenessService.getCurrentSorenessLevel();
        const pattern = SorenessService.getSorenessPattern(14);

        if (currentSoreness >= 4) {
            return {
                recommendation: 'Take a full rest day',
                reason: 'Your soreness level is high (4-5). Your muscles need time to repair.',
                tips: [
                    'Stay hydrated',
                    'Get quality sleep',
                    'Consider light stretching',
                    'Eat protein-rich foods'
                ]
            };
        } else if (currentSoreness >= 3) {
            return {
                recommendation: 'Light activity or rest',
                reason: 'You have significant soreness (level 3). Consider active recovery.',
                tips: [
                    'Try a gentle workout with different muscle groups',
                    'Focus on lower intensity',
                    'Listen to your body'
                ]
            };
        }

        return {
            recommendation: "You're recovered and ready!",
            reason: 'Low soreness levels - perfect time for a workout!',
            tips: ['Push yourself today', 'Work toward your goals']
        };
    }

    /**
     * Get performance trend analysis
     */
    static getPerformanceTrend(history) {
        if (history.sessions.length < 5) {
            return {
                trend: 'insufficient_data',
                message: 'Complete a few more workouts for trend analysis'
            };
        }

        const recent = lastN(history.sessions, 5);
        const trend = calculateTrend(recent);

        const messages = {
            improving: "📈 You're improving! Your recent performance is trending upward!",
            declining: "📉 Performance has dipped. Consider more rest or adjusting intensity.",
            plateau: "➡️ You're maintaining steady performance. Ready to level up?"
        };

        return {
            trend,
            message: messages[trend] || messages.plateau
        };
    }
}
