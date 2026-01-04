// Wake Lock Service - Screen wake lock management
// =================================================

export class WakeLockService {
    #wakeLock = null;
    #onError = null;

    constructor({ onError } = {}) {
        this.#onError = onError;

        // Re-acquire wake lock when page becomes visible
        document.addEventListener('visibilitychange', async () => {
            if (this.#wakeLock !== null &&
                document.visibilityState === 'visible') {
                await this.request();
            }
        });
    }

    /**
     * Request wake lock
     */
    async request() {
        if (!('wakeLock' in navigator)) {
            console.log('Wake Lock API not supported');
            return false;
        }

        try {
            this.#wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activated');

            this.#wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
            });

            return true;
        } catch (error) {
            console.error('Wake Lock request failed:', error);
            if (this.#onError) {
                this.#onError(error);
            }
            return false;
        }
    }

    /**
     * Release wake lock
     */
    async release() {
        if (this.#wakeLock) {
            try {
                await this.#wakeLock.release();
                this.#wakeLock = null;
                console.log('Wake Lock released manually');
                return true;
            } catch (error) {
                console.error('Wake Lock release failed:', error);
                if (this.#onError) {
                    this.#onError(error);
                }
                return false;
            }
        }
        return true;
    }

    /**
     * Check if wake lock is active
     */
    isActive() {
        return this.#wakeLock !== null;
    }
}
