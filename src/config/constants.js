// Application Configuration and Constants
// ========================================

export const STORAGE_KEYS = {
    HISTORY: 'burpeeWorkoutHistory',
    STREAK: 'workoutStreak',
    WEEKLY_STATS: 'weeklyStats',
    GOALS: 'workoutGoals',
    SORENESS: 'sorenessLog',
    COACH_STATE: 'coachState',
    VERSION: 1
};

export const WORKOUT_CONFIGS = {
    burpees: {
        name: 'Burpees',
        caloriesPerMinute: 10,
        caloriesPerRep: 1,
        repUnit: 'reps'
    },
    rows: {
        name: 'Rows',
        caloriesPerMinute: 6,
        caloriesPerRep: 0.7,
        repUnit: 'reps'
    },
    pullups: {
        name: 'Pull-ups',
        caloriesPerMinute: 8,
        caloriesPerRep: 1.2,
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
    'mountain-climbers': {
        name: 'Mountain Climbers',
        caloriesPerMinute: 10,
        caloriesPerRep: 0.3,
        repUnit: 'reps'
    }
};

export const DIFFICULTY_LEVELS = {
    beginner: { duration: 600, name: 'Beginner' },      // 10 minutes
    intermediate: { duration: 900, name: 'Intermediate' }, // 15 minutes
    advanced: { duration: 1200, name: 'Advanced' },     // 20 minutes
    elite: { duration: 1800, name: 'Elite' }            // 30 minutes
};

export const WORKOUT_TYPE_COLORS = {
    burpees: '#E1523D',
    rows: '#FF8C00',
    pullups: '#9370DB',
    squats: '#FFD700',
    'jumping-jacks': '#00CED1',
    'mountain-climbers': '#FF69B4'
};

export const TARGET_REPS = {
    beginner: {
        burpees: 50,
        rows: 80,
        pullups: 30,
        squats: 100,
        'jumping-jacks': 200,
        'mountain-climbers': 150
    },
    intermediate: {
        burpees: 90,
        rows: 140,
        pullups: 55,
        squats: 150,
        'jumping-jacks': 350,
        'mountain-climbers': 250
    },
    advanced: {
        burpees: 120,
        rows: 180,
        pullups: 75,
        squats: 200,
        'jumping-jacks': 450,
        'mountain-climbers': 350
    },
    elite: {
        burpees: 180,
        rows: 270,
        pullups: 110,
        squats: 300,
        'jumping-jacks': 700,
        'mountain-climbers': 500
    }
};

export const REP_MILESTONES = [10, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300];

export const TIME_MILESTONES = [
    { time: 900, messageType: 'quarter' },   // 15 min remaining (5 min done)
    { time: 600, messageType: 'mid' },       // 10 min remaining (halfway)
    { time: 300, messageType: 'threequarter' }, // 5 min remaining
    { time: 60, messageType: 'final' }       // 1 min remaining
];

export const MOTIVATIONAL_MESSAGES = {
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

export const CSS_CLASSES = {
    OPEN: 'open',
    CELEBRATING: 'celebrating',
    ACTIVE: 'active',
    TIMER_FRESH: 'timer-fresh',
    TIMER_MID: 'timer-mid',
    TIMER_FINAL: 'timer-final',
    TIMER_CRITICAL: 'timer-critical',
    PROGRESS_MID: 'mid',
    PROGRESS_FINAL: 'final',
    PROGRESS_CRITICAL: 'critical'
};

export const CHART_CONFIG = {
    DEFAULT_PERIOD: 7,
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 220,
    PADDING: 30,
    GRID_LINES: 4,
    POINT_RADIUS: 3.5,
    LINE_WIDTH: 2.5
};

// Soreness levels
export const SORENESS_LEVELS = {
    0: { name: 'None', color: '#00ffcc', emoji: '✓' },
    1: { name: 'Mild', color: '#90EE90', emoji: '😊' },
    2: { name: 'Moderate', color: '#FFD700', emoji: '😐' },
    3: { name: 'Significant', color: '#FFA500', emoji: '😣' },
    4: { name: 'Very Sore', color: '#FF6347', emoji: '😫' },
    5: { name: 'Severe', color: '#FF0000', emoji: '🚨' }
};

// Muscle groups
export const MUSCLE_GROUPS = {
    chest: { name: 'Chest', icon: '💪' },
    back: { name: 'Back', icon: '🦴' },
    shoulders: { name: 'Shoulders', icon: '🏋️' },
    arms: { name: 'Arms', icon: '💪' },
    core: { name: 'Core', icon: '🎯' },
    legs: { name: 'Legs', icon: '🦵' }
};

// Workout muscle impact
export const WORKOUT_MUSCLE_IMPACT = {
    burpees: {
        primary: ['legs', 'chest', 'core'],
        secondary: ['arms', 'shoulders'],
        intensity: 5
    },
    rows: {
        primary: ['back', 'arms'],
        secondary: ['core'],
        intensity: 4
    },
    pullups: {
        primary: ['back', 'arms'],
        secondary: ['core', 'shoulders'],
        intensity: 5
    },
    squats: {
        primary: ['legs'],
        secondary: ['core'],
        intensity: 4
    },
    'jumping-jacks': {
        primary: ['legs', 'shoulders'],
        secondary: ['core'],
        intensity: 3
    },
    'mountain-climbers': {
        primary: ['core', 'legs'],
        secondary: ['shoulders', 'arms'],
        intensity: 4
    }
};

// Coach messages
export const COACH_MESSAGES = {
    restDay: [
        "Your body needs recovery time. Rest is when you get stronger! 💪",
        "Take a well-earned rest day. You've been crushing it! 🛌",
        "Recovery is part of training. Your muscles will thank you! 🌟",
        "Smart athletes know when to rest. Today is that day! 🧠"
    ],
    goalEncouragement: [
        "You're making great progress toward your goal! 🎯",
        "Keep pushing! Every rep gets you closer! 💪",
        "Your dedication is impressive! Stay consistent! 🔥",
        "You've got this! Your goal is within reach! ⭐"
    ],
    varietySuggestion: [
        "Mix it up! Try a different workout to keep things fresh! 🔄",
        "Let's work different muscles today for balanced fitness! ⚖️",
        "Variety is key to well-rounded fitness! 🎨",
        "Time to challenge different muscle groups! 🎯"
    ],
    sorenessAwareness: [
        "I noticed you're sore. Let's work muscles that need less recovery! 🤔",
        "Smart training means listening to your body! 🎯",
        "Let's give those sore muscles a break today! 😌"
    ],
    goalSuggestion: [
        "Based on your performance, here's your next challenge!",
        "You're ready for the next level! Let's set a new goal!",
        "Time to push your limits a bit further!",
        "Your progress is impressive! Ready for more?"
    ],
    goalCompleted: [
        "🎉 GOAL CRUSHED! You're absolutely unstoppable!",
        "🏆 GOAL ACHIEVED! That's what champions are made of!",
        "💪 YOU DID IT! What an incredible achievement!",
        "⭐ GOAL COMPLETE! You're stronger than you think!"
    ]
};

// Recovery thresholds
export const RECOVERY_THRESHOLDS = {
    sorenessRest: 3,
    streakRest: 6,
    intensityRest: 4.5,
    minRecoveryHours: 24
};

// Goal milestones for celebrations
export const GOAL_MILESTONES = [25, 50, 75, 90, 100];
