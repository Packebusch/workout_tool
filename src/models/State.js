// State Manager - Centralized state with validation and change tracking
// =======================================================================

export class StateManager {
    #state = {
        totalSeconds: 1200,
        remainingSeconds: 1200,
        reps: 0,
        isRunning: false,
        isPaused: false,
        timerInterval: null,
        startTime: null,
        pausedTime: 0,
        lastMilestoneRep: 0,
        lastMilestoneTime: 1200,
        workoutType: 'burpees',
        difficulty: 'advanced',
        streak: 0,
        lastWorkoutDate: null,
        wakeLock: null,
    };

    #listeners = [];

    /**
     * Get current state (read-only copy)
     */
    getState() {
        return { ...this.#state };
    }

    /**
     * Get specific state value
     */
    get(key) {
        return this.#state[key];
    }

    /**
     * Update state with validation
     */
    setState(updates) {
        const validated = this.#validate(updates);
        const oldState = { ...this.#state };

        this.#state = { ...this.#state, ...validated };

        // Notify listeners of changes
        this.#notify(oldState, this.#state);
    }

    /**
     * Set specific state value
     */
    set(key, value) {
        this.setState({ [key]: value });
    }

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
        this.#listeners.push(callback);
        return () => {
            this.#listeners = this.#listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Reset to initial state
     */
    reset(difficulty = 'advanced') {
        const durationMap = {
            beginner: 600,
            intermediate: 900,
            advanced: 1200,
            elite: 1800
        };

        this.setState({
            totalSeconds: durationMap[difficulty],
            remainingSeconds: durationMap[difficulty],
            reps: 0,
            isRunning: false,
            isPaused: false,
            timerInterval: null,
            startTime: null,
            lastMilestoneRep: 0,
            lastMilestoneTime: durationMap[difficulty]
        });
    }

    /**
     * Validate state updates
     */
    #validate(updates) {
        const validated = { ...updates };

        // Validate reps
        if ('reps' in updates && updates.reps < 0) {
            console.warn('Invalid reps value, ignoring update');
            delete validated.reps;
        }

        // Validate remainingSeconds
        if ('remainingSeconds' in updates && updates.remainingSeconds < 0) {
            validated.remainingSeconds = 0;
        }

        // Validate totalSeconds
        if ('totalSeconds' in updates && updates.totalSeconds <= 0) {
            console.warn('Invalid totalSeconds, using default');
            validated.totalSeconds = 1200;
        }

        // Validate workout type
        if ('workoutType' in updates) {
            const validTypes = ['burpees', 'rows', 'pullups', 'squats', 'jumping-jacks', 'mountain-climbers'];
            if (!validTypes.includes(updates.workoutType)) {
                console.warn('Invalid workout type, using burpees');
                validated.workoutType = 'burpees';
            }
        }

        // Validate difficulty
        if ('difficulty' in updates) {
            const validDifficulties = ['beginner', 'intermediate', 'advanced', 'elite'];
            if (!validDifficulties.includes(updates.difficulty)) {
                console.warn('Invalid difficulty, using advanced');
                validated.difficulty = 'advanced';
            }
        }

        return validated;
    }

    /**
     * Notify listeners of state changes
     */
    #notify(oldState, newState) {
        this.#listeners.forEach(callback => {
            try {
                callback(newState, oldState);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }

    /**
     * Increment reps (convenience method - optimized for performance)
     */
    incrementReps() {
        // Direct update without validation/notification overhead for performance
        this.#state.reps++;
    }

    /**
     * Add multiple reps at once (convenience method - optimized for performance)
     */
    addReps(count) {
        // Direct update without validation/notification overhead for performance
        this.#state.reps += count;
    }

    /**
     * Decrement remaining time (convenience method)
     */
    decrementTime() {
        this.set('remainingSeconds', this.#state.remainingSeconds - 1);
    }
}
