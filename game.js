/**
 * Nokia Snake Game
 * A browser-based recreation of the classic Nokia Snake game
 */

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

const CONFIG = {
    // Grid settings
    GRID_SIZE: 20,          // Number of cells in each direction
    CELL_SIZE: 12,          // Size of each cell in pixels
    
    // Snake settings
    INITIAL_SNAKE_LENGTH: 4,
    INITIAL_DIRECTION: 'RIGHT',
    
    // Scoring
    POINTS_PER_FOOD: 10,    // Points awarded for each food eaten
    
    // Speed levels for progressive difficulty (score threshold -> speed in ms)
    SPEED_LEVELS: [
        { threshold: 0,   speed: 150 },   // Starting speed (easy)
        { threshold: 50,  speed: 130 },   // After 50 points
        { threshold: 100, speed: 110 },   // After 100 points
        { threshold: 200, speed: 90 },    // After 200 points
        { threshold: 300, speed: 70 },    // Maximum speed
    ],
    
    // Nokia LCD Color Scheme
    COLORS: {
        BACKGROUND: '#9bbc0f',      // Light LCD green
        GRID: '#8bac0f',            // Subtle grid lines
        SNAKE: '#0f380f',           // Dark green (snake body)
        SNAKE_HEAD: '#306230',      // Slightly lighter for head
        FOOD: '#0f380f',            // Same as snake
        TEXT: '#0f380f',            // Text color
    },
};

// =============================================================================
// GAME STATES
// =============================================================================

const GameState = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover',
};

// =============================================================================
// GAME STATE VARIABLES
// =============================================================================

let snake = [];                     // Array of {x, y} coordinates
let food = null;                    // {x, y} coordinates of food
let direction = CONFIG.INITIAL_DIRECTION;
let nextDirection = CONFIG.INITIAL_DIRECTION;  // Queued direction for next tick
let gameLoop = null;
let gameState = GameState.START;    // Current game state
let score = 0;                      // Current game score
let highScore = 0;                  // Best score (persisted)
let currentSpeed = CONFIG.SPEED_LEVELS[0].speed;  // Current game speed

// =============================================================================
// CANVAS SETUP
// =============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions based on grid
canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
canvas.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;

// Disable image smoothing for crisp pixel rendering
ctx.imageSmoothingEnabled = false;

// =============================================================================
// SNAKE FUNCTIONS
// =============================================================================

/**
 * Initialize the snake at the center of the board
 */
function initSnake() {
    snake = [];
    const startX = Math.floor(CONFIG.GRID_SIZE / 2);
    const startY = Math.floor(CONFIG.GRID_SIZE / 2);
    
    // Create snake segments from head to tail (moving right, so tail is to the left)
    for (let i = 0; i < CONFIG.INITIAL_SNAKE_LENGTH; i++) {
        snake.push({
            x: startX - i,
            y: startY
        });
    }
    
    direction = CONFIG.INITIAL_DIRECTION;
    nextDirection = CONFIG.INITIAL_DIRECTION;
}

/**
 * Move the snake one cell in the current direction
 * @returns {boolean} true if food was eaten
 */
function moveSnake() {
    // Apply queued direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'UP':    head.y--; break;
        case 'DOWN':  head.y++; break;
        case 'LEFT':  head.x--; break;
        case 'RIGHT': head.x++; break;
    }
    
    // Add new head at the front
    snake.unshift(head);
    
    // Check if snake ate food
    if (checkFoodCollision()) {
        // Don't remove tail - snake grows!
        addScore(CONFIG.POINTS_PER_FOOD);  // Add points
        spawnFood();  // Spawn new food
        return true;
    }
    
    // Remove tail (snake moves forward)
    snake.pop();
    return false;
}

/**
 * Draw the snake on the canvas
 */
function drawSnake() {
    snake.forEach((segment, index) => {
        // Head is slightly different color
        ctx.fillStyle = index === 0 ? CONFIG.COLORS.SNAKE_HEAD : CONFIG.COLORS.SNAKE;
        
        // Draw segment with small padding for grid visibility
        const padding = 1;
        ctx.fillRect(
            segment.x * CONFIG.CELL_SIZE + padding,
            segment.y * CONFIG.CELL_SIZE + padding,
            CONFIG.CELL_SIZE - padding * 2,
            CONFIG.CELL_SIZE - padding * 2
        );
    });
}

// =============================================================================
// FOOD FUNCTIONS
// =============================================================================

/**
 * Spawn food at a random valid position (not on snake)
 */
function spawnFood() {
    const validPositions = [];
    
    // Find all valid positions (not occupied by snake)
    for (let x = 0; x < CONFIG.GRID_SIZE; x++) {
        for (let y = 0; y < CONFIG.GRID_SIZE; y++) {
            const isOnSnake = snake.some(segment => 
                segment.x === x && segment.y === y
            );
            if (!isOnSnake) {
                validPositions.push({ x, y });
            }
        }
    }
    
    // Pick random valid position
    if (validPositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * validPositions.length);
        food = validPositions[randomIndex];
    }
}

/**
 * Draw the food on the canvas
 */
function drawFood() {
    if (!food) return;
    
    ctx.fillStyle = CONFIG.COLORS.FOOD;
    
    // Draw food as a slightly smaller square (Nokia style)
    const padding = 2;
    ctx.fillRect(
        food.x * CONFIG.CELL_SIZE + padding,
        food.y * CONFIG.CELL_SIZE + padding,
        CONFIG.CELL_SIZE - padding * 2,
        CONFIG.CELL_SIZE - padding * 2
    );
}

/**
 * Check if snake head is at food position
 */
function checkFoodCollision() {
    const head = snake[0];
    return food && head.x === food.x && head.y === food.y;
}

// =============================================================================
// COLLISION DETECTION
// =============================================================================

/**
 * Check if the given position hits a wall
 */
function checkWallCollision(pos) {
    return pos.x < 0 || pos.x >= CONFIG.GRID_SIZE ||
           pos.y < 0 || pos.y >= CONFIG.GRID_SIZE;
}

/**
 * Check if the snake head collides with its own body
 */
function checkSelfCollision() {
    const head = snake[0];
    // Check against all body segments (starting from index 1)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

/**
 * Check all collision types
 * @returns {boolean} true if any collision detected
 */
function checkCollisions() {
    const head = snake[0];
    return checkWallCollision(head) || checkSelfCollision();
}

// =============================================================================
// SCORING SYSTEM
// =============================================================================

/**
 * Add points to the score
 */
function addScore(points) {
    score += points;
    updateScoreDisplay();
    updateSpeed();  // Check if speed should increase
}

/**
 * Update the score display in the HTML
 */
function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
}

/**
 * Load high score from localStorage
 */
function loadHighScore() {
    const saved = localStorage.getItem('snakeHighScore');
    highScore = saved ? parseInt(saved, 10) : 0;
}

/**
 * Save high score to localStorage
 */
function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore.toString());
    }
}

// =============================================================================
// SPEED / DIFFICULTY MANAGEMENT
// =============================================================================

/**
 * Get the appropriate speed based on current score
 */
function getSpeedForScore(currentScore) {
    // Find the highest threshold that the score exceeds
    let speed = CONFIG.SPEED_LEVELS[0].speed;
    
    for (const level of CONFIG.SPEED_LEVELS) {
        if (currentScore >= level.threshold) {
            speed = level.speed;
        }
    }
    
    return speed;
}

/**
 * Update game speed based on current score
 * Restarts game loop if speed changed
 */
function updateSpeed() {
    const newSpeed = getSpeedForScore(score);
    
    if (newSpeed !== currentSpeed) {
        currentSpeed = newSpeed;
        
        // Restart game loop with new speed
        if (gameState === GameState.PLAYING) {
            startGameLoop();
        }
        
        console.log(`Speed increased! Now: ${currentSpeed}ms per move`);
    }
}

// =============================================================================
// DRAWING FUNCTIONS
// =============================================================================

/**
 * Draw the game board with Nokia LCD style grid
 */
function drawBoard() {
    // Fill background with LCD green
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle grid lines
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= CONFIG.GRID_SIZE; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * CONFIG.CELL_SIZE, 0);
        ctx.lineTo(i * CONFIG.CELL_SIZE, canvas.height);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * CONFIG.CELL_SIZE);
        ctx.lineTo(canvas.width, i * CONFIG.CELL_SIZE);
        ctx.stroke();
    }
}

/**
 * Draw text on the canvas (Nokia LCD style)
 */
function drawText(text, x, y, fontSize = 12) {
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `${fontSize}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

/**
 * Main draw function - renders entire game
 */
function draw() {
    drawBoard();
    drawFood();
    drawSnake();
}

// =============================================================================
// GAME LOOP & STATE MANAGEMENT
// =============================================================================

/**
 * Main game update - called every game tick
 */
function update() {
    if (gameState !== GameState.PLAYING) return;
    
    moveSnake();
    
    // Check for collisions after moving
    if (checkCollisions()) {
        handleGameOver();
        return;
    }
    
    draw();
}

/**
 * Start a new game
 */
function startGame() {
    gameState = GameState.PLAYING;
    score = 0;
    currentSpeed = CONFIG.SPEED_LEVELS[0].speed;  // Reset to starting speed
    updateScoreDisplay();
    initSnake();
    spawnFood();
    draw();
    
    // Start game loop
    startGameLoop();
    updateActionButton();
    console.log('Game started!');
}

/**
 * Start the game loop interval
 */
function startGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, currentSpeed);
}

/**
 * Stop the game loop interval
 */
function stopGameLoop() {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
}

/**
 * Pause the game
 */
function pauseGame() {
    if (gameState !== GameState.PLAYING) return;
    
    gameState = GameState.PAUSED;
    stopGameLoop();
    
    // Draw pause overlay
    draw();
    drawPauseScreen();
    updateActionButton();
    
    console.log('Game paused');
}

/**
 * Resume the game from pause
 */
function resumeGame() {
    if (gameState !== GameState.PAUSED) return;
    
    gameState = GameState.PLAYING;
    startGameLoop();
    updateActionButton();
    
    console.log('Game resumed');
}

/**
 * Toggle pause state
 */
function togglePause() {
    if (gameState === GameState.PLAYING) {
        pauseGame();
    } else if (gameState === GameState.PAUSED) {
        resumeGame();
    }
}

/**
 * Handle game over state
 */
function handleGameOver() {
    stopGameLoop();
    gameState = GameState.GAME_OVER;
    
    // Save high score
    saveHighScore();
    updateScoreDisplay();
    updateActionButton();
    
    console.log(`Game Over! Score: ${score}`);
    
    // Draw final state with game over message
    draw();
    drawGameOverScreen();
}

/**
 * Draw start screen
 */
function drawStartScreen() {
    drawBoard();
    drawText('SNAKE', canvas.width / 2, canvas.height / 2 - 20, 16);
    drawText('TAP OR PRESS', canvas.width / 2, canvas.height / 2 + 20, 6);
    drawText('SPACE TO START', canvas.width / 2, canvas.height / 2 + 35, 6);
    
    if (highScore > 0) {
        drawText(`HIGH: ${highScore}`, canvas.width / 2, canvas.height / 2 + 55, 6);
    }
}

/**
 * Draw pause overlay
 */
function drawPauseScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(155, 188, 15, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawText('PAUSED', canvas.width / 2, canvas.height / 2 - 10, 12);
    drawText('PRESS SPACE', canvas.width / 2, canvas.height / 2 + 20, 6);
    drawText('TO CONTINUE', canvas.width / 2, canvas.height / 2 + 35, 6);
}

/**
 * Draw game over overlay
 */
function drawGameOverScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(155, 188, 15, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over text
    drawText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30, 10);
    
    // Show score
    drawText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2, 8);
    
    // Show if new high score
    if (score >= highScore && score > 0) {
        drawText('NEW HIGH!', canvas.width / 2, canvas.height / 2 + 18, 6);
    }
    
    drawText('PRESS SPACE', canvas.width / 2, canvas.height / 2 + 40, 6);
    drawText('TO RESTART', canvas.width / 2, canvas.height / 2 + 55, 6);
}

// =============================================================================
// INPUT HANDLING
// =============================================================================

// Direction key mappings
const DIRECTION_KEYS = {
    'ArrowUp': 'UP',    'w': 'UP',    'W': 'UP',
    'ArrowDown': 'DOWN', 's': 'DOWN', 'S': 'DOWN',
    'ArrowLeft': 'LEFT', 'a': 'LEFT', 'A': 'LEFT',
    'ArrowRight': 'RIGHT', 'd': 'RIGHT', 'D': 'RIGHT',
};

// Opposite directions (for preventing 180-degree turns)
const OPPOSITES = {
    'UP': 'DOWN',
    'DOWN': 'UP',
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT',
};

/**
 * Queue a direction change (prevents 180-degree turns)
 */
function setDirection(newDirection) {
    // Prevent 180-degree turns
    if (OPPOSITES[newDirection] === direction) {
        return;
    }
    // Prevent setting same direction
    if (newDirection === nextDirection) {
        return;
    }
    nextDirection = newDirection;
}

/**
 * Handle keyboard input based on current game state
 */
function handleKeyDown(e) {
    const key = e.key;
    
    // Direction controls (Arrow keys and WASD) - only when playing
    if (DIRECTION_KEYS[key]) {
        e.preventDefault();
        if (gameState === GameState.PLAYING) {
            setDirection(DIRECTION_KEYS[key]);
        }
        return;
    }
    
    // Space bar - context-dependent action
    if (key === ' ' || key === 'Spacebar') {
        e.preventDefault();
        handleSpaceBar();
        return;
    }
    
    // P key - pause/resume
    if (key === 'p' || key === 'P') {
        e.preventDefault();
        togglePause();
    }
}

/**
 * Handle space bar press based on game state
 */
function handleSpaceBar() {
    switch (gameState) {
        case GameState.START:
        case GameState.GAME_OVER:
            startGame();
            break;
        case GameState.PLAYING:
            pauseGame();
            break;
        case GameState.PAUSED:
            resumeGame();
            break;
    }
}

// =============================================================================
// TOUCH & MOBILE CONTROLS
// =============================================================================

/**
 * Set up touch/swipe controls for mobile
 */
function setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30;
    
    // Swipe controls on canvas
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    canvas.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
            // Horizontal swipe
            if (gameState === GameState.PLAYING) {
                setDirection(dx > 0 ? 'RIGHT' : 'LEFT');
            }
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipeDistance) {
            // Vertical swipe
            if (gameState === GameState.PLAYING) {
                setDirection(dy > 0 ? 'DOWN' : 'UP');
            }
        } else {
            // Tap (no swipe) - treat as action button
            handleSpaceBar();
        }
    }, { passive: true });
    
    // Prevent scrolling when touching the canvas
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

/**
 * Set up D-pad button controls
 */
function setupDpadControls() {
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnAction = document.getElementById('btn-action');
    
    // Direction buttons
    const addDpadListener = (btn, dir) => {
        if (!btn) return;
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameState === GameState.PLAYING) {
                setDirection(dir);
            }
        });
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (gameState === GameState.PLAYING) {
                setDirection(dir);
            }
        });
    };
    
    addDpadListener(btnUp, 'UP');
    addDpadListener(btnDown, 'DOWN');
    addDpadListener(btnLeft, 'LEFT');
    addDpadListener(btnRight, 'RIGHT');
    
    // Action button (Start/Pause)
    if (btnAction) {
        const handleAction = (e) => {
            e.preventDefault();
            handleSpaceBar();
            updateActionButton();
        };
        
        btnAction.addEventListener('touchstart', handleAction);
        btnAction.addEventListener('click', handleAction);
    }
}

/**
 * Update action button text based on game state
 */
function updateActionButton() {
    const btnAction = document.getElementById('btn-action');
    if (!btnAction) return;
    
    switch (gameState) {
        case GameState.START:
        case GameState.GAME_OVER:
            btnAction.textContent = 'START';
            break;
        case GameState.PLAYING:
            btnAction.textContent = 'PAUSE';
            break;
        case GameState.PAUSED:
            btnAction.textContent = 'RESUME';
            break;
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the game
 */
function init() {
    // Load high score from localStorage
    loadHighScore();
    updateScoreDisplay();
    
    // Set initial state and draw start screen
    gameState = GameState.START;
    drawStartScreen();
    
    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Set up touch/mobile controls
    setupTouchControls();
    setupDpadControls();
    updateActionButton();
    
    console.log('Nokia Snake game initialized. Press SPACE or tap to start.');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
