// Test Setup - Mock localStorage and other browser APIs
// =====================================================

// Mock localStorage
const localStorageMock = (() => {
    let store = {};

    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = String(value);
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (index) => {
            return Object.keys(store)[index] || null;
        }
    };
})();

// Set up global localStorage mock
Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Reset localStorage before each test
beforeEach(() => {
    localStorage.clear();
});

// Mock Date if needed for consistent testing
export function mockDate(isoString) {
    const RealDate = Date;
    const mockDate = new Date(isoString);

    global.Date = class extends RealDate {
        constructor(...args) {
            if (args.length === 0) {
                return mockDate;
            }
            return new RealDate(...args);
        }

        static now() {
            return mockDate.getTime();
        }
    };

    return () => {
        global.Date = RealDate;
    };
}

// Helper to create mock workout session
export function createMockSession(overrides = {}) {
    return {
        date: new Date().toISOString(),
        duration: 1200,
        reps: 100,
        calories: 150,
        fitnessLevel: 'Intermediate',
        workoutType: 'squats',
        difficulty: 'advanced',
        progressionLevel: 1,
        variation: 'Air Squat',
        ...overrides
    };
}

// Helper to create mock progression data
export function createMockProgression(overrides = {}) {
    return {
        currentLevel: 1,
        variation: 'Air Squat',
        startedDate: new Date().toISOString(),
        sessionsAtLevel: 0,
        eliteCountAtLevel: 0,
        ...overrides
    };
}
