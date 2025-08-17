// Main entry point for BlockStrike game
let game = null;

// Wait for the page to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('BlockStrike loading...');
    
    // Check for required dependencies
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        showError('Failed to load Three.js library');
        return;
    }
    
    if (typeof CANNON === 'undefined') {
        console.error('Cannon.js not loaded');
        showError('Failed to load Cannon.js physics library');
        return;
    }
    
    // Initialize the game
    try {
        game = new Game();
        console.log('BlockStrike initialized successfully');
        
        // Hide loading screen after a delay
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError('Failed to initialize game: ' + error.message);
    }
});

// Handle page visibility changes (pause/resume game)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            game.pauseGame();
        } else if (game.gameState === 'paused') {
            // Don't auto-resume, let player click to resume
        }
    }
});

// Handle window beforeunload (cleanup)
window.addEventListener('beforeunload', () => {
    if (game) {
        // Cleanup game resources
        console.log('Cleaning up game resources...');
    }
});

// Error handling
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.background = 'rgba(231, 76, 60, 0.9)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.borderRadius = '10px';
    errorDiv.style.fontFamily = 'Courier New, monospace';
    errorDiv.style.fontSize = '16px';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.zIndex = '10000';
    errorDiv.style.maxWidth = '400px';
    
    errorDiv.innerHTML = `
        <h3>Error</h3>
        <p>${message}</p>
        <p>Please refresh the page and try again.</p>
    `;
    
    document.body.appendChild(errorDiv);
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    if (game) {
        // Try to gracefully handle the error
        game.pauseGame();
    }
});

// Export game instance for debugging
window.game = game;