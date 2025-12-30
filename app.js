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

    // Hide config section
    elements.configSection.style.display = 'none';

    // Show start message
    const workoutName = workoutConfigs[state.workoutType].name;
    showMotivationalMessage(`${workoutName} - ${difficultyLevels[state.difficulty].name} mode! LET'S GO!`);
    playSound(elements.audioMilestone);

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
    } else {
        // Resume: restart the timer interval and animation
        startBurpeeAnimation();
        elements.pauseBtn.textContent = 'Pause';
        elements.countButton.disabled = false;
        showMotivationalMessage("Back to work! Let's go!");

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

    // Show config section again
    elements.configSection.style.display = 'block';

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

function renderHistory() {
    const history = getWorkoutHistory();

    if (history.sessions.length === 0) {
        elements.historyList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No workout history yet. Complete a workout to see it here!</p>';
        elements.historyStats.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">No statistics available</p>';
        return;
    }

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
        ${comparisonHTML}
        ${suggestionHTML}
    `;

    elements.completionModal.classList.add('open');
}

function closeCompletionModal() {
    elements.completionModal.classList.remove('open');
}

function saveAndClose() {
    saveWorkoutToHistory();
    closeCompletionModal();
    resetWorkout();
    showMotivationalMessage('Workout saved! Great job!');
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

// Completion modal
elements.saveWorkoutBtn.addEventListener('click', saveAndClose);
elements.discardWorkoutBtn.addEventListener('click', discardAndClose);

// Close history panel when clicking outside
elements.historyPanel.addEventListener('click', (e) => {
    if (e.target === elements.historyPanel) {
        toggleHistory();
    }
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
