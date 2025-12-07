/**
 * Nokia Snake Game
 * A browser-based recreation of the classic Nokia Snake game
 * 
 * Features:
 * - Authentic Nokia LCD green color scheme
 * - Keyboard (Arrow keys, WASD) and touch controls
 * - Progressive difficulty (speed increases with score)
 * - High score persistence using localStorage
 * - Game states: Start, Playing, Paused, Game Over
 */

// =============================================================================
// GAME CONFIGURATION
// =============================================================================

const CONFIG = {
    // Grid settings
    GRID_SIZE: 20,          // Number of cells in each direction
    CELL_SIZE: 12,          // Size of each cell in pixels
    
    // Colors - Nokia LCD Green Theme
    COLORS: {
        BACKGROUND: '#9bbc0f',      // Light LCD green
        SNAKE: '#0f380f',           // Dark green (snake body)
        SNAKE_HEAD: '#306230',      // Slightly lighter for head
        FOOD: '#0f380f',            // Same as snake
        GRID: '#8bac0f',            // Subtle grid lines
        TEXT: '#0f380f',            // Text color
    },
    
    // Game settings
    INITIAL_SNAKE_LENGTH: 4,
    INITIAL_DIRECTION: 'RIGHT',
    
    // Speed settings (milliseconds per move) - Progressive difficulty
    SPEED_LEVELS: [
        { threshold: 0, speed: 150 },      // Starting speed
        { threshold: 50, speed: 130 },     // After 50 points
        { threshold: 100, speed: 110 },    // After 100 points
        { threshold: 200, speed: 90 },     // After 200 points
        { threshold: 300, speed: 75 },     // After 300 points
        { threshold: 500, speed: 60 },     // Maximum speed
    ],
    
    // Scoring
    POINTS_PER_FOOD: 10,
};

// =============================================================================
// GAME STATE
// =============================================================================

const GameState = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover',
};

// =============================================================================
// GAME CLASS
// =============================================================================

class SnakeGame {
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
        
        // Disable image smoothing for crisp pixels
        this.ctx.imageSmoothingEnabled = false;
        
        // Game state
        this.state = GameState.START;
        this.score = 0;
        this.highScore = this.loadHighScore();
        
        // Snake
        this.snake = [];
        this.direction = CONFIG.INITIAL_DIRECTION;
        this.nextDirection = CONFIG.INITIAL_DIRECTION;
        
        // Food
        this.food = null;
        
        // Game loop
        this.gameLoop = null;
        this.currentSpeed = CONFIG.SPEED_LEVELS[0].speed;
        
        // Input handling
        this.directionQueue = [];
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        // Update high score display
        this.updateScoreDisplay();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Draw initial start screen
        this.drawStartScreen();
    }
    
    /**
     * Set up keyboard and touch event listeners
     */
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Touch controls (D-pad buttons)
        const btnUp = document.getElementById('btn-up');
        const btnDown = document.getElementById('btn-down');
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        
        // Prevent default touch behavior and add click handlers
        [btnUp, btnDown, btnLeft, btnRight].forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
        });
        
        btnUp.addEventListener('click', () => this.queueDirection('UP'));
        btnDown.addEventListener('click', () => this.queueDirection('DOWN'));
        btnLeft.addEventListener('click', () => this.queueDirection('LEFT'));
        btnRight.addEventListener('click', () => this.queueDirection('RIGHT'));
        
        // Swipe controls for mobile
        this.setupSwipeControls();
    }
    
    /**
     * Set up swipe gesture controls for mobile
     */
    setupSwipeControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 30;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            // Determine swipe direction
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
                // Horizontal swipe
                this.queueDirection(dx > 0 ? 'RIGHT' : 'LEFT');
            } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipeDistance) {
                // Vertical swipe
                this.queueDirection(dy > 0 ? 'DOWN' : 'UP');
            } else if (this.state === GameState.START || this.state === GameState.GAME_OVER) {
                // Tap to start/restart
                this.startGame();
            } else if (this.state === GameState.PLAYING) {
                // Tap to pause
                this.pauseGame();
            } else if (this.state === GameState.PAUSED) {
                // Tap to resume
                this.resumeGame();
            }
        }, { passive: true });
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        const key = e.key;
        
        // Direction keys
        const directionMap = {
            'ArrowUp': 'UP', 'w': 'UP', 'W': 'UP',
            'ArrowDown': 'DOWN', 's': 'DOWN', 'S': 'DOWN',
            'ArrowLeft': 'LEFT', 'a': 'LEFT', 'A': 'LEFT',
            'ArrowRight': 'RIGHT', 'd': 'RIGHT', 'D': 'RIGHT',
        };
        
        if (directionMap[key]) {
            e.preventDefault();
            this.queueDirection(directionMap[key]);
            return;
        }
        
        // Space bar - Start/Pause/Resume/Restart
        if (key === ' ' || key === 'Spacebar') {
            e.preventDefault();
            this.handleSpaceBar();
            return;
        }
        
        // P key - Pause/Resume
        if (key === 'p' || key === 'P') {
            e.preventDefault();
            if (this.state === GameState.PLAYING) {
                this.pauseGame();
            } else if (this.state === GameState.PAUSED) {
                this.resumeGame();
            }
        }
    }
    
    /**
     * Handle space bar press
     */
    handleSpaceBar() {
        switch (this.state) {
            case GameState.START:
            case GameState.GAME_OVER:
                this.startGame();
                break;
            case GameState.PLAYING:
                this.pauseGame();
                break;
            case GameState.PAUSED:
                this.resumeGame();
                break;
        }
    }
    
    /**
     * Queue a direction change
     * Prevents 180-degree turns and handles rapid inputs
     */
    queueDirection(newDirection) {
        if (this.state !== GameState.PLAYING) return;
        
        // Get the last queued direction or current direction
        const lastDirection = this.directionQueue.length > 0 
            ? this.directionQueue[this.directionQueue.length - 1] 
            : this.direction;
        
        // Prevent 180-degree turns
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT',
        };
        
        if (opposites[newDirection] === lastDirection) return;
        if (newDirection === lastDirection) return;
        
        // Limit queue size to prevent input flooding
        if (this.directionQueue.length < 2) {
            this.directionQueue.push(newDirection);
        }
    }
    
    /**
     * Start a new game
     */
    startGame() {
        // Reset game state
        this.state = GameState.PLAYING;
        this.score = 0;
        this.direction = CONFIG.INITIAL_DIRECTION;
        this.nextDirection = CONFIG.INITIAL_DIRECTION;
        this.directionQueue = [];
        this.currentSpeed = CONFIG.SPEED_LEVELS[0].speed;
        
        // Initialize snake in the center
        this.initSnake();
        
        // Spawn first food
        this.spawnFood();
        
        // Update display
        this.updateScoreDisplay();
        
        // Start game loop
        this.startGameLoop();
    }
    
    /**
     * Initialize snake at starting position
     */
    initSnake() {
        this.snake = [];
        const startX = Math.floor(CONFIG.GRID_SIZE / 2);
        const startY = Math.floor(CONFIG.GRID_SIZE / 2);
        
        // Create snake segments from head to tail
        for (let i = 0; i < CONFIG.INITIAL_SNAKE_LENGTH; i++) {
            this.snake.push({
                x: startX - i,
                y: startY
            });
        }
    }
    
    /**
     * Spawn food at a random valid position
     */
    spawnFood() {
        const validPositions = [];
        
        // Find all valid positions (not occupied by snake)
        for (let x = 0; x < CONFIG.GRID_SIZE; x++) {
            for (let y = 0; y < CONFIG.GRID_SIZE; y++) {
                const isOnSnake = this.snake.some(segment => 
                    segment.x === x && segment.y === y
                );
                if (!isOnSnake) {
                    validPositions.push({ x, y });
                }
            }
        }
        
        // Check for win condition (snake fills entire board)
        if (validPositions.length === 0) {
            this.handleWin();
            return;
        }
        
        // Pick random position
        const randomIndex = Math.floor(Math.random() * validPositions.length);
        this.food = validPositions[randomIndex];
    }
    
    /**
     * Start the game loop
     */
    startGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.currentSpeed);
    }
    
    /**
     * Update game speed based on score
     */
    updateSpeed() {
        const newSpeed = CONFIG.SPEED_LEVELS
            .filter(level => this.score >= level.threshold)
            .pop().speed;
        
        if (newSpeed !== this.currentSpeed) {
            this.currentSpeed = newSpeed;
            this.startGameLoop(); // Restart loop with new speed
        }
    }
    
    /**
     * Pause the game
     */
    pauseGame() {
        if (this.state !== GameState.PLAYING) return;
        
        this.state = GameState.PAUSED;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.draw();
    }
    
    /**
     * Resume the game
     */
    resumeGame() {
        if (this.state !== GameState.PAUSED) return;
        
        this.state = GameState.PLAYING;
        this.startGameLoop();
    }
    
    /**
     * Main game update function
     */
    update() {
        if (this.state !== GameState.PLAYING) return;
        
        // Process direction queue
        if (this.directionQueue.length > 0) {
            this.direction = this.directionQueue.shift();
        }
        
        // Calculate new head position
        const head = { ...this.snake[0] };
        
        switch (this.direction) {
            case 'UP':    head.y--; break;
            case 'DOWN':  head.y++; break;
            case 'LEFT':  head.x--; break;
            case 'RIGHT': head.x++; break;
        }
        
        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            // Remove tail if not eating
            this.snake.pop();
        }
    }
    
    /**
     * Check for wall or self collision
     */
    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= CONFIG.GRID_SIZE ||
            head.y < 0 || head.y >= CONFIG.GRID_SIZE) {
            return true;
        }
        
        // Self collision (check against all body segments)
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Handle eating food
     */
    eatFood() {
        // Increase score
        this.score += CONFIG.POINTS_PER_FOOD;
        this.updateScoreDisplay();
        
        // Update speed based on new score
        this.updateSpeed();
        
        // Spawn new food
        this.spawnFood();
    }
    
    /**
     * Handle game over
     */
    gameOver() {
        this.state = GameState.GAME_OVER;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        this.updateScoreDisplay();
        
        // Add shake animation
        this.canvas.parentElement.classList.add('shake');
        setTimeout(() => {
            this.canvas.parentElement.classList.remove('shake');
        }, 300);
        
        this.draw();
    }
    
    /**
     * Handle win condition (snake fills board)
     */
    handleWin() {
        this.state = GameState.GAME_OVER;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        this.updateScoreDisplay();
        this.draw();
    }
    
    /**
     * Main draw function
     */
    draw() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (subtle)
        this.drawGrid();
        
        // Draw based on state
        switch (this.state) {
            case GameState.START:
                this.drawStartScreen();
                break;
            case GameState.PLAYING:
            case GameState.PAUSED:
                this.drawGame();
                if (this.state === GameState.PAUSED) {
                    this.drawPauseOverlay();
                }
                break;
            case GameState.GAME_OVER:
                this.drawGame();
                this.drawGameOverScreen();
                break;
        }
    }
    
    /**
     * Draw subtle grid lines
     */
    drawGrid() {
        this.ctx.strokeStyle = CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= CONFIG.GRID_SIZE; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * CONFIG.CELL_SIZE, 0);
            this.ctx.lineTo(i * CONFIG.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * CONFIG.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, i * CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw game elements (snake and food)
     */
    drawGame() {
        // Draw food
        if (this.food) {
            this.drawFood();
        }
        
        // Draw snake
        this.drawSnake();
    }
    
    /**
     * Draw the snake
     */
    drawSnake() {
        this.snake.forEach((segment, index) => {
            // Head is slightly different color
            this.ctx.fillStyle = index === 0 ? CONFIG.COLORS.SNAKE_HEAD : CONFIG.COLORS.SNAKE;
            
            // Draw segment with small padding for grid visibility
            const padding = 1;
            this.ctx.fillRect(
                segment.x * CONFIG.CELL_SIZE + padding,
                segment.y * CONFIG.CELL_SIZE + padding,
                CONFIG.CELL_SIZE - padding * 2,
                CONFIG.CELL_SIZE - padding * 2
            );
        });
    }
    
    /**
     * Draw the food
     */
    drawFood() {
        this.ctx.fillStyle = CONFIG.COLORS.FOOD;
        
        // Draw food as a slightly smaller square (Nokia style)
        const padding = 2;
        this.ctx.fillRect(
            this.food.x * CONFIG.CELL_SIZE + padding,
            this.food.y * CONFIG.CELL_SIZE + padding,
            CONFIG.CELL_SIZE - padding * 2,
            CONFIG.CELL_SIZE - padding * 2
        );
    }
    
    /**
     * Draw start screen
     */
    drawStartScreen() {
        this.ctx.fillStyle = CONFIG.COLORS.TEXT;
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        
        // Title
        this.ctx.fillText('SNAKE', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Instructions
        this.ctx.font = '6px "Press Start 2P"';
        this.ctx.fillText('PRESS SPACE', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('TO START', this.canvas.width / 2, this.canvas.height / 2 + 25);
        
        // High score
        if (this.highScore > 0) {
            this.ctx.fillText(`HIGH: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }
    
    /**
     * Draw pause overlay
     */
    drawPauseOverlay() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(155, 188, 15, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pause text
        this.ctx.fillStyle = CONFIG.COLORS.TEXT;
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '6px "Press Start 2P"';
        this.ctx.fillText('PRESS SPACE', this.canvas.width / 2, this.canvas.height / 2 + 25);
        this.ctx.fillText('TO CONTINUE', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    /**
     * Draw game over screen
     */
    drawGameOverScreen() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(155, 188, 15, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = CONFIG.COLORS.TEXT;
        this.ctx.textAlign = 'center';
        
        // Game Over text
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        // Score
        this.ctx.font = '8px "Press Start 2P"';
        this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        
        // High score notification
        if (this.score === this.highScore && this.score > 0) {
            this.ctx.fillText('NEW HIGH!', this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
        
        // Restart instruction
        this.ctx.font = '6px "Press Start 2P"';
        this.ctx.fillText('PRESS SPACE', this.canvas.width / 2, this.canvas.height / 2 + 45);
        this.ctx.fillText('TO RESTART', this.canvas.width / 2, this.canvas.height / 2 + 58);
    }
    
    /**
     * Update score display in HTML
     */
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
    }
    
    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    }
    
    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
}

// =============================================================================
// INITIALIZE GAME
// =============================================================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new SnakeGame();
    
    // Expose game instance for debugging (optional)
    window.snakeGame = game;
});
