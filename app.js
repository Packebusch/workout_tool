// Burpee Workout Tracker - Main Application
// ==========================================

// Workout Configurations
const workoutConfigs = {
    burpees: {
        name: 'Burpees',
        caloriesPerMinute: 10,
        caloriesPerRep: 1,
        repUnit: 'reps'
    },
    pushups: {
        name: 'Push-ups',
        caloriesPerMinute: 7,
        caloriesPerRep: 0.5,
        repUnit: 'reps'
    },
    squats: {
        name: 'Squats',
        caloriesPerMinute: 8,
        caloriesPerRep: 0.6,
        repUnit: 'reps'
    },
    'jumping-jacks': {
        name: 'Jumping Jacks',
        caloriesPerMinute: 9,
        caloriesPerRep: 0.4,
        repUnit: 'reps'
    },
    plank: {
        name: 'Plank Hold',
        caloriesPerMinute: 5,
        caloriesPerRep: 0,
        repUnit: 'seconds'
    },
    'mountain-climbers': {
        name: 'Mountain Climbers',
        caloriesPerMinute: 10,
        caloriesPerRep: 0.3,
        repUnit: 'reps'
    }
};

const difficultyLevels = {
    beginner: { duration: 600, name: 'Beginner' },      // 10 minutes
    intermediate: { duration: 900, name: 'Intermediate' }, // 15 minutes
    advanced: { duration: 1200, name: 'Advanced' },     // 20 minutes
    elite: { duration: 1800, name: 'Elite' }            // 30 minutes
};

// App State
const state = {
    totalSeconds: 1200, // Default 20 minutes
    remainingSeconds: 1200,
    reps: 0,
    isRunning: false,
    isPaused: false,
    timerInterval: null,
    startTime: null,
    pausedTime: 0,
    lastMilestoneRep: 0,
    lastMilestoneTime: 1200,
    burpeeAnimationInterval: null,
    workoutType: 'burpees',
    difficulty: 'advanced',
    streak: 0,
    lastWorkoutDate: null,
    wakeLock: null, // Screen Wake Lock
};

// DOM Elements
const elements = {
    timerDisplay: document.getElementById('timerDisplay'),
    progressBar: document.getElementById('progressBar'),
    repNumber: document.getElementById('repNumber'),
    countButton: document.getElementById('countButton'),
    motivationMessage: document.getElementById('motivationMessage'),
    calorieDisplay: document.getElementById('calorieDisplay'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    historyToggleBtn: document.getElementById('historyToggleBtn'),
    historyPanel: document.getElementById('historyPanel'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    historyList: document.getElementById('historyList'),
    historyStats: document.getElementById('historyStats'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    completionModal: document.getElementById('completionModal'),
    completionStats: document.getElementById('completionStats'),
    saveWorkoutBtn: document.getElementById('saveWorkoutBtn'),
    discardWorkoutBtn: document.getElementById('discardWorkoutBtn'),
    audioBeep: document.getElementById('audioBeep'),
    audioSuccess: document.getElementById('audioSuccess'),
    audioMilestone: document.getElementById('audioMilestone'),
    stickFigure: document.getElementById('stickFigure'),
    stickFigureSection: document.getElementById('stickFigureSection'),
    workoutType: document.getElementById('workoutType'),
    difficulty: document.getElementById('difficulty'),
    configSection: document.getElementById('configSection'),
    streakCount: document.getElementById('streakCount'),
    streakDisplay: document.getElementById('streakDisplay'),
    aboutToggle: document.getElementById('aboutToggle'),
    aboutDetails: document.getElementById('aboutDetails'),
};

// Motivational Messages
const motivationalMessages = {
    start: [
        "BEAST MODE ACTIVATED! Let's destroy this workout!",
        "Your future self will thank you. LET'S GO!",
        "20 minutes to legendary status. START NOW!",
        "Champions are made in moments like this!",
        "Time to prove what you're made of!",
    ],
    early: [
        "FIRE! You're absolutely crushing it!",
        "Look at you GO! Unstoppable energy!",
        "Every rep makes you STRONGER!",
        "You're making this look EASY!",
        "WARRIOR mentality! Keep pushing!",
    ],
    quarter: [
        "5 MINUTES CRUSHED! You're a POWERHOUSE!",
        "Quarter done! Your strength is UNMATCHED!",
        "This is YOUR time! DOMINATE!",
        "Look at that DETERMINATION!",
    ],
    mid: [
        "HALFWAY THERE! You're absolutely ON FIRE!",
        "10 minutes of PURE POWER! LEGENDARY!",
        "MIDPOINT MASTERY! You're UNSTOPPABLE!",
        "Feel that STRENGTH! You're a MACHINE!",
        "Your DEDICATION is INSPIRING!",
    ],
    threequarter: [
        "FINAL 5! Time to go ALL OUT!",
        "You're SO CLOSE! FINISH LIKE A CHAMPION!",
        "15 minutes DOWN! Your power is UNDENIABLE!",
        "GREATNESS is just minutes away!",
        "DIG DEEP! You've got THIS!",
    ],
    final: [
        "FINAL MINUTE! Leave EVERYTHING on the floor!",
        "60 SECONDS TO GLORY! PUSH HARDER!",
        "THIS IS IT! Show the world what you're made of!",
        "LEGENDARY FINISH! GO GO GO!",
        "ONE MORE MINUTE! Make it COUNT!",
    ],
    repMilestones: {
        10: "10 REPS! Strong start! 💪",
        25: "25 REPS! You're ON FIRE! 🔥",
        50: "50 REPS! HALFWAY TO 100! Keep SMASHING! 💥",
        75: "75 REPS! INCREDIBLE PACE! 🚀",
        100: "🎉 100 REPS! ABSOLUTE LEGEND! 🏆",
        125: "125 REPS! BEAST MODE ACTIVATED! 💪🔥",
        150: "150 REPS! You're UNSTOPPABLE! ⚡",
        175: "175 REPS! ELITE PERFORMANCE! 👑",
        200: "🌟 200 REPS! SUPERHUMAN ACHIEVED! 🌟",
        250: "250 REPS! BEYOND LEGENDARY! 🏆⚡💥",
        300: "⭐ 300 REPS! ABSOLUTE DOMINATION! ⭐",
    },
    performance: {
        crushing: "You're CRUSHING your pace! AMAZING!",
        onTrack: "Perfect pace! You're RIGHT ON TARGET!",
        strong: "Strong performance! Keep it up!",
        pushIt: "Come on! You can go FASTER!",
    },
};

// Audio Configuration
const audioConfig = {
    beepVolume: 0.3,
    successVolume: 0.4,
    milestoneVolume: 0.5,
};

// Initialize audio volumes
elements.audioBeep.volume = audioConfig.beepVolume;
elements.audioSuccess.volume = audioConfig.successVolume;
elements.audioMilestone.volume = audioConfig.milestoneVolume;

// ==========================================
// Timer Functions
// ==========================================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = formatTime(state.remainingSeconds);
    updateTimerColor();
    updateProgressBar();
}

function updateTimerColor() {
    const timerEl = elements.timerDisplay;
    timerEl.classList.remove('timer-fresh', 'timer-mid', 'timer-final', 'timer-critical');

    if (state.remainingSeconds > 900) { // 15+ min
        timerEl.classList.add('timer-fresh');
    } else if (state.remainingSeconds > 300) { // 5-15 min
        timerEl.classList.add('timer-mid');
    } else if (state.remainingSeconds > 60) { // 1-5 min
        timerEl.classList.add('timer-final');
    } else { // < 1 min
        timerEl.classList.add('timer-critical');
    }
}

function updateProgressBar() {
    const progress = ((state.totalSeconds - state.remainingSeconds) / state.totalSeconds) * 100;
    elements.progressBar.style.width = `${progress}%`;

    elements.progressBar.classList.remove('mid', 'final', 'critical');
    if (state.remainingSeconds <= 60) {
        elements.progressBar.classList.add('critical');
    } else if (state.remainingSeconds <= 300) {
        elements.progressBar.classList.add('final');
    } else if (state.remainingSeconds <= 900) {
        elements.progressBar.classList.add('mid');
    }
}

// ==========================================
// Screen Wake Lock & Haptic Feedback
// ==========================================

async function requestWakeLock() {
    // Prevent screen from sleeping during workout
    if ('wakeLock' in navigator) {
        try {
            state.wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activated - screen will stay awake');

            // Re-acquire wake lock if visibility changes
            state.wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
            });
        } catch (err) {
            console.log('Wake Lock failed:', err);
        }
    }
}

async function releaseWakeLock() {
    if (state.wakeLock) {
        try {
            await state.wakeLock.release();
            state.wakeLock = null;
            console.log('Wake Lock released manually');
        } catch (err) {
            console.log('Wake Lock release failed:', err);
        }
    }
}

// Re-acquire wake lock when page becomes visible again
document.addEventListener('visibilitychange', async () => {
    if (state.wakeLock !== null && document.visibilityState === 'visible' && state.isRunning && !state.isPaused) {
        await requestWakeLock();
    }
});

function hapticFeedback(pattern = 10) {
    // Vibration feedback for mobile
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

function startTimer() {
    if (state.isRunning) return;

    // Get selected workout type and difficulty
    state.workoutType = elements.workoutType.value;
    state.difficulty = elements.difficulty.value;
    state.totalSeconds = difficultyLevels[state.difficulty].duration;
    state.remainingSeconds = state.totalSeconds;
    state.lastMilestoneTime = state.totalSeconds;

    state.isRunning = true;
    state.isPaused = false;
    state.startTime = Date.now();

    // Hide config section and about section
    elements.configSection.style.display = 'none';
    if (elements.aboutToggle) {
        document.getElementById('aboutSection').style.display = 'none';
    }

    // Show start message
    const workoutName = workoutConfigs[state.workoutType].name;
    showMotivationalMessage(`${workoutName} - ${difficultyLevels[state.difficulty].name} mode! LET'S GO!`);
    playSound(elements.audioMilestone);

    // Request wake lock to keep screen awake
    requestWakeLock();

    // Show and animate stick figure
    elements.stickFigureSection.classList.add('active');
    startBurpeeAnimation();

    // Update UI
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.countButton.disabled = false;

    // Start countdown
    state.timerInterval = setInterval(() => {
        if (state.remainingSeconds > 0) {
            state.remainingSeconds--;
            updateTimerDisplay();
            updateMetrics();
            checkTimeBasedMilestones();

            if (state.remainingSeconds === 0) {
                finishWorkout();
            }
        }
    }, 1000);
}

function pauseTimer() {
    if (!state.isRunning) return;

    state.isPaused = !state.isPaused;

    if (state.isPaused) {
        clearInterval(state.timerInterval);
        stopBurpeeAnimation();
        elements.pauseBtn.textContent = 'Resume';
        elements.countButton.disabled = true;
        showMotivationalMessage("Paused - Take a breath!");
        // Release wake lock when paused
        releaseWakeLock();
    } else {
        // Resume: restart the timer interval and animation
        startBurpeeAnimation();
        elements.pauseBtn.textContent = 'Pause';
        elements.countButton.disabled = false;
        showMotivationalMessage("Back to work! Let's go!");
        // Re-request wake lock when resuming
        requestWakeLock();

        // Restart the countdown interval
        state.timerInterval = setInterval(() => {
            if (state.remainingSeconds > 0) {
                state.remainingSeconds--;
                updateTimerDisplay();
                updateMetrics();
                checkTimeBasedMilestones();

                if (state.remainingSeconds === 0) {
                    finishWorkout();
                }
            }
        }, 1000);
    }
}

function resetWorkout() {
    const confirmed = state.reps > 0 || state.remainingSeconds < state.totalSeconds
        ? confirm('Are you sure you want to reset? Current progress will be lost.')
        : true;

    if (!confirmed) return;

    clearInterval(state.timerInterval);
    stopBurpeeAnimation();
    releaseWakeLock(); // Release wake lock on reset

    // Reset to selected difficulty duration
    const selectedDifficulty = elements.difficulty.value;
    state.totalSeconds = difficultyLevels[selectedDifficulty].duration;
    state.remainingSeconds = state.totalSeconds;
    state.reps = 0;
    state.isRunning = false;
    state.isPaused = false;
    state.startTime = null;
    state.lastMilestoneRep = 0;
    state.lastMilestoneTime = state.totalSeconds;

    updateTimerDisplay();
    updateRepCounter();
    updateMetrics();

    // Show config section and about section again
    elements.configSection.style.display = 'block';
    if (elements.aboutToggle) {
        document.getElementById('aboutSection').style.display = 'block';
    }

    // Hide stick figure
    elements.stickFigureSection.classList.remove('active');

    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';
    elements.countButton.disabled = true;

    showMotivationalMessage("Ready to start? Choose your workout and hit Start!");
}

function finishWorkout() {
    clearInterval(state.timerInterval);
    stopBurpeeAnimation();
    releaseWakeLock(); // Release wake lock when workout completes
    state.isRunning = false;

    playSound(elements.audioMilestone);
    showMotivationalMessage("WORKOUT COMPLETE! Amazing job!");

    // Show completion modal
    showCompletionModal();
}

function checkTimeBasedMilestones() {
    const elapsed = state.totalSeconds - state.remainingSeconds;

    // Check for time milestones and show messages
    if (state.remainingSeconds === 900 && state.lastMilestoneTime !== 900) { // 15 min (5 min done)
        state.lastMilestoneTime = 900;
        playSound(elements.audioMilestone);
        showMotivationalMessage(getRandomMessage(motivationalMessages.quarter));
    } else if (state.remainingSeconds === 600 && state.lastMilestoneTime !== 600) { // 10 min (halfway)
        state.lastMilestoneTime = 600;
        playSound(elements.audioMilestone);
        showMotivationalMessage(getRandomMessage(motivationalMessages.mid));
    } else if (state.remainingSeconds === 300 && state.lastMilestoneTime !== 300) { // 5 min (15 min done)
        state.lastMilestoneTime = 300;
        playSound(elements.audioMilestone);
        showMotivationalMessage(getRandomMessage(motivationalMessages.threequarter));
    } else if (state.remainingSeconds === 60 && state.lastMilestoneTime !== 60) { // 1 min
        state.lastMilestoneTime = 60;
        playSound(elements.audioMilestone);
        showMotivationalMessage(getRandomMessage(motivationalMessages.final));
    }

    // Show periodic encouragement every 2 minutes in mid-workout
    if (elapsed > 120 && elapsed < 1080 && elapsed % 120 === 0) {
        if (state.remainingSeconds !== 900 && state.remainingSeconds !== 600 && state.remainingSeconds !== 300) {
            const messages = state.remainingSeconds > 600 ? motivationalMessages.early : motivationalMessages.mid;
            showMotivationalMessage(getRandomMessage(messages));
        }
    }
}

// ==========================================
// Rep Counter Functions
// ==========================================

function incrementRep() {
    if (!state.isRunning || state.isPaused) return;

    state.reps++;
    updateRepCounter();
    updateMetrics();

    // Haptic feedback - short vibration on each rep
    hapticFeedback(10);

    // Play sound and show animation
    playSound(elements.audioBeep);
    elements.repNumber.classList.add('celebrating');
    setTimeout(() => elements.repNumber.classList.remove('celebrating'), 500);

    // Check for rep milestones
    checkRepMilestones();
}

function updateRepCounter() {
    elements.repNumber.textContent = state.reps;
}

function checkRepMilestones() {
    const milestones = [10, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300];

    for (const milestone of milestones) {
        if (state.reps === milestone && state.lastMilestoneRep < milestone) {
            state.lastMilestoneRep = milestone;
            playSound(elements.audioSuccess);
            showMotivationalMessage(motivationalMessages.repMilestones[milestone]);
            elements.countButton.classList.add('celebrating');
            setTimeout(() => elements.countButton.classList.remove('celebrating'), 500);

            // Haptic feedback pattern for milestones - double pulse
            if (milestone >= 100) {
                hapticFeedback([50, 100, 50]); // Stronger pattern for major milestones
            } else {
                hapticFeedback([30, 50, 30]); // Medium pattern
            }

            // Extra celebration for major milestones
            if (milestone >= 100) {
                document.body.classList.add('celebrating');
                setTimeout(() => document.body.classList.remove('celebrating'), 800);
            }
            break;
        }
    }

    // Performance-based motivation every 30 reps (but not on milestones)
    if (state.reps % 30 === 0 && state.reps > 0 && !milestones.includes(state.reps)) {
        const elapsedMinutes = (state.totalSeconds - state.remainingSeconds) / 60;
        const pace = elapsedMinutes > 0 ? state.reps / elapsedMinutes : 0;

        let message;
        if (pace > 8) {
            message = motivationalMessages.performance.crushing;
        } else if (pace > 6) {
            message = motivationalMessages.performance.onTrack;
        } else if (pace > 4) {
            message = motivationalMessages.performance.strong;
        } else {
            message = motivationalMessages.performance.pushIt;
        }

        showMotivationalMessage(message);
    }
}

// ==========================================
// Metrics Functions
// ==========================================

function updateMetrics() {
    updateCalories();
}

function updateCalories() {
    const elapsedMinutes = (state.totalSeconds - state.remainingSeconds) / 60;
    const config = workoutConfigs[state.workoutType];

    // Dynamic formula based on workout type
    const calories = Math.round((elapsedMinutes * config.caloriesPerMinute) + (state.reps * config.caloriesPerRep));
    elements.calorieDisplay.textContent = calories;
}


function calculateFitnessLevel(reps, duration) {
    const repsPerMin = reps / (duration / 60);

    if (repsPerMin >= 10) return 'Elite';
    if (repsPerMin >= 7) return 'Advanced';
    if (repsPerMin >= 4) return 'Intermediate';
    return 'Beginner';
}

// ==========================================
// Motivational Functions
// ==========================================

function showMotivationalMessage(message) {
    elements.motivationMessage.textContent = message;
    elements.motivationMessage.style.animation = 'none';
    setTimeout(() => {
        elements.motivationMessage.style.animation = 'fadeIn 0.5s ease';
    }, 10);
}

function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

function playSound(audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(err => {
        // Silently handle audio errors (user may not have interacted yet)
        console.log('Audio playback prevented:', err.message);
    });
}

// ==========================================
// Stick Figure Animation Functions
// ==========================================

function startBurpeeAnimation() {
    // Animate burpee motion: standing -> down -> standing
    let isDown = false;

    state.burpeeAnimationInterval = setInterval(() => {
        if (isDown) {
            elements.stickFigure.classList.remove('burpee-down');
        } else {
            elements.stickFigure.classList.add('burpee-down');
        }
        isDown = !isDown;
    }, 1000); // Complete cycle every 2 seconds
}

function stopBurpeeAnimation() {
    if (state.burpeeAnimationInterval) {
        clearInterval(state.burpeeAnimationInterval);
        state.burpeeAnimationInterval = null;
        elements.stickFigure.classList.remove('burpee-down');
    }
}

// ==========================================
// Streak Functions
// ==========================================

function updateStreak() {
    const today = new Date().toDateString();
    const streakData = getStreakData();

    // Check if already worked out today
    if (streakData.lastWorkoutDate === today) {
        return; // Already counted today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (streakData.lastWorkoutDate === yesterdayStr) {
        // Continue streak
        streakData.streak++;
    } else if (streakData.lastWorkoutDate === null || streakData.lastWorkoutDate === '') {
        // First workout
        streakData.streak = 1;
    } else {
        // Streak broken, start new
        streakData.streak = 1;
    }

    streakData.lastWorkoutDate = today;
    streakData.longestStreak = Math.max(streakData.longestStreak || 0, streakData.streak);

    localStorage.setItem('workoutStreak', JSON.stringify(streakData));
    displayStreak();
}

function getStreakData() {
    const stored = localStorage.getItem('workoutStreak');
    return stored ? JSON.parse(stored) : {
        streak: 0,
        lastWorkoutDate: null,
        longestStreak: 0
    };
}

function displayStreak() {
    const streakData = getStreakData();
    state.streak = streakData.streak;
    elements.streakCount.textContent = streakData.streak;

    // Check if need rest day
    const today = new Date().toDateString();
    if (streakData.lastWorkoutDate !== today && streakData.streak >= 6) {
        showRestDayReminder();
    }
}

function showRestDayReminder() {
    const shouldRest = state.streak >= 6;
    if (shouldRest) {
        elements.streakDisplay.style.color = '#ffaa00';
        elements.streakDisplay.title = 'You\'ve worked out 6+ days straight! Consider taking a rest day for recovery.';
    } else {
        elements.streakDisplay.style.color = '';
        elements.streakDisplay.title = '';
    }
}

// ==========================================
// Progressive Overload Tracking Functions
// ==========================================

function getProgressComparison() {
    const history = getWorkoutHistory();
    if (history.sessions.length === 0) return null;

    // Find last workout of same type and difficulty
    const similar = history.sessions.find(s =>
        s.workoutType === state.workoutType &&
        s.difficulty === state.difficulty
    );

    if (!similar) return null;

    const lastReps = similar.reps;
    const currentReps = state.reps;
    const improvement = Math.round(((currentReps - lastReps) / lastReps) * 100);

    return {
        lastReps,
        currentReps,
        improvement
    };
}

// ==========================================
// Personal Records Tracking
// ==========================================

function getPersonalRecord() {
    const history = getWorkoutHistory();
    if (history.sessions.length === 0) return null;

    // Find best performance for same workout type and difficulty
    const similar = history.sessions.filter(s =>
        s.workoutType === state.workoutType &&
        s.difficulty === state.difficulty
    );

    if (similar.length === 0) return null;

    // Find the session with most reps
    const bestSession = similar.reduce((best, current) =>
        current.reps > best.reps ? current : best
    );

    const currentReps = state.reps;
    const recordReps = bestSession.reps;
    const isNewRecord = currentReps > recordReps;
    const improvement = isNewRecord ? currentReps - recordReps : 0;

    return {
        recordReps,
        currentReps,
        isNewRecord,
        improvement,
        recordDate: bestSession.date
    };
}

function getProgressionSuggestion() {
    const history = getWorkoutHistory();

    // Get last 3 workouts of same type
    const sameType = history.sessions.filter(s => s.workoutType === state.workoutType).slice(0, 3);

    if (sameType.length < 3) return null;

    // Check if all 3 were same difficulty and user performed well
    const allSameDifficulty = sameType.every(s => s.difficulty === state.difficulty);
    if (!allSameDifficulty) return null;

    // Check if trending upward or maintaining high performance
    const avgReps = sameType.reduce((sum, s) => sum + s.reps, 0) / sameType.length;
    const targetReps = getTargetReps(state.workoutType, state.difficulty);

    // If consistently beating target, suggest harder difficulty
    if (avgReps > targetReps * 1.1) {
        const nextDifficulty = getNextDifficulty(state.difficulty);
        if (nextDifficulty) {
            return `Ready to level up? Try ${difficultyLevels[nextDifficulty].name} mode!`;
        }
    }

    return null;
}

function getTargetReps(workoutType, difficulty) {
    // Target reps based on difficulty (rough estimates)
    const targets = {
        beginner: { burpees: 50, pushups: 100, squats: 100, 'jumping-jacks': 200, plank: 300, 'mountain-climbers': 150 },
        intermediate: { burpees: 90, pushups: 180, squats: 150, 'jumping-jacks': 350, plank: 500, 'mountain-climbers': 250 },
        advanced: { burpees: 120, pushups: 240, squats: 200, 'jumping-jacks': 450, plank: 700, 'mountain-climbers': 350 },
        elite: { burpees: 180, pushups: 360, squats: 300, 'jumping-jacks': 700, plank: 1000, 'mountain-climbers': 500 }
    };

    return targets[difficulty]?.[workoutType] || 100;
}

function getNextDifficulty(current) {
    const levels = ['beginner', 'intermediate', 'advanced', 'elite'];
    const currentIndex = levels.indexOf(current);
    if (currentIndex < levels.length - 1) {
        return levels[currentIndex + 1];
    }
    return null;
}

function calculateTrend(sessions) {
    if (sessions.length < 3) return 'neutral';

    // Simple linear regression to detect trend
    const reps = sessions.map(s => s.reps);
    const avg = reps.reduce((a, b) => a + b, 0) / reps.length;
    const recent = reps.slice(0, Math.ceil(reps.length / 2));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

    if (recentAvg > avg * 1.05) return 'improving';
    if (recentAvg < avg * 0.95) return 'declining';
    return 'plateau';
}

function getLastWeekStats(sessions) {
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14); // 2 weeks ago
    const lastWeekEnd = new Date(now);
    lastWeekEnd.setDate(now.getDate() - 7); // 1 week ago

    const lastWeekSessions = sessions.filter(s => {
        const date = new Date(s.date);
        return date >= lastWeekStart && date < lastWeekEnd;
    });

    if (lastWeekSessions.length === 0) return null;

    const totalReps = lastWeekSessions.reduce((sum, s) => sum + s.reps, 0);
    return {
        avgReps: totalReps / lastWeekSessions.length,
        count: lastWeekSessions.length
    };
}

function getThisWeekStats(sessions) {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7); // 1 week ago

    const thisWeekSessions = sessions.filter(s => {
        const date = new Date(s.date);
        return date >= thisWeekStart;
    });

    if (thisWeekSessions.length === 0) return null;

    const totalReps = thisWeekSessions.reduce((sum, s) => sum + s.reps, 0);
    return {
        avgReps: totalReps / thisWeekSessions.length,
        count: thisWeekSessions.length
    };
}

function compareWeeks(thisWeek, lastWeek) {
    if (!thisWeek || !lastWeek) return null;

    const improvement = ((thisWeek.avgReps - lastWeek.avgReps) / lastWeek.avgReps) * 100;
    return Math.round(improvement);
}

// ==========================================
// History Functions
// ==========================================

function saveWorkoutToHistory() {
    const workout = {
        date: new Date().toISOString(),
        duration: state.totalSeconds - state.remainingSeconds,
        reps: state.reps,
        calories: parseInt(elements.calorieDisplay.textContent),
        fitnessLevel: calculateFitnessLevel(state.reps, state.totalSeconds - state.remainingSeconds),
        workoutType: state.workoutType,
        difficulty: state.difficulty,
    };

    const history = getWorkoutHistory();
    history.sessions.unshift(workout); // Add to beginning

    // Keep only last 50 workouts
    if (history.sessions.length > 50) {
        history.sessions = history.sessions.slice(0, 50);
    }

    localStorage.setItem('burpeeWorkoutHistory', JSON.stringify(history));

    // Update streak
    updateStreak();
}

function getWorkoutHistory() {
    const stored = localStorage.getItem('burpeeWorkoutHistory');
    return stored ? JSON.parse(stored) : { sessions: [] };
}

// ==========================================
// Lifetime Stats Dashboard
// ==========================================

function renderLifetimeStats() {
    const history = getWorkoutHistory();
    const lifetimeStatsEl = document.getElementById('lifetimeStats');

    if (history.sessions.length === 0) {
        lifetimeStatsEl.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">Complete your first workout to see lifetime stats!</p>';
        return;
    }

    // Calculate lifetime totals
    const totalWorkouts = history.sessions.length;
    const totalReps = history.sessions.reduce((sum, s) => sum + s.reps, 0);
    const totalCalories = history.sessions.reduce((sum, s) => sum + s.calories, 0);
    const totalDuration = history.sessions.reduce((sum, s) => sum + s.duration, 0);

    // Calculate most productive day of week
    const dayOfWeekCounts = {};
    history.sessions.forEach(session => {
        const day = new Date(session.date).getDay();
        dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
    });
    const mostProductiveDay = Object.keys(dayOfWeekCounts).reduce((a, b) =>
        dayOfWeekCounts[a] > dayOfWeekCounts[b] ? a : b
    );
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostProductiveDayName = dayNames[mostProductiveDay];

    // Format total time
    const totalHours = Math.floor(totalDuration / 3600);
    const totalMinutes = Math.floor((totalDuration % 3600) / 60);

    lifetimeStatsEl.innerHTML = `
        <h3>Lifetime Stats</h3>
        <div class="lifetime-grid">
            <div class="lifetime-stat-box">
                <div class="lifetime-stat-value">${totalWorkouts}</div>
                <div class="lifetime-stat-label">Workouts</div>
            </div>
            <div class="lifetime-stat-box">
                <div class="lifetime-stat-value">${totalReps.toLocaleString()}</div>
                <div class="lifetime-stat-label">Total Reps</div>
            </div>
            <div class="lifetime-stat-box">
                <div class="lifetime-stat-value">${totalCalories.toLocaleString()}</div>
                <div class="lifetime-stat-label">Calories</div>
            </div>
            <div class="lifetime-stat-box">
                <div class="lifetime-stat-value">${totalHours}h ${totalMinutes}m</div>
                <div class="lifetime-stat-label">Total Time</div>
            </div>
        </div>
        <div class="lifetime-insights">
            <div class="lifetime-insights-text">💪 Most productive day: ${mostProductiveDayName}</div>
        </div>
    `;
}

// ==========================================
// Progress Chart
// ==========================================

let currentChartPeriod = 7;
let currentChartType = 'all';

function renderProgressChart(period = currentChartPeriod, workoutType = currentChartType) {
    const history = getWorkoutHistory();
    const canvas = document.getElementById('progressChart');

    if (!canvas || history.sessions.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get last N days of data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dataPoints = [];
    for (let i = period - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        // Find workouts on this day, filtered by workout type
        const dayWorkouts = history.sessions.filter(s => {
            const sessionDate = new Date(s.date);
            const matchesDate = sessionDate.toDateString() === dateStr;
            const matchesType = workoutType === 'all' || s.workoutType === workoutType;
            return matchesDate && matchesType;
        });

        // Sum reps for the day
        const totalReps = dayWorkouts.reduce((sum, s) => sum + s.reps, 0);
        dataPoints.push({ date, reps: totalReps });
    }

    // Find max reps for scaling
    const maxReps = Math.max(...dataPoints.map(d => d.reps), 1);

    // Chart dimensions
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const pointSpacing = chartWidth / (dataPoints.length - 1 || 1);

    // Draw background grid
    ctx.strokeStyle = 'rgba(225, 82, 61, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#E1523D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw data line
    if (dataPoints.length > 0) {
        ctx.strokeStyle = '#E1523D';
        ctx.fillStyle = 'rgba(225, 82, 61, 0.2)';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(padding, height - padding);

        dataPoints.forEach((point, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (point.reps / maxReps) * chartHeight;

            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        // Close path for fill
        ctx.lineTo(padding + (dataPoints.length - 1) * pointSpacing, height - padding);
        ctx.closePath();
        ctx.fill();

        // Draw line
        ctx.beginPath();
        dataPoints.forEach((point, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (point.reps / maxReps) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw data points
        dataPoints.forEach((point, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (point.reps / maxReps) * chartHeight;

            ctx.fillStyle = point.reps > 0 ? '#E1523D' : 'rgba(225, 82, 61, 0.3)';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Add glow effect for non-zero points
            if (point.reps > 0) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#E1523D';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }

    // Draw Y-axis labels
    ctx.fillStyle = '#F5F5F5';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const value = Math.round((maxReps / 4) * (4 - i));
        const y = padding + (chartHeight / 4) * i;
        ctx.fillText(value, padding - 5, y + 3);
    }

    // Draw X-axis labels (every other day for 7-day, every 5 days for 30-day)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F5F5F5';
    const labelInterval = period === 7 ? 2 : 5;
    dataPoints.forEach((point, index) => {
        if (index % labelInterval === 0 || index === dataPoints.length - 1) {
            const x = padding + index * pointSpacing;
            const label = period === 7
                ? point.date.toLocaleDateString('en-US', { weekday: 'short' })
                : point.date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
            ctx.fillText(label, x, height - padding + 15);
        }
    });
}

function renderHistory() {
    const history = getWorkoutHistory();

    if (history.sessions.length === 0) {
        elements.historyList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No workout history yet. Complete a workout to see it here!</p>';
        elements.historyStats.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">No statistics available</p>';
        document.getElementById('lifetimeStats').innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">Complete your first workout to see lifetime stats!</p>';
        return;
    }

    // Render lifetime stats and progress chart
    renderLifetimeStats();
    renderProgressChart();

    // Calculate overall statistics
    const totalWorkouts = history.sessions.length;
    const totalCalories = history.sessions.reduce((sum, s) => sum + s.calories, 0);

    // Group sessions by workout type
    const byType = {};
    history.sessions.forEach(session => {
        const type = session.workoutType || 'burpees';
        if (!byType[type]) {
            byType[type] = [];
        }
        byType[type].push(session);
    });

    // Calculate stats per workout type
    const typeStats = Object.keys(byType).map(type => {
        const sessions = byType[type];
        const config = workoutConfigs[type];
        const totalReps = sessions.reduce((sum, s) => sum + s.reps, 0);
        const avgReps = Math.round(totalReps / sessions.length);
        const bestReps = Math.max(...sessions.map(s => s.reps));

        // Calculate trend
        const trend = calculateTrend(sessions);

        // Calculate week-over-week comparison
        const lastWeek = getLastWeekStats(sessions);
        const thisWeek = getThisWeekStats(sessions);

        return {
            type,
            name: config?.name || 'Unknown',
            count: sessions.length,
            avgReps,
            bestReps,
            trend,
            weekComparison: compareWeeks(thisWeek, lastWeek)
        };
    }).sort((a, b) => b.count - a.count); // Sort by most frequent

    // Render stats
    let statsHTML = `
        <div class="overall-stats">
            <h3 style="color: #ff6b9d; font-size: 0.9rem; margin-bottom: 12px; text-shadow: 0 0 6px rgba(255, 107, 157, 0.5);">Overall Stats</h3>
            <div class="stat-row">
                <span class="stat-label">Total Workouts:</span>
                <span class="stat-value">${totalWorkouts}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Total Calories Burned:</span>
                <span class="stat-value">${totalCalories}</span>
            </div>
        </div>
    `;

    if (typeStats.length > 0) {
        statsHTML += `
            <div class="type-stats" style="margin-top: 20px;">
                <h3 style="color: #ffaa00; font-size: 0.9rem; margin-bottom: 12px; text-shadow: 0 0 6px rgba(255, 170, 0, 0.5);">By Workout Type</h3>
        `;

        typeStats.forEach(stat => {
            // Trend indicator
            const trendIcon = stat.trend === 'improving' ? '📈' : stat.trend === 'declining' ? '📉' : '➡️';
            const trendColor = stat.trend === 'improving' ? '#00ffcc' : stat.trend === 'declining' ? '#ff6b9d' : '#ffaa00';
            const trendText = stat.trend === 'improving' ? 'Improving!' : stat.trend === 'declining' ? 'Declining' : 'Steady';

            // Week comparison
            let weekHTML = '';
            if (stat.weekComparison) {
                const weekArrow = stat.weekComparison > 0 ? '↑' : stat.weekComparison < 0 ? '↓' : '→';
                const weekColor = stat.weekComparison > 0 ? '#00ffcc' : stat.weekComparison < 0 ? '#ff6b9d' : '#ffaa00';
                weekHTML = `<span style="color: ${weekColor};">${weekArrow} ${Math.abs(stat.weekComparison)}% vs last week</span>`;
            }

            statsHTML += `
                <div class="type-stat-item" style="margin-bottom: 12px; padding: 10px; background: rgba(0, 255, 204, 0.05); border-radius: 8px; border: 1px solid rgba(0, 255, 204, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="color: #00ffcc; font-weight: 700; font-size: 0.85rem;">${stat.name}</div>
                        <div style="color: ${trendColor}; font-size: 0.75rem; font-weight: 600;">${trendIcon} ${trendText}</div>
                    </div>
                    <div style="display: flex; gap: 15px; font-size: 0.75rem; flex-wrap: wrap;">
                        <span style="color: rgba(255, 255, 255, 0.7);">${stat.count} sessions</span>
                        <span style="color: rgba(255, 255, 255, 0.7);">Avg: ${stat.avgReps}</span>
                        <span style="color: rgba(255, 255, 255, 0.7);">Best: ${stat.bestReps}</span>
                        ${weekHTML ? `<span>${weekHTML}</span>` : ''}
                    </div>
                </div>
            `;
        });

        statsHTML += '</div>';
    }

    elements.historyStats.innerHTML = statsHTML;

    // Render workout list
    elements.historyList.innerHTML = history.sessions.map(session => {
        const date = new Date(session.date);
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const durationStr = formatTime(session.duration);
        const workoutName = session.workoutType ? workoutConfigs[session.workoutType]?.name || 'Burpees' : 'Burpees';
        const difficultyName = session.difficulty ? difficultyLevels[session.difficulty]?.name || '' : '';

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

function clearHistory() {
    const confirmed = confirm('Are you sure you want to clear all workout history? This cannot be undone.');
    if (confirmed) {
        localStorage.removeItem('burpeeWorkoutHistory');
        renderHistory();
        showMotivationalMessage('History cleared!');
    }
}

function toggleHistory() {
    elements.historyPanel.classList.toggle('open');
    if (elements.historyPanel.classList.contains('open')) {
        renderHistory();
    }
}

// ==========================================
// Import/Export Functions
// ==========================================

function exportHistory() {
    const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        history: JSON.parse(localStorage.getItem('burpeeWorkoutHistory') || '{"sessions":[]}'),
        streak: JSON.parse(localStorage.getItem('workoutStreak') || '{"streak":0,"lastWorkoutDate":null,"longestStreak":0}')
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMotivationalMessage('History exported successfully!');
}

function importHistory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Validate data structure
                if (!data.history || !data.streak) {
                    throw new Error('Invalid file format. Missing required data.');
                }

                if (!data.history.sessions || !Array.isArray(data.history.sessions)) {
                    throw new Error('Invalid history format.');
                }

                // Ask user: merge or replace
                const merge = confirm(
                    'Import options:\n\n' +
                    'OK = Merge with existing data (recommended)\n' +
                    'Cancel = Replace all existing data\n\n' +
                    'Choose wisely!'
                );

                if (merge) {
                    mergeHistory(data);
                    showMotivationalMessage('History merged successfully!');
                } else {
                    localStorage.setItem('burpeeWorkoutHistory', JSON.stringify(data.history));
                    localStorage.setItem('workoutStreak', JSON.stringify(data.streak));
                    showMotivationalMessage('History replaced successfully!');
                }

                // Refresh displays
                displayStreak();
                renderHistory();

            } catch (err) {
                alert('Error importing file: ' + err.message);
                console.error('Import error:', err);
            }
        };

        reader.onerror = () => {
            alert('Error reading file. Please try again.');
        };

        reader.readAsText(file);
    };

    input.click();
}

function mergeHistory(importedData) {
    const existing = getWorkoutHistory();
    const existingStreak = getStreakData();

    // Merge sessions (avoiding duplicates by exact date match)
    const existingDates = new Set(existing.sessions.map(s => s.date));
    const newSessions = importedData.history.sessions.filter(s => !existingDates.has(s.date));

    existing.sessions = [...existing.sessions, ...newSessions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50); // Keep max 50 most recent

    // Merge streaks - use the better values
    const mergedStreak = {
        streak: Math.max(existingStreak.streak || 0, importedData.streak.streak || 0),
        lastWorkoutDate: existingStreak.lastWorkoutDate || importedData.streak.lastWorkoutDate,
        longestStreak: Math.max(
            existingStreak.longestStreak || 0,
            importedData.streak.longestStreak || 0
        )
    };

    // Update most recent workout date
    if (importedData.streak.lastWorkoutDate) {
        const importedDate = new Date(importedData.streak.lastWorkoutDate);
        const existingDate = existingStreak.lastWorkoutDate ? new Date(existingStreak.lastWorkoutDate) : new Date(0);

        if (importedDate > existingDate) {
            mergedStreak.lastWorkoutDate = importedData.streak.lastWorkoutDate;
            mergedStreak.streak = importedData.streak.streak;
        }
    }

    localStorage.setItem('burpeeWorkoutHistory', JSON.stringify(existing));
    localStorage.setItem('workoutStreak', JSON.stringify(mergedStreak));
}

// ==========================================
// Completion Modal Functions
// ==========================================

function showCompletionModal() {
    const elapsedSeconds = state.totalSeconds - state.remainingSeconds;
    const calories = parseInt(elements.calorieDisplay.textContent);
    const fitnessLevel = calculateFitnessLevel(state.reps, elapsedSeconds);

    // Get comparison to last similar workout
    const comparison = getProgressComparison();

    let comparisonHTML = '';
    if (comparison) {
        const arrow = comparison.improvement > 0 ? '↑' : comparison.improvement < 0 ? '↓' : '→';
        const color = comparison.improvement > 0 ? '#00ffcc' : comparison.improvement < 0 ? '#ff6b9d' : '#ffaa00';
        const message = comparison.improvement > 0
            ? `${Math.abs(comparison.improvement)}% BETTER than last time!`
            : comparison.improvement < 0
            ? `${Math.abs(comparison.improvement)}% below last time`
            : 'Same as last time';

        comparisonHTML = `
            <div class="progress-comparison" style="background: rgba(0, 255, 204, 0.05); border: 2px solid ${color}; border-radius: 12px; padding: 15px; margin: 15px 0;">
                <div style="font-size: 2rem; color: ${color}; text-align: center; margin-bottom: 8px; text-shadow: 0 0 10px ${color};">${arrow}</div>
                <div style="font-size: 0.95rem; color: ${color}; font-weight: 700; text-align: center; text-shadow: 0 0 8px ${color};">${message}</div>
                <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6); text-align: center; margin-top: 6px;">Last: ${comparison.lastReps} reps → Now: ${state.reps} reps</div>
            </div>
        `;
    }

    // Check for personal record
    const record = getPersonalRecord();
    let recordHTML = '';
    if (record && record.isNewRecord) {
        recordHTML = `
            <div class="personal-record" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 107, 157, 0.15)); border: 3px solid #FFD700; border-radius: 12px; padding: 18px; margin: 15px 0; animation: pulse 2s infinite;">
                <div style="font-size: 2.5rem; text-align: center; margin-bottom: 8px;">🏆</div>
                <div style="font-size: 1.1rem; color: #FFD700; font-weight: 700; text-align: center; text-shadow: 0 0 10px rgba(255, 215, 0, 0.6); text-transform: uppercase; letter-spacing: 1px;">NEW PERSONAL RECORD!</div>
                <div style="font-size: 0.85rem; color: #00ffcc; text-align: center; margin-top: 8px;">+${record.improvement} reps better than your best!</div>
                <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.7); text-align: center; margin-top: 6px;">Previous record: ${record.recordReps} reps</div>
            </div>
        `;
        // Haptic celebration for new record!
        hapticFeedback([100, 50, 100, 50, 100]);
    } else if (record) {
        const diff = record.recordReps - record.currentReps;
        recordHTML = `
            <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); text-align: center; margin: 10px 0;">
                Your record: ${record.recordReps} reps (${diff} reps away)
            </div>
        `;
    }

    // Check for progression suggestion
    const suggestion = getProgressionSuggestion();
    let suggestionHTML = '';
    if (suggestion) {
        suggestionHTML = `
            <div class="progression-suggestion" style="background: rgba(255, 170, 0, 0.1); border: 2px solid #ffaa00; border-radius: 12px; padding: 12px; margin: 15px 0;">
                <div style="font-size: 0.85rem; color: #ffaa00; font-weight: 700; text-align: center;">💪 ${suggestion}</div>
            </div>
        `;
    }

    elements.completionStats.innerHTML = `
        <div class="completion-stat">
            <span class="completion-stat-label">Total Reps:</span>
            <span class="completion-stat-value">${state.reps}</span>
        </div>
        <div class="completion-stat">
            <span class="completion-stat-label">Duration:</span>
            <span class="completion-stat-value">${formatTime(elapsedSeconds)}</span>
        </div>
        <div class="completion-stat">
            <span class="completion-stat-label">Calories Burned:</span>
            <span class="completion-stat-value">${calories}</span>
        </div>
        <div class="fitness-level">
            Fitness Level: ${fitnessLevel}
        </div>
        ${recordHTML}
        ${comparisonHTML}
        ${suggestionHTML}
    `;

    elements.completionModal.classList.add('open');
}

function closeCompletionModal() {
    elements.completionModal.classList.remove('open');
}

// ==========================================
// Workout Summary After Save
// ==========================================

function showWorkoutSummary() {
    const history = getWorkoutHistory();

    if (history.sessions.length === 0) {
        showMotivationalMessage('Workout saved! Great job!');
        return;
    }

    // Calculate this week's stats
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = history.sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= weekStart;
    });

    const thisWeekReps = thisWeekWorkouts.reduce((sum, s) => sum + s.reps, 0);
    const thisWeekCalories = thisWeekWorkouts.reduce((sum, s) => sum + s.calories, 0);

    // Calculate this month's stats
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthWorkouts = history.sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= monthStart;
    });

    const thisMonthReps = thisMonthWorkouts.reduce((sum, s) => sum + s.reps, 0);

    // Best week ever
    const weeklyGroups = {};
    history.sessions.forEach(s => {
        const date = new Date(s.date);
        const weekKey = getWeekKey(date);
        if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = [];
        }
        weeklyGroups[weekKey].push(s);
    });

    const bestWeekReps = Math.max(...Object.values(weeklyGroups).map(sessions =>
        sessions.reduce((sum, s) => sum + s.reps, 0)
    ));

    const isBestWeek = thisWeekReps === bestWeekReps && thisWeekReps > 0;

    // Build summary message
    let summary = `Workout saved! 🎉\n`;
    summary += `\nThis week: ${thisWeekWorkouts.length} workout${thisWeekWorkouts.length !== 1 ? 's' : ''}, ${thisWeekReps} reps, ${thisWeekCalories} cals`;
    summary += `\nThis month: ${thisMonthWorkouts.length} workouts, ${thisMonthReps} reps`;

    if (isBestWeek && history.sessions.length > 7) {
        summary += `\n\n🏆 BEST WEEK EVER! Keep it up!`;
    }

    showMotivationalMessage(summary);
}

function getWeekKey(date) {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek; // Adjust to Sunday
    const sunday = new Date(d.setDate(diff));
    return sunday.toISOString().split('T')[0];
}

function saveAndClose() {
    saveWorkoutToHistory();
    closeCompletionModal();
    resetWorkout();

    // Show workout summary
    showWorkoutSummary();
}

function discardAndClose() {
    const confirmed = confirm('Discard this workout without saving?');
    if (confirmed) {
        closeCompletionModal();
        resetWorkout();
    }
}

// ==========================================
// Event Listeners
// ==========================================

// Control buttons
elements.startBtn.addEventListener('click', startTimer);
elements.pauseBtn.addEventListener('click', pauseTimer);
elements.resetBtn.addEventListener('click', resetWorkout);

// Rep counter
elements.countButton.addEventListener('click', incrementRep);

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !state.isPaused && state.isRunning) {
        e.preventDefault();
        incrementRep();
    }
});

// History
elements.historyToggleBtn.addEventListener('click', toggleHistory);
elements.closeHistoryBtn.addEventListener('click', toggleHistory);
elements.clearHistoryBtn.addEventListener('click', clearHistory);
elements.exportBtn.addEventListener('click', exportHistory);
elements.importBtn.addEventListener('click', importHistory);

// Progress chart period buttons
document.querySelectorAll('.chart-period-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active state
        document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Render chart with new period
        const period = parseInt(e.target.dataset.period);
        currentChartPeriod = period;
        renderProgressChart(period, currentChartType);
    });
});

// Progress chart workout type selector
const chartTypeSelect = document.getElementById('chartTypeSelect');
if (chartTypeSelect) {
    chartTypeSelect.addEventListener('change', (e) => {
        currentChartType = e.target.value;
        renderProgressChart(currentChartPeriod, currentChartType);
    });
}

// Completion modal
elements.saveWorkoutBtn.addEventListener('click', saveAndClose);
elements.discardWorkoutBtn.addEventListener('click', discardAndClose);

// Close history panel when clicking outside
elements.historyPanel.addEventListener('click', (e) => {
    if (e.target === elements.historyPanel) {
        toggleHistory();
    }
});

// About section toggle
elements.aboutToggle.addEventListener('click', () => {
    elements.aboutDetails.classList.toggle('open');
    elements.aboutToggle.textContent = elements.aboutDetails.classList.contains('open')
        ? '✕ Close'
        : 'ℹ️ Why this matters';
});

// ==========================================
// Initialization
// ==========================================

function init() {
    updateTimerDisplay();
    updateRepCounter();
    updateMetrics();
    elements.countButton.disabled = true;
    elements.pauseBtn.disabled = true;

    // Load and display streak
    displayStreak();

    // Load history on startup to verify localStorage works
    try {
        getWorkoutHistory();
    } catch (err) {
        console.error('localStorage not available:', err);
    }

    // Set up difficulty change listener to update timer
    elements.difficulty.addEventListener('change', () => {
        if (!state.isRunning) {
            const selectedDifficulty = elements.difficulty.value;
            state.totalSeconds = difficultyLevels[selectedDifficulty].duration;
            state.remainingSeconds = state.totalSeconds;
            updateTimerDisplay();
        }
    });

    console.log('Workout Tracker initialized!');
}

// Start the app
init();

// ==========================================
// Service Worker Registration (PWA)
// ==========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/workout_tool/sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);

                // Check for updates every 60 seconds
                setInterval(() => {
                    registration.update();
                }, 60000);

                // Detect when new service worker is waiting
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available, show update message
                            showMotivationalMessage('📥 New version available! Reload to update.');
                            console.log('New version available - please reload');
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });

        // Handle service worker controller change (after update)
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('PWA install prompt available');

    // Optionally, show an install button in the UI
    // For now, user can install via browser menu
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
});
