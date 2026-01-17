// Chart Service - Progress chart rendering with caching
// ======================================================

import { WORKOUT_TYPE_COLORS, CHART_CONFIG } from '../config/constants.js';
import { WORKOUT_CONFIGS } from '../config/constants.js';
import { getDateRange } from '../utils/dateUtils.js';

export class ChartService {
    #cache = new Map();
    #cacheTimeout = 60000; // Cache for 1 minute

    /**
     * Render progress chart with caching
     */
    renderChart(canvas, history, period = CHART_CONFIG.DEFAULT_PERIOD) {
        const cacheKey = this.#getCacheKey(history, period);

        // Check cache
        if (this.#cache.has(cacheKey)) {
            const cached = this.#cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.#cacheTimeout) {
                return cached.legend;
            }
        }

        // Render chart
        const legend = this.#renderChartInternal(canvas, history, period);

        // Cache result
        this.#cache.set(cacheKey, {
            legend,
            timestamp: Date.now()
        });

        return legend;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.#cache.clear();
    }

    /**
     * Internal chart rendering logic
     */
    #renderChartInternal(canvas, history, period) {
        if (!canvas || history.sessions.length === 0) {
            return '';
        }

        const ctx = canvas.getContext('2d');

        // Make chart larger on desktop for better clarity
        const isDesktop = window.innerWidth >= 768;
        const width = isDesktop ? 600 : CHART_CONFIG.CANVAS_WIDTH;
        const height = isDesktop ? 330 : CHART_CONFIG.CANVAS_HEIGHT;

        // Handle high-DPI displays
        const dpr = window.devicePixelRatio || 1;

        // Set canvas actual size (scaled for high-DPI)
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Set canvas display size (CSS pixels)
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Scale context to match DPI
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Get date range
        const dates = getDateRange(period);

        // Group workouts by type
        const workoutTypes = [...new Set(history.sessions.map(s => s.workoutType || 'burpees'))];

        // Create data series for each workout type
        const series = this.#buildDataSeries(history, dates, workoutTypes);

        // Find max reps for scaling
        const allReps = Object.values(series).flat();
        const maxReps = Math.max(...allReps, 1);

        // Chart dimensions
        const padding = isDesktop ? CHART_CONFIG.PADDING * 1.2 : CHART_CONFIG.PADDING;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Draw grid and axes
        this.#drawGrid(ctx, width, height, padding, chartHeight);
        this.#drawAxes(ctx, width, height, padding);

        // Draw data lines
        const pointSpacing = chartWidth / (dates.length - 1 || 1);
        workoutTypes.forEach(type => {
            this.#drawLine(ctx, series[type], type, padding, chartHeight, maxReps, pointSpacing, height);
        });

        // Draw axis labels
        this.#drawYAxisLabels(ctx, maxReps, padding, chartHeight);
        this.#drawXAxisLabels(ctx, dates, period, padding, pointSpacing, height);

        // Build legend HTML
        return this.#buildLegendHTML(workoutTypes, series);
    }

    /**
     * Build data series from history
     */
    #buildDataSeries(history, dates, workoutTypes) {
        const series = {};

        workoutTypes.forEach(type => {
            series[type] = dates.map(date => {
                const dateStr = date.toDateString();
                const dayWorkouts = history.sessions.filter(s => {
                    const sessionDate = new Date(s.date);
                    return sessionDate.toDateString() === dateStr &&
                           (s.workoutType || 'burpees') === type;
                });
                return dayWorkouts.reduce((sum, s) => sum + s.reps, 0);
            });
        });

        return series;
    }

    /**
     * Draw background grid
     */
    #drawGrid(ctx, width, height, padding, chartHeight) {
        const isDesktop = window.innerWidth >= 768;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isDesktop ? 1.5 : 1;

        for (let i = 0; i <= CHART_CONFIG.GRID_LINES; i++) {
            const y = padding + (chartHeight / CHART_CONFIG.GRID_LINES) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
    }

    /**
     * Draw axes
     */
    #drawAxes(ctx, width, height, padding) {
        const isDesktop = window.innerWidth >= 768;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isDesktop ? 2.5 : 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
    }

    /**
     * Draw data line for workout type
     */
    #drawLine(ctx, data, type, padding, chartHeight, maxReps, pointSpacing, height) {
        const color = WORKOUT_TYPE_COLORS[type] || '#E1523D';
        const isDesktop = window.innerWidth >= 768;

        // Skip if no data
        if (data.every(v => v === 0)) return;

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = isDesktop ? CHART_CONFIG.LINE_WIDTH * 1.2 : CHART_CONFIG.LINE_WIDTH;
        ctx.beginPath();

        let firstPoint = true;
        data.forEach((reps, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (reps / maxReps) * chartHeight;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        const pointRadius = isDesktop ? CHART_CONFIG.POINT_RADIUS * 1.2 : CHART_CONFIG.POINT_RADIUS;
        data.forEach((reps, index) => {
            if (reps > 0) {
                const x = padding + index * pointSpacing;
                const y = height - padding - (reps / maxReps) * chartHeight;

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
                ctx.fill();

                // Glow effect
                ctx.shadowBlur = isDesktop ? 10 : 8;
                ctx.shadowColor = color;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }

    /**
     * Draw Y-axis labels
     */
    #drawYAxisLabels(ctx, maxReps, padding, chartHeight) {
        const isDesktop = window.innerWidth >= 768;
        ctx.fillStyle = '#F5F5F5';
        ctx.font = `${isDesktop ? 12 : 10}px -apple-system, sans-serif`;
        ctx.textAlign = 'right';

        for (let i = 0; i <= CHART_CONFIG.GRID_LINES; i++) {
            const value = Math.round((maxReps / CHART_CONFIG.GRID_LINES) * (CHART_CONFIG.GRID_LINES - i));
            const y = padding + (chartHeight / CHART_CONFIG.GRID_LINES) * i;
            ctx.fillText(value, padding - 5, y + 3);
        }
    }

    /**
     * Draw X-axis labels
     */
    #drawXAxisLabels(ctx, dates, period, padding, pointSpacing, height) {
        const isDesktop = window.innerWidth >= 768;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#F5F5F5';
        ctx.font = `${isDesktop ? 12 : 10}px -apple-system, sans-serif`;

        const labelInterval = period === 7 ? 2 : 5;

        dates.forEach((date, index) => {
            if (index % labelInterval === 0 || index === dates.length - 1) {
                const x = padding + index * pointSpacing;
                const label = period === 7
                    ? date.toLocaleDateString('en-US', { weekday: 'short' })
                    : date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
                ctx.fillText(label, x, height - padding + 15);
            }
        });
    }

    /**
     * Build legend HTML
     */
    #buildLegendHTML(workoutTypes, series) {
        let html = '';

        workoutTypes.forEach(type => {
            if (!series[type].every(v => v === 0)) {
                const color = WORKOUT_TYPE_COLORS[type] || '#E1523D';
                const name = WORKOUT_CONFIGS[type]?.name || type;

                html += `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${color};"></div>
                        <span>${name}</span>
                    </div>
                `;
            }
        });

        return html;
    }

    /**
     * Generate cache key
     */
    #getCacheKey(history, period) {
        const sessionCount = history.sessions.length;
        const latestDate = history.sessions[0]?.date || '';
        return `${period}_${sessionCount}_${latestDate}`;
    }
}
