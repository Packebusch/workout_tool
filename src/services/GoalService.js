// Goal Service - Performance goal management and progress tracking
// ===================================================================

import { StorageManager } from './StorageManager.js';
import { STORAGE_KEYS } from '../config/constants.js';
import { generateId } from '../utils/utils.js';

export class GoalService {
    /**
     * Get all goals or filtered by status
     */
    static getGoals(filterStatus = 'all') {
        const data = StorageManager.load(STORAGE_KEYS.GOALS, { goals: [] });

        if (filterStatus === 'all') {
            return data.goals;
        }

        return data.goals.filter(g => g.status === filterStatus);
    }

    /**
     * Get a specific goal by ID
     */
    static getGoalById(id) {
        const data = StorageManager.load(STORAGE_KEYS.GOALS, { goals: [] });
        return data.goals.find(g => g.id === id);
    }

    /**
     * Create a new goal
     */
    static createGoal(goalData) {
        const data = StorageManager.load(STORAGE_KEYS.GOALS, { goals: [] });

        const newGoal = {
            id: generateId(),
            workoutType: goalData.workoutType,
            difficulty: goalData.difficulty,
            targetReps: goalData.targetReps,
            targetDuration: goalData.targetDuration,
            deadline: goalData.deadline || null,
            createdDate: new Date().toISOString(),
            status: 'active',
            completedDate: null,
            source: goalData.source || 'manual', // 'manual' or 'coach_suggested'
            bestAttempt: {
                reps: 0,
                duration: 0,
                date: null,
                percentageAchieved: 0
            },
            attempts: 0
        };

        data.goals.unshift(newGoal);

        // Keep max 30 goals (20 active + 10 completed/abandoned)
        if (data.goals.length > 30) {
            data.goals = data.goals.slice(0, 30);
        }

        StorageManager.save(STORAGE_KEYS.GOALS, data);
        return newGoal;
    }

    /**
     * Create goal from coach suggestion
     */
    static createGoalFromSuggestion(suggestion) {
        return this.createGoal({
            ...suggestion,
            source: 'coach_suggested'
        });
    }

    /**
     * Update a goal
     */
    static updateGoal(id, updates) {
        const data = StorageManager.load(STORAGE_KEYS.GOALS, { goals: [] });
        const goalIndex = data.goals.findIndex(g => g.id === id);

        if (goalIndex === -1) {
            return null;
        }

        data.goals[goalIndex] = {
            ...data.goals[goalIndex],
            ...updates
        };

        StorageManager.save(STORAGE_KEYS.GOALS, data);
        return data.goals[goalIndex];
    }

    /**
     * Record a workout attempt toward a goal
     */
    static recordAttempt(goalId, workoutSummary) {
        const goal = this.getGoalById(goalId);
        if (!goal) return null;

        // Calculate progress percentage
        const repsProgress = (workoutSummary.reps / goal.targetReps) * 100;
        const durationMatch = workoutSummary.duration <= goal.targetDuration;

        // Check if this is the best attempt
        const isBestAttempt = workoutSummary.reps > goal.bestAttempt.reps;

        if (isBestAttempt) {
            const updates = {
                bestAttempt: {
                    reps: workoutSummary.reps,
                    duration: workoutSummary.duration,
                    date: workoutSummary.date || new Date().toISOString(),
                    percentageAchieved: Math.min(repsProgress, 100)
                },
                attempts: goal.attempts + 1
            };

            // Check if goal is completed
            if (workoutSummary.reps >= goal.targetReps && durationMatch) {
                updates.status = 'completed';
                updates.completedDate = workoutSummary.date || new Date().toISOString();
            }

            return this.updateGoal(goalId, updates);
        } else {
            // Just increment attempts
            return this.updateGoal(goalId, {
                attempts: goal.attempts + 1
            });
        }
    }

    /**
     * Complete a goal manually
     */
    static completeGoal(id) {
        return this.updateGoal(id, {
            status: 'completed',
            completedDate: new Date().toISOString()
        });
    }

    /**
     * Abandon a goal
     */
    static abandonGoal(id) {
        return this.updateGoal(id, {
            status: 'abandoned'
        });
    }

    /**
     * Delete a goal
     */
    static deleteGoal(id) {
        const data = StorageManager.load(STORAGE_KEYS.GOALS, { goals: [] });
        data.goals = data.goals.filter(g => g.id !== id);
        StorageManager.save(STORAGE_KEYS.GOALS, data);
        return true;
    }

    /**
     * Get goals for a specific workout type and difficulty
     */
    static getGoalsForWorkout(workoutType, difficulty) {
        const data = StorageManager.load(STORAGE_KEYS.GOALS, { goals: [] });
        return data.goals.filter(
            g => g.workoutType === workoutType &&
                 g.difficulty === difficulty &&
                 g.status === 'active'
        );
    }

    /**
     * Check if there's an active goal for this workout
     */
    static hasActiveGoalFor(workoutType, difficulty) {
        const goals = this.getGoalsForWorkout(workoutType, difficulty);
        return goals.length > 0;
    }

    /**
     * Get goal progress percentage
     */
    static getGoalProgress(goalId) {
        const goal = this.getGoalById(goalId);
        if (!goal) return 0;

        return goal.bestAttempt.percentageAchieved;
    }

    /**
     * Get summary of all goals
     */
    static getGoalsSummary() {
        const all = this.getGoals('all');
        const active = all.filter(g => g.status === 'active');
        const completed = all.filter(g => g.status === 'completed');

        return {
            total: all.length,
            active: active.length,
            completed: completed.length,
            completionRate: all.length > 0 ? (completed.length / all.length) * 100 : 0
        };
    }

    /**
     * Get completed goals count
     */
    static getCompletedGoalsCount() {
        return this.getGoals('completed').length;
    }

    /**
     * Get average attempts to completion
     */
    static getAverageAttemptsToCompletion() {
        const completed = this.getGoals('completed');
        if (completed.length === 0) return 0;

        const totalAttempts = completed.reduce((sum, g) => sum + g.attempts, 0);
        return (totalAttempts / completed.length).toFixed(1);
    }

    /**
     * Get recent goal history for a specific workout
     */
    static getRecentGoalHistory(workoutType, difficulty, limit = 5) {
        const data = StorageManager.load(STORAGE_KEYS.GOALS, { goals: [] });
        return data.goals
            .filter(g => g.workoutType === workoutType && g.difficulty === difficulty)
            .slice(0, limit);
    }

    /**
     * Auto-prune old completed/abandoned goals (keep last 10)
     */
    static pruneOldGoals() {
        const data = StorageManager.load(STORAGE_KEYS.GOALS, { goals: [] });

        const active = data.goals.filter(g => g.status === 'active');
        const completedAbandoned = data.goals
            .filter(g => g.status === 'completed' || g.status === 'abandoned')
            .slice(0, 10);

        data.goals = [...active, ...completedAbandoned];
        StorageManager.save(STORAGE_KEYS.GOALS, data);
    }
}
