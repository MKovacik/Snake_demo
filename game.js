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
    
    // Nokia LCD Color Scheme
    COLORS: {
        BACKGROUND: '#9bbc0f',      // Light LCD green
        GRID: '#8bac0f',            // Subtle grid lines
        SNAKE: '#0f380f',           // Dark green (snake body)
        FOOD: '#0f380f',            // Same as snake
        TEXT: '#0f380f',            // Text color
    },
};

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

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the game board
 */
function init() {
    // Draw initial game board
    drawBoard();
    
    // Draw title text
    drawText('SNAKE', canvas.width / 2, canvas.height / 2 - 20, 16);
    drawText('PRESS SPACE', canvas.width / 2, canvas.height / 2 + 20, 6);
    drawText('TO START', canvas.width / 2, canvas.height / 2 + 35, 6);
    
    console.log('Nokia Snake game board initialized.');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
