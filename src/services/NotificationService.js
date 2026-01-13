// Notification Service - Proactive soreness reminders and notifications
// ========================================================================

import { StorageManager } from './StorageManager.js';
import { STORAGE_KEYS } from '../config/constants.js';
import { HistoryService } from './HistoryService.js';
import { SorenessService } from './SorenessService.js';

export class NotificationService {
    static NOTIFICATION_TYPES = {
        DAILY_SORENESS: 'daily_soreness',
        POST_WORKOUT: 'post_workout',
        GOAL_DEADLINE: 'goal_deadline',
        STREAK_REMINDER: 'streak_reminder'
    };

    static REMINDER_TIMES = {
        daily: { hour: 20, minute: 0 }, // 8 PM default
        post_workout_24h: 24 * 60 * 60 * 1000, // 24 hours
        post_workout_48h: 48 * 60 * 60 * 1000  // 48 hours
    };

    /**
     * Request notification permission from user
     */
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.#updatePreferences({ notificationsEnabled: true });
                this.#scheduleNextNotifications();
                return true;
            }
        }

        return false;
    }

    /**
     * Check if notifications are enabled and permitted
     */
    static isEnabled() {
        if (!('Notification' in window)) {
            return false;
        }

        const coachState = StorageManager.load(STORAGE_KEYS.COACH_STATE, {});
        const prefs = coachState.preferences || {};

        return Notification.permission === 'granted' && prefs.notificationsEnabled === true;
    }

    /**
     * Get notification preferences
     */
    static getPreferences() {
        const coachState = StorageManager.load(STORAGE_KEYS.COACH_STATE, {});
        return coachState.preferences || {
            notificationsEnabled: false,
            reminderFrequency: 'daily',
            dailyReminderTime: '20:00',
            postWorkoutReminders: true
        };
    }

    /**
     * Update notification preferences
     */
    static #updatePreferences(updates) {
        const coachState = StorageManager.load(STORAGE_KEYS.COACH_STATE, {});
        coachState.preferences = {
            ...this.getPreferences(),
            ...updates
        };
        StorageManager.save(STORAGE_KEYS.COACH_STATE, coachState);
    }

    /**
     * Enable notifications
     */
    static async enable() {
        const granted = await this.requestPermission();
        if (granted) {
            this.#updatePreferences({ notificationsEnabled: true });
            this.#scheduleNextNotifications();
            return true;
        }
        return false;
    }

    /**
     * Disable notifications
     */
    static disable() {
        this.#updatePreferences({ notificationsEnabled: false });
        this.#clearScheduledNotifications();
    }

    /**
     * Show a notification
     */
    static showNotification(title, options = {}) {
        if (!this.isEnabled()) {
            return null;
        }

        const defaultOptions = {
            icon: '/workout_tool/icons/icon-192.png',
            badge: '/workout_tool/icons/icon-192.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            ...options
        };

        // Use service worker if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            return navigator.serviceWorker.ready.then(registration => {
                return registration.showNotification(title, defaultOptions);
            });
        }

        // Fallback to regular notification
        return new Notification(title, defaultOptions);
    }

    /**
     * Schedule next round of notifications
     */
    static #scheduleNextNotifications() {
        if (!this.isEnabled()) {
            return;
        }

        const prefs = this.getPreferences();

        // Schedule daily soreness check
        if (prefs.reminderFrequency === 'daily') {
            this.#scheduleDailyReminder();
        }

        // Schedule post-workout reminders
        if (prefs.postWorkoutReminders !== false) {
            this.#schedulePostWorkoutReminders();
        }
    }

    /**
     * Schedule daily soreness reminder
     */
    static #scheduleDailyReminder() {
        const prefs = this.getPreferences();
        const [hour, minute] = (prefs.dailyReminderTime || '20:00').split(':').map(Number);

        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(hour, minute, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const delay = reminderTime - now;

        // Store timeout ID
        const timeoutId = setTimeout(() => {
            this.#sendDailySorenessReminder();
        }, delay);

        // Save timeout ID for cleanup
        this.#saveScheduledTimeout('daily_reminder', timeoutId, reminderTime.toISOString());
    }

    /**
     * Schedule post-workout reminders (24h and 48h after intense workouts)
     */
    static #schedulePostWorkoutReminders() {
        const history = HistoryService.getHistory();
        const recentWorkouts = history.sessions.slice(0, 3); // Last 3 workouts

        recentWorkouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            const now = new Date();

            // Schedule 24h reminder if not yet passed
            const reminder24h = new Date(workoutDate.getTime() + this.REMINDER_TIMES.post_workout_24h);
            if (reminder24h > now && reminder24h - now < 24 * 60 * 60 * 1000) {
                const delay = reminder24h - now;
                const timeoutId = setTimeout(() => {
                    this.#sendPostWorkoutReminder(workout, '24 hours');
                }, delay);
                this.#saveScheduledTimeout(`post_workout_24h_${workout.id}`, timeoutId, reminder24h.toISOString());
            }

            // Schedule 48h reminder if not yet passed
            const reminder48h = new Date(workoutDate.getTime() + this.REMINDER_TIMES.post_workout_48h);
            if (reminder48h > now && reminder48h - now < 48 * 60 * 60 * 1000) {
                const delay = reminder48h - now;
                const timeoutId = setTimeout(() => {
                    this.#sendPostWorkoutReminder(workout, '48 hours');
                }, delay);
                this.#saveScheduledTimeout(`post_workout_48h_${workout.id}`, timeoutId, reminder48h.toISOString());
            }
        });
    }

    /**
     * Send daily soreness reminder
     */
    static #sendDailySorenessReminder() {
        const lastEntry = SorenessService.getLatestSoreness();
        const now = new Date();
        const lastEntryDate = lastEntry ? new Date(lastEntry.timestamp) : null;

        // Don't send if already logged today
        if (lastEntryDate && lastEntryDate.toDateString() === now.toDateString()) {
            this.#scheduleDailyReminder(); // Schedule for tomorrow
            return;
        }

        this.showNotification('How are you feeling? 💪', {
            body: 'Take a moment to log your muscle soreness for better workout recommendations.',
            tag: 'daily_soreness',
            data: {
                type: this.NOTIFICATION_TYPES.DAILY_SORENESS,
                action: 'open_soreness_modal'
            }
        });

        // Schedule next daily reminder
        this.#scheduleDailyReminder();
    }

    /**
     * Send post-workout soreness reminder
     */
    static #sendPostWorkoutReminder(workout, timeframe) {
        const workoutName = workout.workoutType.charAt(0).toUpperCase() + workout.workoutType.slice(1);

        this.showNotification(`Recovery Check: ${workoutName} workout`, {
            body: `It's been ${timeframe} since your workout. How are your muscles feeling?`,
            tag: `post_workout_${workout.id}`,
            data: {
                type: this.NOTIFICATION_TYPES.POST_WORKOUT,
                workoutId: workout.id,
                action: 'open_soreness_modal'
            }
        });
    }

    /**
     * Send goal deadline reminder
     */
    static sendGoalDeadlineReminder(goal, daysRemaining) {
        if (!this.isEnabled()) {
            return;
        }

        const urgency = daysRemaining <= 1 ? '🚨' : daysRemaining <= 3 ? '⏰' : '📅';
        const daysText = daysRemaining === 1 ? 'tomorrow' : `in ${daysRemaining} days`;

        this.showNotification(`${urgency} Goal Deadline Approaching`, {
            body: `Your goal for ${goal.targetReps} reps is due ${daysText}!`,
            tag: `goal_deadline_${goal.id}`,
            data: {
                type: this.NOTIFICATION_TYPES.GOAL_DEADLINE,
                goalId: goal.id,
                action: 'open_coach_panel'
            }
        });
    }

    /**
     * Send streak reminder
     */
    static sendStreakReminder(streak) {
        if (!this.isEnabled()) {
            return;
        }

        this.showNotification(`🔥 ${streak} Day Streak!`, {
            body: 'Keep the momentum going! Ready for today\'s workout?',
            tag: 'streak_reminder',
            data: {
                type: this.NOTIFICATION_TYPES.STREAK_REMINDER,
                streak: streak,
                action: 'open_app'
            }
        });
    }

    /**
     * Save scheduled timeout for cleanup
     */
    static #saveScheduledTimeout(key, timeoutId, scheduledTime) {
        const coachState = StorageManager.load(STORAGE_KEYS.COACH_STATE, {});
        if (!coachState.scheduledNotifications) {
            coachState.scheduledNotifications = {};
        }
        coachState.scheduledNotifications[key] = {
            timeoutId,
            scheduledTime
        };
        StorageManager.save(STORAGE_KEYS.COACH_STATE, coachState);
    }

    /**
     * Clear all scheduled notifications
     */
    static #clearScheduledNotifications() {
        const coachState = StorageManager.load(STORAGE_KEYS.COACH_STATE, {});
        const scheduled = coachState.scheduledNotifications || {};

        Object.values(scheduled).forEach(({ timeoutId }) => {
            clearTimeout(timeoutId);
        });

        coachState.scheduledNotifications = {};
        StorageManager.save(STORAGE_KEYS.COACH_STATE, coachState);
    }

    /**
     * Initialize notification service (call on app start)
     */
    static init() {
        // Check if notifications were previously enabled
        if (this.isEnabled()) {
            this.#scheduleNextNotifications();
        }

        // Listen for visibility change to reschedule if needed
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isEnabled()) {
                // App became visible, check if we need to reschedule
                this.#clearScheduledNotifications();
                this.#scheduleNextNotifications();
            }
        });
    }

    /**
     * Update daily reminder time
     */
    static updateDailyReminderTime(time) {
        this.#updatePreferences({ dailyReminderTime: time });
        this.#clearScheduledNotifications();
        this.#scheduleNextNotifications();
    }

    /**
     * Toggle post-workout reminders
     */
    static togglePostWorkoutReminders(enabled) {
        this.#updatePreferences({ postWorkoutReminders: enabled });
        this.#clearScheduledNotifications();
        this.#scheduleNextNotifications();
    }
}
