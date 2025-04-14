/**
 * Main Game Module - Initializes and manages the game
 */

import GameManager, { GameState } from './gameManager.js';
import Tank from './tank.js';
import Enemy from './enemies.js';
import VoiceHandler from './voiceHandler.js';
import UI from './ui.js';

// Re-export GameManager so it can be imported externally
export { GameManager, GameState, Tank, Enemy, VoiceHandler, UI };

// Create and export game manager instance
export const gameManager = new GameManager();
window.gameManager = gameManager; // Make available globally

// Initialize the game
export function initGame() {
  // Create scene
  const scene = createScene();
  
  // Create camera
  const camera = createCamera();
  
  // Create renderer
  const renderer = createRenderer();
  
  // Initialize game manager
  gameManager.init(scene, camera, renderer);
  
  // Initialize voice handler
  const voiceHandler = new VoiceHandler(gameManager.tank, gameManager.enemies);
  
  // Start game
  gameManager.animate(0);
  
  // Hide loading screen immediately
  UI.hideLoading();
}

// Create scene
function createScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x87ceeb, 0.01);
  scene.background = new THREE.Color(0x87ceeb); // Sky blue background
  
  // Create lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 0);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  scene.add(directionalLight);
  
  // Create ground
  const groundGeometry = new THREE.PlaneGeometry(20, 1000);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x228B22,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = 500;
  ground.receiveShadow = true;
  scene.add(ground);
  
  return scene;
}

// Create camera
function createCamera() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 8, -15);  // Higher and further back to see more of the scene
  camera.lookAt(0, 0, 10);
  return camera;
}

// Create renderer
function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

// Add particle to global tracking
export function addParticle(particle) {
  if (window.gameManager) {
    window.gameManager.addParticle(particle);
  }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', initGame);
