// Timer Service - Manages workout timer with performance optimization
// =====================================================================

export class TimerService {
    #stateManager;
    #onTick;
    #onComplete;
    #intervalId = null;

    constructor(stateManager, { onTick, onComplete }) {
        this.#stateManager = stateManager;
        this.#onTick = onTick;
        this.#onComplete = onComplete;
    }

    /**
     * Start the timer
     */
    start() {
        if (this.#intervalId) {
            console.warn('Timer already running');
            return;
        }

        this.#intervalId = setInterval(() => {
            this.#tick();
        }, 1000);
    }

    /**
     * Stop the timer
     */
    stop() {
        if (this.#intervalId) {
            clearInterval(this.#intervalId);
            this.#intervalId = null;
        }
    }

    /**
     * Pause the timer
     */
    pause() {
        this.stop();
    }

    /**
     * Resume the timer
     */
    resume() {
        this.start();
    }

    /**
     * Check if timer is running
     */
    isRunning() {
        return this.#intervalId !== null;
    }

    /**
     * Timer tick handler
     */
    #tick() {
        const remaining = this.#stateManager.get('remainingSeconds');

        if (remaining > 0) {
            this.#stateManager.decrementTime();

            // Call tick callback
            if (this.#onTick) {
                this.#onTick(remaining - 1);
            }

            // Check if complete
            if (remaining - 1 === 0) {
                this.stop();
                if (this.#onComplete) {
                    this.#onComplete();
                }
            }
        } else {
            this.stop();
        }
    }

    /**
     * Get current interval ID (for debugging)
     */
    getIntervalId() {
        return this.#intervalId;
    }
}
