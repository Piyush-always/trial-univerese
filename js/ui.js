/**
 * UI - Handles user interface elements and updates
 */

class UI {
  constructor() {
    this.scoreElement = document.getElementById('score');
    this.gameOverElement = document.getElementById('game-over');
    this.finalScoreElement = document.getElementById('final-score');
    this.pausedElement = null;
    
    // Create paused overlay if it doesn't exist
    if (!document.getElementById('paused')) {
      this.createPausedOverlay();
    } else {
      this.pausedElement = document.getElementById('paused');
    }
  }
  
  createPausedOverlay() {
    const pausedDiv = document.createElement('div');
    pausedDiv.id = 'paused';
    pausedDiv.style.position = 'absolute';
    pausedDiv.style.top = '50%';
    pausedDiv.style.left = '50%';
    pausedDiv.style.transform = 'translate(-50%, -50%)';
    pausedDiv.style.color = 'white';
    pausedDiv.style.fontSize = '48px';
    pausedDiv.style.fontFamily = 'Arial, sans-serif';
    pausedDiv.style.display = 'none';
    pausedDiv.style.textAlign = 'center';
    pausedDiv.style.textShadow = '2px 2px 4px black';
    pausedDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    pausedDiv.style.padding = '20px';
    pausedDiv.style.borderRadius = '10px';
    pausedDiv.textContent = 'PAUSED';
    
    const pauseInstructions = document.createElement('p');
    pauseInstructions.style.fontSize = '24px';
    pauseInstructions.textContent = 'Press P to resume';
    pausedDiv.appendChild(pauseInstructions);
    
    document.body.appendChild(pausedDiv);
    this.pausedElement = pausedDiv;
  }
  
  updateScore(score) {
    if (this.scoreElement) {
      this.scoreElement.textContent = score;
    }
  }
  
  showGameOver(score) {
    if (this.gameOverElement) {
      this.finalScoreElement.textContent = `Score: ${score}`;
      this.gameOverElement.style.display = 'block';
    }
  }
  
  hideGameOver() {
    if (this.gameOverElement) {
      this.gameOverElement.style.display = 'none';
    }
  }
  
  showPaused() {
    if (this.pausedElement) {
      this.pausedElement.style.display = 'block';
    }
  }
  
  hidePaused() {
    if (this.pausedElement) {
      this.pausedElement.style.display = 'none';
    }
  }
  
  showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
  }
  
  hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
}

// Create singleton instance
const ui = new UI();

// Export singleton
export default ui;
