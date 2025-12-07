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
    GAME_SPEED: 150,        // Milliseconds per move (Nokia feel)
    
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
// GAME STATE
// =============================================================================

let snake = [];                     // Array of {x, y} coordinates
let food = null;                    // {x, y} coordinates of food
let direction = CONFIG.INITIAL_DIRECTION;
let nextDirection = CONFIG.INITIAL_DIRECTION;  // Queued direction for next tick
let gameLoop = null;
let isGameRunning = false;

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
// GAME LOOP
// =============================================================================

/**
 * Main game update - called every game tick
 */
function update() {
    moveSnake();
    draw();
}

/**
 * Start the game loop
 */
function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    initSnake();
    spawnFood();  // Spawn first food
    draw();
    
    // Start game loop
    gameLoop = setInterval(update, CONFIG.GAME_SPEED);
    console.log('Game started - snake is moving!');
}

/**
 * Stop the game loop
 */
function stopGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    isGameRunning = false;
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
 * Handle keyboard input
 */
function handleKeyDown(e) {
    const key = e.key;
    
    // Direction controls (Arrow keys and WASD)
    if (DIRECTION_KEYS[key]) {
        e.preventDefault();
        if (isGameRunning) {
            setDirection(DIRECTION_KEYS[key]);
        }
        return;
    }
    
    // Space bar - Start game
    if (key === ' ' || key === 'Spacebar') {
        e.preventDefault();
        if (!isGameRunning) {
            startGame();
        }
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the game
 */
function init() {
    // Draw initial game board with start screen
    drawBoard();
    drawText('SNAKE', canvas.width / 2, canvas.height / 2 - 20, 16);
    drawText('PRESS SPACE', canvas.width / 2, canvas.height / 2 + 20, 6);
    drawText('TO START', canvas.width / 2, canvas.height / 2 + 35, 6);
    
    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);
    
    console.log('Nokia Snake game initialized. Press SPACE to start.');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
