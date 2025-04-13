/**
 * Game Manager - Handles game state and core game loop
 */

// Game states
const GameState = {
  LOADING: 'loading',
  RUNNING: 'running',
  PAUSED: 'paused',
  OVER: 'over'
};

class GameManager {
  constructor() {
    // Game state
    this.state = GameState.LOADING;
    this.score = 0;
    this.gameDistance = 0;
    this.lastSpawnTime = 0;
    this.enemySpawnRate = 3000; // milliseconds
    this.tankSpeed = 0.05;
    
    // Game objects
    this.tank = null;
    this.enemies = [];
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Performance limits
    this.maxEnemies = 50;
    this.maxParticles = 200;
    this.activeParticles = [];
    
    // Event listeners
    this.setupEventListeners();
  }
  
  init(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // Reset game state
    this.state = GameState.RUNNING;
    this.score = 0;
    this.gameDistance = 0;
    this.enemies = [];
    
    // Update UI
    UI.updateScore(this.score);
    UI.hideGameOver();
    
    // Create tank
    this.tank = new Tank(scene);
    
    // Start game loop
    this.animate();
  }
  
  setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Game over click to restart
    document.querySelector('#game-over').addEventListener('click', () => {
      if (this.state === GameState.OVER) {
        this.restart();
      }
    });
    
    // Space key to fire
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space' && this.state === GameState.RUNNING) {
        this.tank.fireNuke(this.enemies);
      }
    });
    
    // Pause/resume with 'P' key
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyP') {
        if (this.state === GameState.RUNNING) {
          this.pause();
        } else if (this.state === GameState.PAUSED) {
          this.resume();
        }
      }
    });
  }
  
  spawnEnemy(timestamp) {
    if (!this.lastSpawnTime) this.lastSpawnTime = timestamp;
    
    // Decrease spawn rate as game progresses (make it harder)
    const currentSpawnRate = Math.max(500, this.enemySpawnRate - this.gameDistance * 10);
    
    if (timestamp - this.lastSpawnTime > currentSpawnRate) {
      // Check if we've reached the enemy limit
      if (this.enemies.length >= this.maxEnemies) {
        // Remove oldest enemy
        const oldestEnemy = this.enemies.shift();
        this.scene.remove(oldestEnemy.mesh);
      }
      
      // Create new enemy
      const enemy = new Enemy(this.scene, this.tank.mesh.position.z + 50 + Math.random() * 20);
      this.enemies.push(enemy);
      this.lastSpawnTime = timestamp;
    }
  }
  
  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Update enemy
      enemy.update(this.tank.mesh.position);
      
      // Check if enemy reached the tank
      if (enemy.mesh.position.distanceTo(this.tank.mesh.position) < 2) {
        this.gameOver();
        return;
      }
      
      // Remove enemies that are too far behind
      if (enemy.mesh.position.z < this.tank.mesh.position.z - 20) {
        this.scene.remove(enemy.mesh);
        this.enemies.splice(i, 1);
      }
    }
  }
  
  updateParticles() {
    // Limit number of active particles
    if (this.activeParticles.length > this.maxParticles) {
      const excessCount = this.activeParticles.length - this.maxParticles;
      for (let i = 0; i < excessCount; i++) {
        const oldestParticle = this.activeParticles.shift();
        if (oldestParticle.parent) {
          oldestParticle.parent.remove(oldestParticle);
        }
      }
    }
    
    // Update remaining particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];
      
      // If particle has a lifetime property, decrement it
      if (particle.userData.lifetime !== undefined) {
        particle.userData.lifetime--;
        
        // If lifetime is over, remove particle
        if (particle.userData.lifetime <= 0) {
          if (particle.parent) {
            particle.parent.remove(particle);
          }
          this.activeParticles.splice(i, 1);
        }
      }
    }
  }
  
  addParticle(particle) {
    this.activeParticles.push(particle);
  }
  
  animate(timestamp) {
    if (this.state !== GameState.RUNNING) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    // Move the tank forward
    this.tank.move(this.tankSpeed);
    this.gameDistance += this.tankSpeed;
    
    // Move the camera with the tank
    this.camera.position.z = this.tank.mesh.position.z - 15;
    this.camera.lookAt(this.tank.mesh.position.x, this.tank.mesh.position.y + 2, this.tank.mesh.position.z + 10);
    
    // Spawn enemies
    this.spawnEnemy(timestamp);
    
    // Update enemies
    this.updateEnemies();
    
    // Update particles
    this.updateParticles();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  increaseScore(points = 1) {
    this.score += points;
    UI.updateScore(this.score);
  }
  
  pause() {
    if (this.state === GameState.RUNNING) {
      this.state = GameState.PAUSED;
      UI.showPaused();
    }
  }
  
  resume() {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.RUNNING;
      UI.hidePaused();
      this.animate();
    }
  }
  
  gameOver() {
    this.state = GameState.OVER;
    UI.showGameOver(this.score);
    
    // Play game over sound
    const sound = new Audio('./sounds/game_over.wav');
    sound.volume = 0.7;
    sound.play().catch(e => console.log('Game over sound error:', e));
  }
  
  restart() {
    // Clean up old game objects
    while (this.enemies.length > 0) {
      const enemy = this.enemies.pop();
      this.scene.remove(enemy.mesh);
    }
    
    // Clean up particles
    while (this.activeParticles.length > 0) {
      const particle = this.activeParticles.pop();
      if (particle.parent) {
        particle.parent.remove(particle);
      }
    }
    
    // Remove old tank
    if (this.tank) {
      this.scene.remove(this.tank.mesh);
    }
    
    // Reset game state
    this.init(this.scene, this.camera, this.renderer);
  }
}

// Export for use in other modules
export default GameManager;
export { GameState };
