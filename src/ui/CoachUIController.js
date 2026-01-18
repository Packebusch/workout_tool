// Coach UI Controller - Coach panel and modal management
// ========================================================

import { WORKOUT_CONFIGS, DIFFICULTY_LEVELS, SORENESS_LEVELS, MUSCLE_GROUPS, PROGRESSION_LADDERS } from '../config/constants.js';
import { formatTime, formatDateForDisplay } from '../utils/dateUtils.js';
import { ProgressionService } from '../services/ProgressionService.js';

export class CoachUIController {
    #elements;

    constructor() {
        this.#elements = this.#getElements();
    }

    /**
     * Get DOM elements
     */
    #getElements() {
        return {
            coachPanel: document.getElementById('coachPanel'),
            coachToggleBtn: document.getElementById('coachToggleBtn'),
            closeCoachBtn: document.getElementById('closeCoachBtn'),
            recommendationContent: document.getElementById('recommendationContent'),
            goalsList: document.getElementById('goalsList'),
            sorenessHistory: document.getElementById('sorenessHistory'),
            performanceInsights: document.getElementById('performanceInsights'),
            recoveryInsights: document.getElementById('recoveryInsights'),
            achievementsList: document.getElementById('achievementsList'),
            goalModal: document.getElementById('goalModal'),
            sorenessModal: document.getElementById('sorenessModal'),
            goalForm: document.getElementById('goalForm'),
            sorenessForm: document.getElementById('sorenessForm'),
            goalSuggestionCard: document.getElementById('goalSuggestionCard'),
            progressionSuggestionCard: document.getElementById('progressionSuggestionCard'),
            quickSorenessBtn: document.getElementById('quickSorenessBtn')
        };
    }

    /**
     * Toggle coach panel
     */
    toggleCoachPanel() {
        this.#elements.coachPanel.classList.toggle('open');
        return this.#elements.coachPanel.classList.contains('open');
    }

    /**
     * Close coach panel
     */
    closeCoachPanel() {
        this.#elements.coachPanel.classList.remove('open');
    }

    /**
     * Render daily recommendation
     */
    renderDailyRecommendation(recommendation) {
        if (!recommendation) {
            this.#elements.recommendationContent.innerHTML = `
                <p style="text-align: center; color: rgba(255,255,255,0.5);">
                    Complete a workout to get personalized recommendations!
                </p>
            `;
            return;
        }

        let html = '';

        if (recommendation.type === 'rest') {
            html = `
                <div class="recommendation-rest">
                    <div class="recommendation-icon">🛌</div>
                    <div class="recommendation-message">${recommendation.message}</div>
                    <div class="recommendation-reason">Reason: ${recommendation.reason}</div>
                    <div class="recommendation-confidence">Confidence: ${recommendation.confidence}</div>
                </div>
            `;
        } else if (recommendation.type === 'workout') {
            const workoutName = WORKOUT_CONFIGS[recommendation.workoutType]?.name || 'Workout';
            const difficultyName = DIFFICULTY_LEVELS[recommendation.difficulty]?.name || '';
            const level = ProgressionService.getCurrentLevel(recommendation.workoutType);
            const levelStr = level ? ` (Lv${level})` : '';

            html = `
                <div class="recommendation-workout">
                    <div class="recommendation-icon">💪</div>
                    <div class="recommendation-message">${recommendation.message}</div>
                    <div class="recommendation-workout-details">
                        <strong>Suggested:</strong> ${workoutName}${levelStr} - ${difficultyName}
                    </div>
                    <div class="recommendation-reason">Why: ${recommendation.reason}</div>
                    <button class="start-recommended-workout-btn"
                            data-workout-type="${recommendation.workoutType}"
                            data-difficulty="${recommendation.difficulty}">
                        ▶️ Start This Workout
                    </button>
                </div>
            `;
        }

        this.#elements.recommendationContent.innerHTML = html;
    }

    /**
     * Render goals list
     */
    renderGoalsList(goals) {
        if (goals.length === 0) {
            this.#elements.goalsList.innerHTML = `
                <p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">
                    No active goals yet. Create one to get started!
                </p>
            `;
            return;
        }

        this.#elements.goalsList.innerHTML = goals.map(goal => {
            const workoutName = WORKOUT_CONFIGS[goal.workoutType]?.name || 'Workout';
            const difficultyName = DIFFICULTY_LEVELS[goal.difficulty]?.name || '';
            const level = ProgressionService.getCurrentLevel(goal.workoutType);
            const levelStr = level ? ` (Lv${level})` : '';
            const progress = goal.bestAttempt.percentageAchieved;
            const daysUntil = goal.deadline ?
                Math.floor((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

            let deadlineText = '';
            if (daysUntil !== null) {
                if (daysUntil < 0) {
                    deadlineText = `<span style="color: #ff6b9d;">Overdue</span>`;
                } else if (daysUntil === 0) {
                    deadlineText = `<span style="color: #ffaa00;">Today!</span>`;
                } else if (daysUntil <= 7) {
                    deadlineText = `<span style="color: #ffaa00;">${daysUntil} days left</span>`;
                } else {
                    deadlineText = `${daysUntil} days left`;
                }
            }

            return `
                <div class="goal-item ${goal.status === 'completed' ? 'completed' : ''}">
                    <div class="goal-header">
                        <div class="goal-workout-type">${workoutName}${levelStr} - ${difficultyName}</div>
                        <div class="goal-status">${goal.status}</div>
                    </div>
                    <div class="goal-target">
                        Target: <strong>${goal.targetReps} reps</strong> in <strong>${goal.targetDuration / 60} min</strong>
                    </div>
                    <div class="goal-progress-container">
                        <div class="goal-progress-bar">
                            <div class="goal-progress-fill" style="width: ${Math.min(progress, 100)}%;"></div>
                        </div>
                        <div class="goal-progress-text">${Math.round(progress)}%</div>
                    </div>
                    <div class="goal-details">
                        <span>Best: ${goal.bestAttempt.reps} reps</span>
                        <span>Attempts: ${goal.attempts}</span>
                        ${deadlineText ? `<span>${deadlineText}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render soreness history
     */
    renderSorenessHistory(entries) {
        if (entries.length === 0) {
            this.#elements.sorenessHistory.innerHTML = `
                <p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">
                    No soreness logged yet. Tap the 💪 button to start tracking!
                </p>
            `;
            return;
        }

        this.#elements.sorenessHistory.innerHTML = entries.map(entry => {
            const date = new Date(entry.timestamp);
            const dateStr = formatDateForDisplay(date);
            const level = SORENESS_LEVELS[entry.overallLevel];

            const affectedAreasText = entry.affectedAreas.length > 0
                ? entry.affectedAreas.map(a => `${MUSCLE_GROUPS[a.area]?.name || a.area} (${a.level})`).join(', ')
                : 'No specific areas';

            return `
                <div class="soreness-entry">
                    <div class="soreness-header">
                        <span class="soreness-emoji">${level.emoji}</span>
                        <span class="soreness-level">${level.name}</span>
                        <span class="soreness-date">${dateStr}</span>
                    </div>
                    <div class="soreness-areas">${affectedAreasText}</div>
                    ${entry.notes ? `<div class="soreness-notes">${entry.notes}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Render performance insights
     */
    renderPerformanceInsights(trend, goalsSummary) {
        let html = '<h3>Performance Insights</h3>';

        if (trend) {
            html += `
                <div class="insight-card">
                    <div class="insight-title">Performance Trend</div>
                    <div class="insight-content">${trend.message}</div>
                </div>
            `;
        }

        if (goalsSummary) {
            html += `
                <div class="insight-card">
                    <div class="insight-title">Goal Progress</div>
                    <div class="insight-stats">
                        <div class="insight-stat">
                            <span class="insight-stat-value">${goalsSummary.completed}</span>
                            <span class="insight-stat-label">Completed</span>
                        </div>
                        <div class="insight-stat">
                            <span class="insight-stat-value">${goalsSummary.active}</span>
                            <span class="insight-stat-label">Active</span>
                        </div>
                        <div class="insight-stat">
                            <span class="insight-stat-value">${Math.round(goalsSummary.completionRate)}%</span>
                            <span class="insight-stat-label">Success Rate</span>
                        </div>
                    </div>
                </div>
            `;
        }

        this.#elements.performanceInsights.innerHTML = html;
    }

    /**
     * Render recovery insights
     */
    renderRecoveryInsights(recoveryRec, sorenessPattern) {
        let html = '<h3>Recovery Insights</h3>';

        if (recoveryRec) {
            html += `
                <div class="insight-card">
                    <div class="insight-title">Recovery Status</div>
                    <div class="insight-content">
                        <strong>${recoveryRec.recommendation}</strong>
                        <p>${recoveryRec.reason}</p>
                        <ul>
                            ${recoveryRec.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        if (sorenessPattern && sorenessPattern.averageLevel > 0) {
            html += `
                <div class="insight-card">
                    <div class="insight-title">Soreness Pattern (14 days)</div>
                    <div class="insight-content">
                        <p>Average level: <strong>${sorenessPattern.averageLevel}</strong></p>
                        <p>Trend: <strong>${sorenessPattern.trend}</strong></p>
                        ${sorenessPattern.mostAffectedAreas.length > 0 ? `
                            <p>Most affected: ${sorenessPattern.mostAffectedAreas.map(a => MUSCLE_GROUPS[a]?.name || a).join(', ')}</p>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        this.#elements.recoveryInsights.innerHTML = html;
    }

    /**
     * Show goal creation modal
     */
    showGoalModal() {
        this.#elements.goalModal.classList.add('open');
    }

    /**
     * Hide goal creation modal
     */
    hideGoalModal() {
        this.#elements.goalModal.classList.remove('open');
        this.#elements.goalForm.reset();
    }

    /**
     * Show soreness logging modal
     */
    showSorenessModal() {
        this.#elements.sorenessModal.classList.add('open');
    }

    /**
     * Hide soreness logging modal
     */
    hideSorenessModal() {
        this.#elements.sorenessModal.classList.remove('open');
        this.#elements.sorenessForm.reset();
        // Reset soreness level text
        document.getElementById('sorenessLevelText').textContent = 'None';
    }

    /**
     * Render goal suggestion in completion modal
     */
    renderGoalSuggestion(suggestion) {
        if (!suggestion) {
            this.#elements.goalSuggestionCard.style.display = 'none';
            return;
        }

        const workoutName = WORKOUT_CONFIGS[suggestion.workoutType]?.name || 'Workout';
        const difficultyName = DIFFICULTY_LEVELS[suggestion.difficulty]?.name || '';

        this.#elements.goalSuggestionCard.innerHTML = `
            <div class="goal-suggestion-content">
                <h3>🎯 Your Coach Suggests a New Challenge!</h3>
                <div class="suggestion-message">
                    <strong>${workoutName} - ${difficultyName}</strong><br>
                    Target: <strong>${suggestion.targetReps} reps</strong> in <strong>${suggestion.targetDuration / 60} minutes</strong>
                </div>
                <div class="suggestion-reasoning">${suggestion.reasoning}</div>
                ${suggestion.deadline ? `
                    <div class="suggestion-deadline">Deadline: ${new Date(suggestion.deadline).toLocaleDateString()}</div>
                ` : ''}
                <div class="suggestion-actions">
                    <button class="suggestion-btn accept" id="acceptGoalBtn">✓ Accept Goal</button>
                    <button class="suggestion-btn modify" id="modifyGoalBtn">✏️ Modify</button>
                    <button class="suggestion-btn dismiss" id="dismissGoalBtn">Not Now</button>
                </div>
            </div>
        `;

        this.#elements.goalSuggestionCard.style.display = 'block';
    }

    /**
     * Hide goal suggestion card
     */
    hideGoalSuggestion() {
        this.#elements.goalSuggestionCard.style.display = 'none';
    }

    /**
     * Switch tabs in coach panel
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.coach-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.coach-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetTab = document.getElementById(`${tabName}Tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    /**
     * Get canvas element for charts (if needed in future)
     */
    getCoachPanel() {
        return this.#elements.coachPanel;
    }

    /**
     * Render progression suggestion in completion modal
     * @param {Object|null} suggestion - Progression suggestion from CoachService
     */
    renderProgressionSuggestion(suggestion) {
        if (!this.#elements.progressionSuggestionCard) return;

        if (!suggestion) {
            this.#elements.progressionSuggestionCard.style.display = 'none';
            return;
        }

        const ladder = PROGRESSION_LADDERS[suggestion.exerciseType];
        const exerciseName = ladder?.name || suggestion.exerciseType;

        if (suggestion.type === 'progress') {
            this.#elements.progressionSuggestionCard.innerHTML = `
                <div class="progression-suggestion-content">
                    <div class="progression-suggestion-header">
                        <span class="progression-icon">🎯</span>
                        <h3>Ready to Level Up!</h3>
                    </div>
                    <div class="progression-message">${suggestion.message}</div>
                    <div class="progression-details">
                        <div class="progression-current">
                            <span class="level-badge">Level ${suggestion.currentLevel}</span>
                            <span class="variation-name">${suggestion.currentVariation}</span>
                        </div>
                        <div class="progression-arrow">→</div>
                        <div class="progression-next">
                            <span class="level-badge level-up">Level ${suggestion.nextLevel}</span>
                            <span class="variation-name">${suggestion.nextVariation}</span>
                        </div>
                    </div>
                    ${suggestion.nextNote ? `
                        <div class="progression-note">
                            <strong>Form tip:</strong> ${suggestion.nextNote}
                        </div>
                    ` : ''}
                    <div class="progression-actions">
                        <button class="progression-btn accept" id="acceptProgressionBtn">Level Up!</button>
                        <button class="progression-btn dismiss" id="dismissProgressionBtn">Not Yet</button>
                    </div>
                </div>
            `;
        } else if (suggestion.type === 'regress') {
            this.#elements.progressionSuggestionCard.innerHTML = `
                <div class="progression-suggestion-content regression">
                    <div class="progression-suggestion-header">
                        <span class="progression-icon">💪</span>
                        <h3>Build Your Foundation</h3>
                    </div>
                    <div class="progression-message">${suggestion.message}</div>
                    <div class="progression-reason">
                        <em>${suggestion.reason}</em>
                    </div>
                    <div class="progression-details">
                        <div class="progression-current">
                            <span class="level-badge">Level ${suggestion.currentLevel}</span>
                            <span class="variation-name">${suggestion.currentVariation}</span>
                        </div>
                        <div class="progression-arrow">→</div>
                        <div class="progression-next">
                            <span class="level-badge level-down">Level ${suggestion.previousLevel}</span>
                            <span class="variation-name">${suggestion.previousVariation}</span>
                        </div>
                    </div>
                    <div class="progression-actions">
                        <button class="progression-btn accept" id="acceptProgressionBtn">Step Back</button>
                        <button class="progression-btn dismiss" id="dismissProgressionBtn">Stay Here</button>
                    </div>
                </div>
            `;
        }

        this.#elements.progressionSuggestionCard.style.display = 'block';
    }

    /**
     * Hide progression suggestion card
     */
    hideProgressionSuggestion() {
        if (this.#elements.progressionSuggestionCard) {
            this.#elements.progressionSuggestionCard.style.display = 'none';
        }
    }

    /**
     * Render current progression level info in coach panel
     * @param {string} exerciseType - The exercise type
     */
    renderProgressionInfo(exerciseType) {
        const summary = ProgressionService.getProgressionSummary(exerciseType);
        if (!summary) return '';

        return `
            <div class="progression-info">
                <div class="progression-level">
                    <span class="level-badge">Level ${summary.currentLevel}/${summary.maxLevel}</span>
                    <span class="variation-name">${summary.variation}</span>
                </div>
                ${summary.note ? `<div class="progression-note">${summary.note}</div>` : ''}
                <div class="progression-progress">
                    <span>Sessions: ${summary.sessionsAtLevel}/${summary.progressToNext.sessionsNeeded + summary.sessionsAtLevel}</span>
                    <span>Elite: ${summary.eliteCountAtLevel}/${summary.progressToNext.eliteNeeded + summary.eliteCountAtLevel}</span>
                </div>
            </div>
        `;
    }
}
