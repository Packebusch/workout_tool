// Application Configuration and Constants
// ========================================

export const STORAGE_KEYS = {
    HISTORY: 'burpeeWorkoutHistory',
    STREAK: 'workoutStreak',
    WEEKLY_STATS: 'weeklyStats',
    GOALS: 'workoutGoals',
    SORENESS: 'sorenessLog',
    COACH_STATE: 'coachState',
    PROGRESSIONS: 'exerciseProgressions',
    VERSION: 2
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

// Exercise Progression Ladders
// ============================
// Each exercise has a progression ladder with increasing difficulty variations.
// Thresholds are in reps per minute for each fitness level at that progression level.

export const PROGRESSION_LADDERS = {
    squats: {
        name: 'Squats',
        levels: [
            {
                level: 1,
                variation: 'Air Squat',
                note: null,
                elite: 10, advanced: 7, intermediate: 4, beginner: 0,
                description: 'Stand with feet shoulder-width apart. Lower your hips back and down as if sitting into a chair. Keep chest up, knees tracking over toes. Go as deep as mobility allows, ideally thighs parallel to floor.',
                formTips: ['Push knees out, not forward', 'Keep weight in heels', 'Squeeze glutes at the top', 'Maintain neutral spine throughout']
            },
            {
                level: 2,
                variation: 'Jump Squat',
                note: 'Explosive jump from squat position',
                elite: 8, advanced: 5.5, intermediate: 3, beginner: 0,
                description: 'Perform an air squat, then explode upward into a jump at the top. Land softly with bent knees and immediately descend into the next rep. Builds explosive power and cardiovascular endurance.',
                formTips: ['Land softly - absorb impact through legs', 'Full squat depth before each jump', 'Swing arms for momentum', 'Keep core tight throughout']
            },
            {
                level: 3,
                variation: 'Bulgarian Split Squat',
                note: 'Rear foot elevated on chair/bench, alternate legs',
                elite: 5, advanced: 3.5, intermediate: 2, beginner: 0,
                description: 'Place rear foot on elevated surface behind you. Lower until front thigh is parallel to ground. Keep front knee over ankle, torso upright. Alternate legs each rep or do one side then switch.',
                formTips: ['Front foot far enough forward that knee stays behind toes', 'Most weight on front heel', 'Control the descent - don\'t drop', 'Hip of rear leg should stretch at bottom']
            },
            {
                level: 4,
                variation: 'Assisted Pistol',
                note: 'Hold doorframe or pole for balance',
                elite: 2.5, advanced: 1.75, intermediate: 1, beginner: 0,
                description: 'Hold a doorframe, pole, or TRX strap for balance. Extend one leg forward, lower on the other leg as deep as possible. Use arms only for balance, not to pull yourself up.',
                formTips: ['Keep extended leg straight and off ground', 'Descend slowly with control', 'Drive through heel to stand', 'Use less arm assistance as you improve']
            },
            {
                level: 5,
                variation: 'Pistol Squat',
                note: 'Full single-leg squat, no assistance',
                elite: 1.5, advanced: 1, intermediate: 0.5, beginner: 0,
                description: 'Full single-leg squat with no assistance. Extend one leg forward, squat all the way down on the other, then stand back up. Requires significant strength, balance, and mobility.',
                formTips: ['Arms forward for counterbalance', 'Flex ankle of extended leg to keep it up', 'Sit back into your heel', 'Control the entire movement - no bouncing']
            }
        ]
    },
    burpees: {
        name: 'Burpees',
        levels: [
            {
                level: 1,
                variation: 'Standard Burpee',
                note: null,
                elite: 10, advanced: 7, intermediate: 4, beginner: 0,
                description: 'From standing, drop hands to floor, jump feet back to plank, jump feet forward, then jump up with hands overhead. Flow smoothly between positions.',
                formTips: ['Land softly in plank with engaged core', 'Keep hips level in plank position', 'Jump feet close to hands', 'Full hip extension on the jump']
            },
            {
                level: 2,
                variation: 'Burpee + Push-up',
                note: 'Full push-up at the bottom',
                elite: 8, advanced: 5.5, intermediate: 3, beginner: 0,
                description: 'Standard burpee with a full push-up added when in plank position. Chest touches or nearly touches the floor before pushing back up.',
                formTips: ['Elbows at 45° angle during push-up', 'Body stays in straight line', 'Full lockout at top of push-up', 'Don\'t let hips sag or pike']
            },
            {
                level: 3,
                variation: 'Burpee + Tuck Jump',
                note: 'Tuck knees to chest on the jump',
                elite: 6, advanced: 4, intermediate: 2.5, beginner: 0,
                description: 'Standard burpee but replace the regular jump with a tuck jump. Drive knees up toward chest at the peak of your jump.',
                formTips: ['Jump explosively to get height', 'Bring knees to chest, not chest to knees', 'Land softly with bent knees', 'Reset fully between reps']
            },
            {
                level: 4,
                variation: 'Burpee + Box Jump',
                note: 'Jump onto elevated surface',
                elite: 5, advanced: 3.5, intermediate: 2, beginner: 0,
                description: 'Perform burpee facing a box or step. Instead of jumping in place, explode up onto the elevated surface. Step or jump down and repeat.',
                formTips: ['Start close enough to land on box safely', 'Swing arms for momentum', 'Land with full foot on box', 'Stand fully on box before stepping down']
            }
        ]
    },
    rows: {
        name: 'Rows',
        levels: [
            {
                level: 1,
                variation: 'Inverted Row (High)',
                note: 'Body at 45° angle, feet on ground',
                elite: 12, advanced: 8, intermediate: 5, beginner: 0,
                description: 'Hang from a bar, rings, or sturdy table edge with body at 45° angle. Pull chest to the bar while keeping body straight. Easier angle for building base strength.',
                formTips: ['Squeeze shoulder blades together at top', 'Keep core tight - no sagging hips', 'Pull elbows back, not out', 'Control the lowering phase']
            },
            {
                level: 2,
                variation: 'Inverted Row (Low)',
                note: 'Body nearly horizontal',
                elite: 10, advanced: 7, intermediate: 4, beginner: 0,
                description: 'Same as high inverted row but with bar lower so body is nearly parallel to floor. Significantly harder due to increased leverage.',
                formTips: ['Start with arms fully extended', 'Touch chest to bar each rep', 'Keep neck neutral - don\'t crane', 'Maintain rigid plank throughout']
            },
            {
                level: 3,
                variation: 'Feet Elevated Row',
                note: 'Feet on chair or bench',
                elite: 8, advanced: 5.5, intermediate: 3, beginner: 0,
                description: 'Inverted row with feet elevated on a chair or bench. This puts more of your bodyweight into the pull, making it harder.',
                formTips: ['Elevate feet to roughly bar height', 'Same form cues as regular row', 'Don\'t let hips drop when tired', 'Full range of motion on every rep']
            },
            {
                level: 4,
                variation: 'Archer Row',
                note: 'One arm extended, other pulls',
                elite: 5, advanced: 3.5, intermediate: 2, beginner: 0,
                description: 'Start in inverted row position. Keep one arm straight while pulling with the other, shifting your body toward the pulling arm. Alternate sides.',
                formTips: ['Straight arm provides minimal assistance', 'Rotate torso slightly toward working arm', 'Keep hips square to ceiling', 'Control the transition between sides']
            },
            {
                level: 5,
                variation: 'One-Arm Row',
                note: 'Full single-arm inverted row',
                elite: 3, advanced: 2, intermediate: 1, beginner: 0,
                description: 'Full inverted row using only one arm. The non-working arm can be on your chest or extended. Requires significant pulling strength.',
                formTips: ['Grip center of bar with working hand', 'Fight rotation - keep hips level', 'May need to widen feet for stability', 'Start with partial range if needed']
            }
        ]
    },
    pullups: {
        name: 'Pull-ups',
        levels: [
            {
                level: 1,
                variation: 'Dead Hang',
                note: 'Just hang from bar, build grip strength',
                elite: 0.5, advanced: 0.33, intermediate: 0.17, beginner: 0,
                description: 'Simply hang from the bar with straight arms. Builds grip strength and shoulder stability needed for pull-ups. Count time or do multiple shorter hangs.',
                formTips: ['Grip slightly wider than shoulders', 'Engage shoulders - don\'t just hang passively', 'Breathe steadily', 'Work toward 30-60 second holds']
            },
            {
                level: 2,
                variation: 'Negative Pull-up',
                note: 'Jump up, lower slowly (5 sec)',
                elite: 2, advanced: 1.5, intermediate: 1, beginner: 0,
                description: 'Jump or step up to the top position of a pull-up. Then lower yourself as slowly as possible (aim for 5+ seconds). Builds strength for the pulling motion.',
                formTips: ['Start with chin over bar', 'Lower with control - no dropping', 'Fight gravity the whole way', 'Reset fully at bottom before next rep']
            },
            {
                level: 3,
                variation: 'Band-Assisted Pull-up',
                note: 'Use resistance band for help',
                elite: 4, advanced: 3, intermediate: 2, beginner: 0,
                description: 'Loop a resistance band over the bar and place knee or foot in it. The band assists at the bottom where you\'re weakest. Use lighter bands as you improve.',
                formTips: ['Secure band before starting', 'Still initiate with lats, not arms', 'Control the descent', 'Progress to thinner bands over time']
            },
            {
                level: 4,
                variation: 'Pull-up',
                note: 'Standard pull-up',
                elite: 6, advanced: 4, intermediate: 2, beginner: 0,
                description: 'From dead hang, pull yourself up until chin clears the bar. Lower with control and repeat. Overhand grip, hands slightly wider than shoulders.',
                formTips: ['Initiate by pulling shoulder blades down', 'Drive elbows toward hips', 'Minimize swinging or kipping', 'Full dead hang between reps']
            },
            {
                level: 5,
                variation: 'Weighted Pull-up',
                note: 'Add weight via belt or vest',
                elite: 4, advanced: 3, intermediate: 1.5, beginner: 0,
                description: 'Standard pull-up with added weight from a dip belt, weight vest, or dumbbell between feet. Start with small increments (5-10 lbs).',
                formTips: ['Master bodyweight pull-ups first', 'Add weight gradually', 'Maintain strict form despite weight', 'Control even more important with load']
            }
        ]
    },
    'jumping-jacks': {
        name: 'Jumping Jacks',
        levels: [
            {
                level: 1,
                variation: 'Standard Jumping Jack',
                note: null,
                elite: 45, advanced: 35, intermediate: 25, beginner: 0,
                description: 'Start with feet together, arms at sides. Jump feet out wide while raising arms overhead. Jump back to start. Keep a steady rhythm.',
                formTips: ['Land softly on balls of feet', 'Full arm extension overhead', 'Keep core engaged throughout', 'Maintain consistent tempo']
            },
            {
                level: 2,
                variation: 'Seal Jack',
                note: 'Arms come together in front like a seal clap',
                elite: 35, advanced: 27, intermediate: 18, beginner: 0,
                description: 'Like a jumping jack, but arms go out to sides and clap together in front at chest height instead of overhead. More shoulder and chest engagement.',
                formTips: ['Arms stay at shoulder height', 'Clap with palms facing each other', 'Keep elbows slightly bent', 'Coordinate arm and leg timing']
            },
            {
                level: 3,
                variation: 'Star Jump',
                note: 'Full extension to X shape at peak',
                elite: 25, advanced: 18, intermediate: 12, beginner: 0,
                description: 'Explosive jump from squat position, extending body into an X or star shape at the peak. Land softly back in squat position.',
                formTips: ['Start in quarter squat', 'Explode up as high as possible', 'Fully extend arms and legs at peak', 'Land softly with bent knees']
            }
        ]
    },
    'mountain-climbers': {
        name: 'Mountain Climbers',
        levels: [
            {
                level: 1,
                variation: 'Standard Mountain Climber',
                note: null,
                elite: 30, advanced: 22, intermediate: 14, beginner: 0,
                description: 'Start in plank position. Drive one knee toward chest, then quickly switch legs in a running motion. Keep hips level and core tight.',
                formTips: ['Hands directly under shoulders', 'Keep hips down - don\'t pike up', 'Drive knees straight forward', 'Maintain steady breathing rhythm']
            },
            {
                level: 2,
                variation: 'Cross-Body Mountain Climber',
                note: 'Knee goes to opposite elbow',
                elite: 25, advanced: 18, intermediate: 12, beginner: 0,
                description: 'Mountain climber variation where each knee drives across to the opposite elbow. Adds rotational core work and increases oblique engagement.',
                formTips: ['Twist from the core, not just legs', 'Try to touch knee to elbow', 'Keep upper body stable', 'Slightly slower pace than standard']
            },
            {
                level: 3,
                variation: 'Sliding Mountain Climber',
                note: 'Use sliders or towels on smooth floor',
                elite: 20, advanced: 15, intermediate: 10, beginner: 0,
                description: 'Use furniture sliders or towels on a smooth floor. Slide feet in and out instead of jumping. Creates constant tension and removes impact.',
                formTips: ['Keep toes on sliders at all times', 'Smooth controlled slides', 'No bouncing or jerky movements', 'Core works harder to stabilize']
            },
            {
                level: 4,
                variation: 'Spiderman Mountain Climber',
                note: 'Knee goes wide to same-side elbow',
                elite: 15, advanced: 11, intermediate: 7, beginner: 0,
                description: 'Drive knee out wide toward the same-side elbow (outside the arm). Opens up hips and adds hip flexor stretch. More demanding on core stability.',
                formTips: ['Knee goes outside the arm', 'Open hip as knee comes forward', 'Keep back flat throughout', 'Alternate sides with control']
            }
        ]
    }
};

// Progression/Regression Thresholds
export const PROGRESSION_CONFIG = {
    minSessionsForProgression: 3,      // Minimum sessions at current level before progression
    minEliteCountForProgression: 2,    // Minimum Elite performances needed
    maxSorenessForProgression: 2,      // Must be <= this soreness level to progress
    consecutiveBeginnerForRegression: 2, // 2 Beginner performances triggers regression suggestion
    minSorenessForRegression: 4        // Soreness >= this triggers regression suggestion
};

// Calorie multipliers by progression level (higher level = more calories burned)
export const PROGRESSION_CALORIE_MULTIPLIERS = {
    1: 1.0,
    2: 1.3,
    3: 1.6,
    4: 2.0,
    5: 2.4
};

// Coach messages for progressions
export const PROGRESSION_MESSAGES = {
    readyToProgress: [
        "You've mastered this level! Ready for a bigger challenge?",
        "Impressive consistency! Time to level up?",
        "Your performance is Elite-level. Let's try the next variation!",
        "You're crushing it! Ready to progress?"
    ],
    firstSessionAtLevel: [
        "First session with {variation}! Focus on form over speed.",
        "New challenge: {variation}. Take it easy and learn the movement.",
        "Welcome to Level {level}! Quality reps matter most right now."
    ],
    struggling: [
        "This variation is challenging you. Keep at it!",
        "Building strength takes time. You've got this!",
        "Every rep is progress. Stay consistent!"
    ],
    suggestRegression: [
        "Let's step back and build a stronger foundation.",
        "No shame in mastering the basics first!",
        "Let's work on {previousVariation} to build more strength."
    ],
    levelUp: [
        "LEVEL UP! You've unlocked {variation}!",
        "Congratulations! You've progressed to {variation}!",
        "New challenge unlocked: {variation}!"
    ],
    levelDown: [
        "Stepping back to {variation} to rebuild strength.",
        "Smart move! {variation} will help you get stronger.",
        "Back to {variation} - you'll be ready for more soon!"
    ]
};
