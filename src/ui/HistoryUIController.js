// History UI Controller - History panel and modal management
// ============================================================

import { WORKOUT_CONFIGS, DIFFICULTY_LEVELS } from '../config/constants.js';
import { formatTime, formatDateForDisplay } from '../utils/dateUtils.js';

export class HistoryUIController {
    #elements;

    constructor() {
        this.#elements = this.#getElements();
    }

    /**
     * Get DOM elements
     */
    #getElements() {
        return {
            historyPanel: document.getElementById('historyPanel'),
            historyToggleBtn: document.getElementById('historyToggleBtn'),
            closeHistoryBtn: document.getElementById('closeHistoryBtn'),
            lifetimeStats: document.getElementById('lifetimeStats'),
            historyStats: document.getElementById('historyStats'),
            historyList: document.getElementById('historyList'),
            progressChart: document.getElementById('progressChart'),
            chartLegend: document.getElementById('chartLegend'),
            completionModal: document.getElementById('completionModal'),
            completionStats: document.getElementById('completionStats')
        };
    }

    /**
     * Toggle history panel
     */
    toggleHistory() {
        this.#elements.historyPanel.classList.toggle('open');
        return this.#elements.historyPanel.classList.contains('open');
    }

    /**
     * Close history panel
     */
    closeHistory() {
        this.#elements.historyPanel.classList.remove('open');
    }

    /**
     * Render lifetime stats
     */
    renderLifetimeStats(stats) {
        if (!stats) {
            this.#elements.lifetimeStats.innerHTML =
                '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">Complete your first workout to see lifetime stats!</p>';
            return;
        }

        this.#elements.lifetimeStats.innerHTML = `
            <h3>Lifetime Stats</h3>
            <div class="lifetime-grid">
                <div class="lifetime-stat-box">
                    <div class="lifetime-stat-value">${stats.totalWorkouts}</div>
                    <div class="lifetime-stat-label">Workouts</div>
                </div>
                <div class="lifetime-stat-box">
                    <div class="lifetime-stat-value">${stats.totalReps.toLocaleString()}</div>
                    <div class="lifetime-stat-label">Total Reps</div>
                </div>
                <div class="lifetime-stat-box">
                    <div class="lifetime-stat-value">${stats.totalCalories.toLocaleString()}</div>
                    <div class="lifetime-stat-label">Calories</div>
                </div>
                <div class="lifetime-stat-box">
                    <div class="lifetime-stat-value">${stats.totalHours}h ${stats.totalMinutes}m</div>
                    <div class="lifetime-stat-label">Total Time</div>
                </div>
            </div>
            <div class="lifetime-insights">
                <div class="lifetime-insights-text">💪 Most productive day: ${stats.mostProductiveDay}</div>
            </div>
        `;
    }

    /**
     * Render chart legend
     */
    renderChartLegend(legendHTML) {
        this.#elements.chartLegend.innerHTML = legendHTML;
    }

    /**
     * Render type statistics
     */
    renderTypeStats(typeStats) {
        if (typeStats.length === 0) {
            this.#elements.historyStats.innerHTML =
                '<p style="text-align: center; color: rgba(255,255,255,0.5);">No statistics available</p>';
            return;
        }

        let html = `
            <div class="overall-stats">
                <h3 style="color: #ff6b9d; font-size: 0.9rem; margin-bottom: 12px;">Overall Stats</h3>
            </div>
            <div class="type-stats" style="margin-top: 20px;">
                <h3 style="color: #ffaa00; font-size: 0.9rem; margin-bottom: 12px;">By Workout Type</h3>
        `;

        typeStats.forEach(stat => {
            const trendIcon = stat.trend === 'improving' ? '📈' : stat.trend === 'declining' ? '📉' : '➡️';
            const trendColor = stat.trend === 'improving' ? '#00ffcc' : stat.trend === 'declining' ? '#ff6b9d' : '#ffaa00';
            const trendText = stat.trend === 'improving' ? 'Improving!' : stat.trend === 'declining' ? 'Declining' : 'Steady';

            let weekHTML = '';
            if (stat.weekComparison) {
                const weekArrow = stat.weekComparison > 0 ? '↑' : stat.weekComparison < 0 ? '↓' : '→';
                const weekColor = stat.weekComparison > 0 ? '#00ffcc' : stat.weekComparison < 0 ? '#ff6b9d' : '#ffaa00';
                weekHTML = `<span style="color: ${weekColor};">${weekArrow} ${Math.abs(stat.weekComparison)}% vs last week</span>`;
            }

            const name = WORKOUT_CONFIGS[stat.type]?.name || stat.type;

            html += `
                <div class="type-stat-item" style="margin-bottom: 12px; padding: 10px; background: rgba(0, 255, 204, 0.05); border-radius: 8px; border: 1px solid rgba(0, 255, 204, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="color: #00ffcc; font-weight: 700; font-size: 0.85rem;">${name}</div>
                        <div style="color: ${trendColor}; font-size: 0.75rem; font-weight: 600;">${trendIcon} ${trendText}</div>
                    </div>
                    <div style="display: flex; gap: 15px; font-size: 0.75rem; flex-wrap: wrap;">
                        <span style="color: rgba(255, 255, 255, 0.7);">${stat.count} sessions</span>
                        <span style="color: rgba(255, 255, 255, 0.7);">Avg: ${stat.avgRepsPerMin} reps/min</span>
                        <span style="color: rgba(255, 255, 255, 0.7);">Best: ${stat.bestRepsPerMin} reps/min</span>
                        ${weekHTML ? `<span>${weekHTML}</span>` : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        this.#elements.historyStats.innerHTML = html;
    }

    /**
     * Render workout list
     */
    renderWorkoutList(sessions) {
        if (sessions.length === 0) {
            this.#elements.historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3 class="empty-state-title">No Workout History Yet</h3>
                    <p class="empty-state-message">
                        Start your fitness journey! Complete your first workout and it will appear here.
                    </p>
                    <button class="empty-state-button" onclick="document.querySelector('[data-tab=\\'workout\\']').click()">
                        Start Your First Workout
                    </button>
                </div>
            `;
            return;
        }

        this.#elements.historyList.innerHTML = sessions.map(session => {
            const date = new Date(session.date);
            const dateStr = formatDateForDisplay(date);
            const durationStr = formatTime(session.duration);
            const workoutName = session.workoutType
                ? WORKOUT_CONFIGS[session.workoutType]?.name || 'Burpees'
                : 'Burpees';
            const difficultyName = session.difficulty
                ? DIFFICULTY_LEVELS[session.difficulty]?.name || ''
                : '';

            return `
                <div class="history-item">
                    <div class="history-date">${dateStr}</div>
                    <div class="history-workout-type">${workoutName} - ${difficultyName}</div>
                    <div class="history-details">
                        <div class="history-detail"><strong>${session.reps}</strong> reps</div>
                        <div class="history-detail"><strong>${durationStr}</strong> time</div>
                        <div class="history-detail"><strong>${session.calories}</strong> calories</div>
                        <div class="history-detail"><strong>${session.fitnessLevel}</strong> level</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Show completion modal
     */
    showCompletionModal(summary, record, comparison, suggestion) {
        let html = `
            <div class="completion-stat">
                <span class="completion-stat-label">Total Reps:</span>
                <span class="completion-stat-value">${summary.reps}</span>
            </div>
            <div class="completion-stat">
                <span class="completion-stat-label">Duration:</span>
                <span class="completion-stat-value">${formatTime(summary.duration)}</span>
            </div>
            <div class="completion-stat">
                <span class="completion-stat-label">Calories Burned:</span>
                <span class="completion-stat-value">${summary.calories}</span>
            </div>
            <div class="fitness-level">
                Fitness Level: ${summary.fitnessLevel}
            </div>
        `;

        // Add personal record if achieved
        if (record?.isNewRecord) {
            html += `
                <div class="personal-record" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 107, 157, 0.15)); border: 3px solid #FFD700; border-radius: 12px; padding: 18px; margin: 15px 0; animation: pulse 2s infinite;">
                    <div style="font-size: 2.5rem; text-align: center; margin-bottom: 8px;">🏆</div>
                    <div style="font-size: 1.1rem; color: #FFD700; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: 1px;">NEW PERSONAL RECORD!</div>
                    <div style="font-size: 0.85rem; color: #00ffcc; text-align: center; margin-top: 8px;">+${record.improvement} reps better than your best!</div>
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.7); text-align: center; margin-top: 6px;">Previous record: ${record.recordReps} reps</div>
                </div>
            `;
        } else if (record) {
            const diff = record.recordReps - record.currentReps;
            html += `
                <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); text-align: center; margin: 10px 0;">
                    Your record: ${record.recordReps} reps (${diff} reps away)
                </div>
            `;
        }

        // Add comparison
        if (comparison) {
            const arrow = comparison.improvement > 0 ? '↑' : comparison.improvement < 0 ? '↓' : '→';
            const color = comparison.improvement > 0 ? '#00ffcc' : comparison.improvement < 0 ? '#ff6b9d' : '#ffaa00';
            const message = comparison.improvement > 0
                ? `${Math.abs(comparison.improvement)}% BETTER than last time!`
                : comparison.improvement < 0
                ? `${Math.abs(comparison.improvement)}% below last time`
                : 'Same as last time';

            html += `
                <div class="progress-comparison" style="background: rgba(0, 255, 204, 0.05); border: 2px solid ${color}; border-radius: 12px; padding: 15px; margin: 15px 0;">
                    <div style="font-size: 2rem; color: ${color}; text-align: center; margin-bottom: 8px;">${arrow}</div>
                    <div style="font-size: 0.95rem; color: ${color}; font-weight: 700; text-align: center;">${message}</div>
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6); text-align: center; margin-top: 6px;">Last: ${comparison.lastReps} reps → Now: ${summary.reps} reps</div>
                </div>
            `;
        }

        // Add suggestion
        if (suggestion) {
            html += `
                <div class="progression-suggestion" style="background: rgba(255, 170, 0, 0.1); border: 2px solid #ffaa00; border-radius: 12px; padding: 12px; margin: 15px 0;">
                    <div style="font-size: 0.85rem; color: #ffaa00; font-weight: 700; text-align: center;">💪 ${suggestion}</div>
                </div>
            `;
        }

        this.#elements.completionStats.innerHTML = html;
        this.#elements.completionModal.classList.add('open');
    }

    /**
     * Close completion modal
     */
    closeCompletionModal() {
        this.#elements.completionModal.classList.remove('open');
    }

    /**
     * Get canvas element for chart
     */
    getChartCanvas() {
        return this.#elements.progressChart;
    }
}
