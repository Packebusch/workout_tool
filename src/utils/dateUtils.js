// Date and Time Utility Functions
// =================================

/**
 * Format seconds into MM:SS string
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get today's date as string
 */
export function getTodayString() {
    return new Date().toDateString();
}

/**
 * Get yesterday's date as string
 */
export function getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString();
}

/**
 * Filter sessions by date range
 */
export function filterSessionsByDateRange(sessions, startDate, endDate = null) {
    return sessions.filter(session => {
        const sessionDate = new Date(session.date);
        if (endDate) {
            return sessionDate >= startDate && sessionDate < endDate;
        }
        return sessionDate >= startDate;
    });
}

/**
 * Get week start date (Sunday)
 */
export function getWeekStart(date = new Date()) {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

/**
 * Get month start date
 */
export function getMonthStart(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date;
}

/**
 * Get week key for grouping (Sunday of that week)
 */
export function getWeekKey(date) {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek;
    const sunday = new Date(d.setDate(diff));
    return sunday.toISOString().split('T')[0];
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get array of dates for a period
 */
export function getDateRange(days) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }
    return dates;
}
