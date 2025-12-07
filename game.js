/**
 * Nokia Snake Game
 * A browser-based recreation of the classic Nokia Snake game
 */

// Game Configuration
const CONFIG = {
    GRID_SIZE: 20,      // Number of cells
    CELL_SIZE: 12,      // Size of each cell in pixels
};

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
canvas.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;

// Disable image smoothing for crisp pixels
ctx.imageSmoothingEnabled = false;

// Initial render to verify canvas works
function init() {
    // Clear canvas with background color
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    console.log('Snake game initialized. Canvas ready.');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
