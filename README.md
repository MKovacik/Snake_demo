# 🐍 Nokia Snake Game

A browser-based recreation of the classic Nokia Snake game, built with vanilla HTML5, CSS3, and JavaScript.

![Nokia Snake Game](https://img.shields.io/badge/Game-Snake-green)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-blue)

## 🎮 Play the Game

Simply open `index.html` in any modern web browser - no build step or server required!

## ✨ Features

- **Authentic Nokia Experience**: Classic LCD green color scheme and pixelated aesthetics
- **Responsive Design**: Works on desktop and mobile devices
- **Multiple Controls**:
  - ⌨️ Keyboard: Arrow keys or WASD
  - 📱 Touch: Swipe gestures or on-screen D-pad
- **Progressive Difficulty**: Speed increases as your score grows
- **High Score Persistence**: Your best score is saved locally
- **Game States**: Start screen, pause functionality, and game over screen

## 🎯 How to Play

1. **Start**: Press `SPACE` or tap the screen to begin
2. **Move**: Use arrow keys, WASD, swipe, or the D-pad to change direction
3. **Eat**: Guide the snake to eat food (the small squares)
4. **Grow**: Each food item makes your snake longer and increases your score
5. **Survive**: Avoid hitting the walls or your own tail!
6. **Pause**: Press `SPACE` or `P` to pause the game

## 🏗️ Project Structure

```
├── index.html    # Main HTML entry point
├── style.css     # Nokia-style CSS styling
├── game.js       # Complete game logic
└── README.md     # This file
```

## 🛠️ Technical Details

- **Rendering**: HTML5 Canvas with pixel-perfect rendering
- **Game Loop**: `setInterval` with dynamic speed adjustment
- **No Dependencies**: Pure vanilla JavaScript - no frameworks or libraries
- **Storage**: `localStorage` for high score persistence

### Game Configuration

The game can be customized by modifying the `CONFIG` object in `game.js`:

```javascript
const CONFIG = {
    GRID_SIZE: 20,          // Number of cells
    CELL_SIZE: 12,          // Pixels per cell
    INITIAL_SNAKE_LENGTH: 4,
    POINTS_PER_FOOD: 10,
    // Speed levels for progressive difficulty
    SPEED_LEVELS: [
        { threshold: 0, speed: 150 },
        { threshold: 50, speed: 130 },
        // ... more levels
    ],
};
```

## 🎨 Design

The visual design replicates the iconic Nokia 3310 LCD display:

- **Background**: `#9bbc0f` (classic LCD green)
- **Snake/Food**: `#0f380f` (dark green)
- **Font**: "Press Start 2P" for authentic retro feel
- **Phone Frame**: CSS recreation of Nokia phone aesthetics

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome for Android)

## 📜 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

- Inspired by the original Nokia Snake game (1998)
- Font: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by CodeMan38

---

*Enjoy the nostalgia! 🎮*
