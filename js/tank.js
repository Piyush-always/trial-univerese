/**
 * Tank class - Handles tank creation, movement, and firing
 */

import { addParticle } from './game.js';
import Nuke from './nuke.js';

class Tank {
  constructor(scene) {
    this.scene = scene;
    this.mesh = this.createTankMesh();
    this.dustParticles = this.createDustParticles();
    
    // Add tank to scene
    scene.add(this.mesh);
  }
  
  createTankMesh() {
    // Create tank group
    const tank = new THREE.Group();
    
    // Tank body
    const bodyGeometry = new THREE.BoxGeometry(2, 1, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5c5c5c,
      roughness: 0.7,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    
    // Tank turret
    const turretGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    const turretMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x444444,
      roughness: 0.6,
      metalness: 0.4
    });
    const turret = new THREE.Mesh(turretGeometry, turretMaterial);
    turret.position.y = 0.75;
    turret.castShadow = true;
    turret.receiveShadow = true;
    
    // Tank cannon
    const cannonGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16);
    const cannonMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.5,
      metalness: 0.5
    });
    const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    cannon.rotation.x = Math.PI / 2;
    cannon.position.y = 0.75;
    cannon.position.z = 1;
    cannon.castShadow = true;
    cannon.receiveShadow = true;
    
    // Tank treads
    const leftTreadGeometry = new THREE.BoxGeometry(0.4, 0.4, 3);
    const rightTreadGeometry = new THREE.BoxGeometry(0.4, 0.4, 3);
    const treadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x222222,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const leftTread = new THREE.Mesh(leftTreadGeometry, treadMaterial);
    leftTread.position.x = -1;
    leftTread.position.y = -0.3;
    leftTread.castShadow = true;
    leftTread.receiveShadow = true;
    
    const rightTread = new THREE.Mesh(rightTreadGeometry, treadMaterial);
    rightTread.position.x = 1;
    rightTread.position.y = -0.3;
    rightTread.castShadow = true;
    rightTread.receiveShadow = true;
    
    // Add all parts to tank group
    tank.add(body);
    tank.add(turret);
    tank.add(cannon);
    tank.add(leftTread);
    tank.add(rightTread);
    
    // Position tank at the bottom of the screen
    tank.position.y = 0.5;
    tank.position.z = 0;
    
    return tank;
  }
  
  createDustParticles() {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 3;
      positions[i3 + 1] = Math.random() * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 3 - 2;
      
      colors[i3] = 0.7;
      colors[i3 + 1] = 0.7;
      colors[i3 + 2] = 0.7;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const particles = new THREE.Points(geometry, material);
    this.mesh.add(particles);
    particles.position.y = -0.5;
    particles.position.z = -1.5;
    
    return particles;
  }
  
  move(speed) {
    // Move tank forward
    this.mesh.position.z += speed;
    
    // Update dust particles
    this.updateDustParticles();
  }
  
  updateDustParticles() {
    if (!this.dustParticles) return;
    
    const positions = this.dustParticles.geometry.attributes.position.array;
    const colors = this.dustParticles.geometry.attributes.color.array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      // Move particles backward
      positions[i3 + 2] -= 0.05;
      
      // Fade out particles
      colors[i3] -= 0.01;
      colors[i3 + 1] -= 0.01;
      colors[i3 + 2] -= 0.01;
      
      // Reset particles that go too far or fade out
      if (positions[i3 + 2] < -4 || colors[i3] <= 0) {
        positions[i3] = (Math.random() - 0.5) * 3;
        positions[i3 + 1] = Math.random() * 0.5;
        positions[i3 + 2] = (Math.random() - 0.5) * 1 - 2;
        
        colors[i3] = 0.7;
        colors[i3 + 1] = 0.7;
        colors[i3 + 2] = 0.7;
      }
    }
    
    this.dustParticles.geometry.attributes.position.needsUpdate = true;
    this.dustParticles.geometry.attributes.color.needsUpdate = true;
  }
  
  fireNuke(enemies) {
    if (enemies.length === 0) return;
    
    // Find the nearest enemy
    let nearestEnemy = null;
    let minDistance = Infinity;
    
    for (const enemy of enemies) {
      const distance = enemy.mesh.position.distanceTo(this.mesh.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestEnemy = enemy;
      }
    }
    
    if (nearestEnemy) {
      // Play firing sound
      const sound = new Audio('./sounds/nuke.wav');
      sound.volume = 0.5;
      sound.play().catch(e => console.log('Audio play error:', e));
      
      // Create and fire nuke
      const nuke = new Nuke(this.scene, this.mesh.position.clone(), nearestEnemy);
      nuke.fire(enemies);
    }
  }
}

export default Tank;
