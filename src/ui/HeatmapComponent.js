// Heatmap Component - Activity heatmap visualization
// ====================================================

import { WORKOUT_TYPE_COLORS, WORKOUT_CONFIGS } from '../config/constants.js';

export class HeatmapComponent {

    /** Convert Date to 'YYYY-MM-DD' key */
    static #toDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    /** Map session count to intensity level 0–4 */
    static #getLevel(count) {
        if (count <= 0) return 0;
        if (count === 1) return 1;
        if (count === 2) return 2;
        if (count === 3) return 3;
        return 4;
    }

    static #showTooltip(tooltip, cell, dateKey, data) {
        document.querySelectorAll('.heatmap-cell.tooltip-active').forEach(el => el.classList.remove('tooltip-active'));

        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        let content;
        if (!data || data.count === 0) {
            content = `<strong>${dateStr}</strong><br><span style="color:var(--text-secondary);font-size:0.85em">No workouts</span>`;
        } else {
            const typeDotsHTML = [...data.types].map(type => {
                const color = WORKOUT_TYPE_COLORS[type] || '#E1523D';
                const name = WORKOUT_CONFIGS[type]?.name || type;
                return `<span style="display:inline-flex;align-items:center;gap:3px;margin-right:4px"><span style="width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span>${name}</span>`;
            }).join('');
            content = `<strong>${dateStr}</strong><br>${data.count} workout${data.count !== 1 ? 's' : ''} · ${data.totalReps} reps<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:2px">${typeDotsHTML}</div>`;
        }

        tooltip.innerHTML = content;
        tooltip.classList.add('visible');
        cell.classList.add('tooltip-active');

        // Position above the cell, centered
        const cellRect = cell.getBoundingClientRect();
        const containerRect = tooltip.parentElement.getBoundingClientRect();
        const left = cellRect.left - containerRect.left + cellRect.width / 2;
        const top = cellRect.top - containerRect.top - 10;

        tooltip.style.transform = 'translate(-50%, -100%)';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    static #hideTooltip(tooltip) {
        tooltip.classList.remove('visible');
        document.querySelectorAll('.heatmap-cell.tooltip-active').forEach(el => el.classList.remove('tooltip-active'));
    }

    /**
     * Aggregate sessions into Map<'YYYY-MM-DD', {count, types, totalReps}>
     * @param {Array} sessions
     * @returns {Map}
     */
    static buildDayMap(sessions) {
        const map = new Map();
        for (const session of sessions) {
            const date = new Date(session.date);
            const key = HeatmapComponent.#toDateKey(date);
            if (!map.has(key)) {
                map.set(key, { count: 0, types: new Set(), totalReps: 0 });
            }
            const entry = map.get(key);
            entry.count++;
            entry.types.add(session.workoutType || 'burpees');
            entry.totalReps += session.reps || 0;
        }
        return map;
    }

    /**
     * Render full GitHub-style heatmap into container.
     * Shows last ~3 months (13 weeks). Mobile auto-scrolls right.
     * @param {HTMLElement} container
     * @param {Array} sessions
     * @param {boolean} isDesktop
     */
    static renderFull(container, sessions, isDesktop) {
        container.innerHTML = '';
        const dayMap = HeatmapComponent.buildDayMap(sessions);
        const numWeeks = 13; // ~3 months

        // Title
        const titleEl = document.createElement('h3');
        titleEl.className = 'section-title';
        titleEl.textContent = 'Activity';
        container.appendChild(titleEl);

        if (sessions.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'heatmap-empty';
            empty.textContent = 'Complete your first workout to see your activity here!';
            container.appendChild(empty);
            return;
        }

        // Tooltip (positioned absolutely within container)
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        container.appendChild(tooltip);

        // Scroll wrapper
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'heatmap-scroll-wrapper';
        container.appendChild(scrollWrapper);

        const inner = document.createElement('div');
        inner.className = 'heatmap-inner';
        scrollWrapper.appendChild(inner);

        // Date calculations
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayKey = HeatmapComponent.#toDateKey(today);

        // Start from the Sunday that is (numWeeks - 1) full weeks before the current week's Sunday
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - today.getDay() - (numWeeks - 1) * 7);

        const cellSize = isDesktop ? 13 : 10;
        const gapSize = 2;
        const weekWidth = cellSize + gapSize;

        // Build week data and detect month transitions
        const weeksData = [];
        const monthLabelItems = [];
        const cursor = new Date(startDate);

        for (let w = 0; w < numWeeks; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                week.push(new Date(cursor));
                cursor.setDate(cursor.getDate() + 1);
            }
            weeksData.push(week);

            const firstDay = week[0];
            if (w === 0 || firstDay.getMonth() !== weeksData[w - 1][0].getMonth()) {
                monthLabelItems.push({
                    weekIndex: w,
                    label: firstDay.toLocaleDateString('en-US', { month: 'short' })
                });
            }
        }

        // Month labels row
        const dayLabelWidth = 24;
        const monthRow = document.createElement('div');
        monthRow.style.cssText = `position:relative;height:16px;margin-left:${dayLabelWidth + gapSize}px;margin-bottom:2px;min-width:${numWeeks * weekWidth}px`;
        inner.appendChild(monthRow);

        monthLabelItems.forEach(({ weekIndex, label }) => {
            const el = document.createElement('span');
            el.style.cssText = `position:absolute;left:${weekIndex * weekWidth}px;font-size:10px;color:var(--text-secondary);white-space:nowrap`;
            el.textContent = label;
            monthRow.appendChild(el);
        });

        // Grid area: day-labels column + heatmap grid
        const gridArea = document.createElement('div');
        gridArea.style.cssText = 'display:flex;gap:4px;align-items:flex-start';
        inner.appendChild(gridArea);

        // Day labels (Mon, Wed, Fri only for compactness)
        const dayLabelCol = document.createElement('div');
        dayLabelCol.style.cssText = `display:flex;flex-direction:column;gap:${gapSize}px;width:${dayLabelWidth - gapSize}px;flex-shrink:0`;
        gridArea.appendChild(dayLabelCol);

        ['', 'Mon', '', 'Wed', '', 'Fri', ''].forEach(label => {
            const el = document.createElement('div');
            el.style.cssText = `height:${cellSize}px;line-height:${cellSize}px;font-size:9px;color:var(--text-secondary);text-align:right;padding-right:3px`;
            el.textContent = label;
            dayLabelCol.appendChild(el);
        });

        // Heatmap grid
        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';
        gridArea.appendChild(grid);

        const isMobileView = window.innerWidth < 1024;

        weeksData.forEach((week) => {
            const weekCol = document.createElement('div');
            weekCol.className = 'heatmap-week';
            grid.appendChild(weekCol);

            week.forEach((date) => {
                const dateKey = HeatmapComponent.#toDateKey(date);
                const isFuture = date > today;
                const isToday = dateKey === todayKey;
                const data = dayMap.get(dateKey);

                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';

                if (isFuture) {
                    cell.classList.add('level-future');
                } else {
                    cell.classList.add(`level-${HeatmapComponent.#getLevel(data?.count ?? 0)}`);
                }
                if (isToday) cell.classList.add('is-today');

                if (!isFuture) {
                    if (isMobileView) {
                        cell.addEventListener('click', (e) => {
                            e.stopPropagation();
                            HeatmapComponent.#showTooltip(tooltip, cell, dateKey, data);
                            setTimeout(() => {
                                document.addEventListener('click', () => HeatmapComponent.#hideTooltip(tooltip), { once: true });
                            }, 0);
                        });
                    } else {
                        cell.addEventListener('mouseenter', () => {
                            HeatmapComponent.#showTooltip(tooltip, cell, dateKey, data);
                        });
                        cell.addEventListener('mouseleave', () => {
                            HeatmapComponent.#hideTooltip(tooltip);
                        });
                    }
                }

                weekCol.appendChild(cell);
            });
        });

        // Legend
        const legend = document.createElement('div');
        legend.style.cssText = 'display:flex;align-items:center;gap:3px;margin-top:8px;justify-content:flex-end;font-size:10px;color:var(--text-secondary)';
        const lessLabel = document.createElement('span');
        lessLabel.textContent = 'Less';
        legend.appendChild(lessLabel);

        [0, 1, 2, 3, 4].forEach(level => {
            const cell = document.createElement('div');
            cell.className = `heatmap-cell level-${level}`;
            cell.style.display = 'inline-block';
            legend.appendChild(cell);
        });

        const moreLabel = document.createElement('span');
        moreLabel.textContent = 'More';
        legend.appendChild(moreLabel);
        container.appendChild(legend);

        // Auto-scroll to current week on mobile
        if (isMobileView) {
            requestAnimationFrame(() => {
                scrollWrapper.scrollLeft = scrollWrapper.scrollWidth;
            });
        }
    }

    /**
     * Render compact strip for the workout tab header.
     * Shows a rolling last-7-days window (oldest→today), no future cells.
     * @param {HTMLElement} container
     * @param {Array} sessions
     */
    static renderCompactWeek(container, sessions) {
        container.innerHTML = '';
        const dayMap = HeatmapComponent.buildDayMap(sessions);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayLetterMap = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        let count = 0;

        const wrapper = document.createElement('div');
        wrapper.className = 'compact-heatmap';

        const dotsWrapper = document.createElement('div');
        dotsWrapper.className = 'compact-heatmap-dots';

        // Rolling window: 6 days ago → today (7 days total, no future cells)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = HeatmapComponent.#toDateKey(date);
            const data = dayMap.get(dateKey);

            if (data) count += data.count;

            const dayCol = document.createElement('div');
            dayCol.className = 'compact-heatmap-day';

            const dot = document.createElement('div');
            dot.className = `compact-cell level-${HeatmapComponent.#getLevel(data?.count ?? 0)}`;

            const letterEl = document.createElement('span');
            letterEl.style.cssText = 'font-size:9px;color:var(--text-secondary)';
            letterEl.textContent = dayLetterMap[date.getDay()];

            dayCol.appendChild(dot);
            dayCol.appendChild(letterEl);
            dotsWrapper.appendChild(dayCol);
        }

        const countLabel = document.createElement('span');
        countLabel.className = 'compact-heatmap-count';
        countLabel.textContent = `${count} last 7 days`;

        wrapper.appendChild(dotsWrapper);
        wrapper.appendChild(countLabel);
        container.appendChild(wrapper);
    }
}
