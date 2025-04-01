// js/config.js
const Config = {
    // Canvas dimensions - Assuming portrait aspect ratio
    CANVAS_WIDTH: Math.min(window.innerWidth, 400),
    CANVAS_HEIGHT: Math.min(window.innerHeight * 0.9, 700),

    // --- Cuter Colors ---
    COLOR_SKY: '#FFC0CB',       // Pink sky
    COLOR_GROUND: '#FFB6C1',   // Light Pink ground
    COLOR_ARCHER: '#4A4A4A',     // Dark Gray archer
    COLOR_STUMP: '#D2B48C',     // Tan stump
    COLOR_APPLE: '#FF69B4',     // Hot Pink apple (instead of red)
    COLOR_ARROW: '#4A4A4A',     // Dark Gray arrow
    COLOR_SCORE_TEXT: '#FFFFFF', // White score text
    COLOR_SCORE_BG: 'rgba(0, 0, 0, 0.4)',
    COLOR_START_CIRCLE: 'rgba(255, 255, 0, 0.5)', // Yellow, semi-transparent
    COLOR_GAMEOVER_BG: 'rgba(0, 0, 0, 0.7)',
    COLOR_GAMEOVER_TEXT: '#FFFFFF',
    COLOR_BUTTON: '#FF69B4',     // Hot Pink button
    COLOR_BUTTON_TEXT: '#FFFFFF',
    COLOR_BUTTON_HOVER: '#FF85C1', // Lighter pink hover
    COLOR_TRAJECTORY: 'rgba(255, 255, 255, 0.6)', // White preview line
    // --------------------

    // Physics
    GRAVITY: 1.3,
    ARROW_SPEED_FACTOR: 0.2,
    MAX_POWER_DRAG: 150,
    TRAJECTORY_STEP_TIME: 0.15, // Smaller step for potentially better accuracy
    TRAJECTORY_STEPS: 70,

    // Game Objects
    ARCHER_POS_X: 50,
    ARCHER_POS_Y_OFFSET: 0, // Archer feet directly on ground line
    STICKMAN_HEIGHT: 70,    // Slightly smaller
    STICKMAN_WIDTH: 18,
    HEAD_RADIUS: 9,
    APPLE_RADIUS: 10,      // Slightly bigger apple circle

    // Stump & Apple Positioning
    INITIAL_TARGET_DISTANCE: 200, // Start further away
    DISTANCE_INCREMENT: 15,
    MIN_STUMP_HEIGHT: 40,
    MAX_STUMP_HEIGHT: 100,
    STUMP_WIDTH: 30,
    APPLE_ON_STUMP_Y_OFFSET: -5, // How much apple sits above stump top

    // Gameplay
    INITIAL_ARROWS: 3, // Number of arrows player starts with
    START_CIRCLE_RADIUS: 25, // Radius for the start/cancel indicator

    // Leaderboard
    LEADERBOARD_KEY: 'stickmanArcherScoresPink', // New key for pink version scores
    LEADERBOARD_MAX_ENTRIES: 10,
};

// Calculate ground level dynamically
Config.GROUND_Y = Config.CANVAS_HEIGHT - 40; // Slightly higher ground line
Config.ARCHER_POS_Y = Config.GROUND_Y + Config.ARCHER_POS_Y_OFFSET; // Feet position

Config.MAX_STUMP_X = Config.CANVAS_WIDTH - (Config.STUMP_WIDTH / 2) - 20; // Leave 20px margin + half stump width
Config.MAX_TARGET_DISTANCE = Config.MAX_STUMP_X - Config.ARCHER_POS_X;