/**
 * Nuke class - Handles projectile creation, movement, and explosion
 */

import { GameManager } from './game.js';

class Nuke {
  constructor(scene, startPosition, targetEnemy) {
    this.scene = scene;
    this.startPosition = startPosition.clone();
    this.startPosition.y += 0.75; // Adjust to cannon height
    this.startPosition.z += 1.5;  // Adjust to front of cannon
    this.targetEnemy = targetEnemy;
    this.mesh = this.createNukeMesh();
    this.trailParticles = [];
    
    // Calculate direction to target
    this.direction = new THREE.Vector3()
      .subVectors(targetEnemy.mesh.position, this.startPosition)
      .normalize();
    
    // Add nuke to scene
    scene.add(this.mesh);
  }
  
  createNukeMesh() {
    // Create nuke projectile
    const nukeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const nukeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1.0
    });
    const nuke = new THREE.Mesh(nukeGeometry, nukeMaterial);
    
    // Add glow to nuke
    const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    nuke.add(glow);
    
    // Position the nuke
    nuke.position.copy(this.startPosition);
    
    return nuke;
  }
  
  fire(enemies) {
    const animate = () => {
      if (!this.mesh) return;
      
      // Move the nuke
      this.mesh.position.add(this.direction.clone().multiplyScalar(0.5));
      
      // Add trail particle with limited lifetime
      this.addTrailParticle();
      
      // Update trail particles
      this.updateTrailParticles();
      
      // Check if the nuke hit the target or went too far
      if (this.targetEnemy && this.mesh.position.distanceTo(this.targetEnemy.mesh.position) < 1) {
        // Explosion
        this.explode(enemies);
        
        // Remove the nuke and trail
        this.cleanup();
        
        return;
      }
      
      // Continue animation if still in scene
      if (this.mesh.parent) {
        requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animate();
  }
  
  addTrailParticle() {
    // Limit number of trail particles for performance
    if (this.trailParticles.length > 20) {
      const oldestParticle = this.trailParticles.shift();
      this.scene.remove(oldestParticle);
    }
    
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.7
    });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.copy(this.mesh.position);
    particle.userData.lifetime = 20;
    this.scene.add(particle);
    this.trailParticles.push(particle);
    
    // Add to global particle tracking for performance management
    if (window.gameManager) {
      window.gameManager.addParticle(particle);
    }
  }
  
  updateTrailParticles() {
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.userData.lifetime--;
      p.material.opacity = p.userData.lifetime / 20;
      
      if (p.userData.lifetime <= 0) {
        this.scene.remove(p);
        this.trailParticles.splice(i, 1);
      }
    }
  }
  
  explode(enemies) {
    // Play explosion sound
    const sound = new Audio('./sounds/explosion.wav');
    sound.volume = 0.7;
    sound.play().catch(e => console.log('Audio play error:', e));
    
    // Create explosion effect
    this.createExplosionEffect(this.mesh.position.clone());
    
    // Check for enemies in the blast radius
    const blastRadius = 5;
    const hitEnemies = [];
    
    for (const enemy of enemies) {
      if (enemy.mesh.position.distanceTo(this.mesh.position) < blastRadius) {
        hitEnemies.push(enemy);
      }
    }
    
    // Remove hit enemies and update score
    for (const enemy of hitEnemies) {
      const index = enemies.indexOf(enemy);
      if (index > -1) {
        enemies.splice(index, 1);
        this.scene.remove(enemy.mesh);
        
        // Update score
        if (window.gameManager) {
          window.gameManager.increaseScore();
        }
      }
    }
  }
  
  // createExplosionEffect(position) {
  //   // Create particles for the explosion
  //   const particleCount = 100;
  //   const geometry = new THREE.BufferGeometry();
  //   const positions = new Float32Array(particleCount * 3);
  //   const colors = new Float32Array(particleCount * 3);
  //   const sizes = new Float32Array(particleCount);
    
  //   const color = new THREE.Color();
    
  //   for (let i = 0; i < particleCount; i++) {
  //     // Random position within sphere
  //     const i3 = i * 3;
  //     const angle = Math.random() * Math.PI * 2;
  //     const z = Math.random() * 2 - 1;
  //     const x = Math.sqrt(1 - z * z) * Math.cos(angle);
  //     const y = Math.sqrt(1 - z * z) * Math.sin(angle);
      
  //     positions[i3] = x * 5 * (Math.random() * 0.3 + 0.7);
  //     positions[i3 + 1] = y * 5 * (Math.random() * 0.3 + 0.7);
  //     positions[i3 + 2] = z * 5 * (Math.random() * 0.3 + 0.7);
      
  //     // Color gradient from yellow to red
  //     const colorVal = Math.random();
  //     color.setHSL(0.1 - colorVal * 0.1, 1.0, 0.5 + colorVal * 0.5);
      
  //     colors[i3] = color.r;
  //     colors[i3 + 1] = color.g;
  //     colors[i3 + 2] = color.b;
      
  //     // Random sizes
  //     sizes[i] = Math.random() * 2 + 0.5;
  //   }
    
  //   geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  //   geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  //   geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
  //   const material = new THREE.PointsMaterial({
  //     size: 0.5,
  //     color: 0xffffff,
  //     vertexColors: true,
  //     transparent: true,
  //     blending: THREE.AdditiveBlending,
  //     depthWrite: false
  //   });
    
  //   const particles = new THREE.Points(geometry, material);
  //   particles.position.copy(position);
  //   this.scene.add(particles);
    
  //   // Add to global particle tracking
  //   if (window.gameManager) {
  //     window.gameManager.addParticle(particles);
  //   }
    
  //   // Create shockwave ring
  //   const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
  //   const shockwaveMaterial = new THREE.MeshBasicMaterial({
  //     color: 0xffff99,
  //     transparent: true,
  //     opacity: 0.7,
  //     side: THREE.DoubleSide
  //   });
    
  //   const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
  //   shockwave.position.copy(position);
  //   shockwave.rotation.x = Math.PI / 2;
  //   this.scene.add(shockwave);
    
  //   // Add to global particle tracking
  //   if (window.gameManager) {
  //     window.gameManager.addParticle(shockwave);
  //   }
    
  //   // Animate explosion
  //   const animateExplosion = () => {
  //     if (!particles.geometry) return;
      
  //     const positions = particles.geometry.attributes.position.array;
      
  //     for (let i = 0; i < particleCount; i++) {
  //       const i3 = i * 3;
        
  //       // Expand particles outward
  //       positions[i3] *= 1.02;
  //       positions[i3 + 1] *= 1.02;
  //       positions[i3 + 2] *= 1.02;
        
  //       // Apply gravity to y component
  //       positions[i3 + 1] -= 0.05;
  //     }
      
  //     particles.geometry.attributes.position.needsUpdate = true;
      
  //     // Fade out particles
  //     material.opacity -= 0.01;
      
  //     // Remove if fully faded
  //     if (material.opacity <= 0) {
  //       this.scene.remove(particles);
  //       return;
  //     }
      
  //     requestAnimationFrame(animateExplosion);
  //   };
    
  //   // Animate shockwave
  //   const animateShockwave = () => {
  //     if (!shockwave.geometry) return;
      
  //     // Expand shockwave
  //     shockwave.scale.x += 0.2;
  //     shockwave.scale.y += 0.2;
      
  //     // Fade out shockwave
  //     shockwaveMaterial.opacity -= 0.02;
      
  //     // Remove if fully faded
  //     if (shockwaveMaterial.opacity <= 0) {
  //       this.scene.remove(shockwave);
  //       return;
  //     }
      
  //     requestAnimationFrame(animateShockwave);
  //   };
    
  //   animateExplosion();
  //   animateShockwave();
  // }

  createExplosionEffect(position) {
    const scene = this.scene;
  
    // --- Particle System (Orange Fire & Smoke) ---
    const particleCount = 180; // Slightly increase particle count
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
  
    const fireOrange = new THREE.Color(0xffa500);
    const lightOrange = new THREE.Color(0xffd700); // A brighter orange for inner glow
    const darkSmoke = new THREE.Color(0x222222);
    const lightSmoke = new THREE.Color(0x555555);
  
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
  
      // Position: Start in a slightly denser core
      const angle = Math.random() * Math.PI * 2;
      const z = Math.random() * 2 - 1;
      const radius = Math.sqrt(1 - z * z);
      const x = radius * 1.2 * (Math.random() * 0.4 + 0.6);
      const y = radius * 1.2 * (Math.random() * 0.4 + 0.6);
  
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z * 1.2 * (Math.random() * 0.4 + 0.6);
  
      // Velocity: Stronger outward burst with some upward bias
      const speed = Math.random() * 4 + 3;
      const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 1 + 0.5, // Bias towards upward movement
        Math.random() * 2 - 1
      ).normalize();
      direction.multiplyScalar(speed);
      velocities[i3] = direction.x;
      velocities[i3 + 1] = direction.y;
      velocities[i3 + 2] = direction.z;
  
      // Color: More emphasis on orange and smoke
      if (Math.random() > 0.7) { // 30% chance of smoke
        const smokeMix = Math.random();
        const interpolatedSmoke = new THREE.Color().lerpColors(darkSmoke, lightSmoke, smokeMix);
        colors[i3] = interpolatedSmoke.r;
        colors[i3 + 1] = interpolatedSmoke.g;
        colors[i3 + 2] = interpolatedSmoke.b;
      } else {
        const fireMix = Math.random();
        const interpolatedFire = new THREE.Color().lerpColors(fireOrange, lightOrange, fireMix);
        colors[i3] = interpolatedFire.r;
        colors[i3 + 1] = interpolatedFire.g;
        colors[i3 + 2] = interpolatedFire.b;
      }
  
      // Size: Smaller initial size, grows slightly faster
      sizes[i] = Math.random() * 1 + 0.5;
    }
  
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  
    const material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  
    const particles = new THREE.Points(geometry, material);
    particles.position.copy(position);
    scene.add(particles);
  
    if (window.gameManager) {
      window.gameManager.addParticle(particles);
    }
  
    // --- Bright Orange Light Source ---
    const explosionLight = new THREE.PointLight(0xffd700, 3, 15); // Brighter, slightly further
    explosionLight.position.copy(position);
    scene.add(explosionLight);
  
    const animateLight = () => {
      explosionLight.intensity -= 0.15; // Fade out faster
      explosionLight.distance -= 0.75;
      if (explosionLight.intensity <= 0) {
        scene.remove(explosionLight);
        return;
      }
      requestAnimationFrame(animateLight);
    };
    animateLight();
  
    // --- Subtle Expanding Orange Glow (Sphere) ---
    const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    glowSphere.position.copy(position);
    scene.add(glowSphere);
  
    if (window.gameManager) {
      window.gameManager.addParticle(glowSphere);
    }
  
    const animateGlow = () => {
      glowSphere.scale.multiplyScalar(1.08); // Expand quickly
      glowMaterial.opacity -= 0.03;
      if (glowMaterial.opacity <= 0) {
        scene.remove(glowSphere);
        glowGeometry.dispose();
        glowMaterial.dispose();
        return;
      }
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  
    // --- Animation ---
    const animateExplosion = () => {
      if (!particles.geometry) return;
  
      const positions = particles.geometry.attributes.position.array;
      const sizes = particles.geometry.attributes.size.array;
      const velocities = particles.geometry.attributes.velocity.array;
  
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
  
        positions[i3] += velocities[i3] * 0.025; // Move slightly faster
        positions[i3 + 1] += velocities[i3 + 1] * 0.025;
        positions[i3 + 2] += velocities[i3 + 2] * 0.025;
  
        velocities[i3] *= 0.97; // More drag for faster dissipation
        velocities[i3 + 1] *= 0.97;
        velocities[i3 + 2] *= 0.97;
  
        sizes[i] += 0.01; // Particles grow a bit initially
        material.opacity -= 0.003;
  
        if (material.opacity <= 0 || sizes[i] > 3) { // Remove if too faded or large
          const start = i * 3;
          positions.splice(start, 3);
          colors.splice(start, 3);
          velocities.splice(start, 3);
          sizes.splice(i, 1);
          particleCount--;
          i--; // Adjust index due to removal
        }
      }
  
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;
      particles.geometry.attributes.size.needsUpdate = true;
      particles.geometry.attributes.velocity.needsUpdate = true;
      particles.geometry.setDrawRange(0, particleCount); // Update draw range
  
      if (particleCount === 0) {
        scene.remove(particles);
        particles.geometry.dispose();
        material.dispose();
        return;
      }
  
      requestAnimationFrame(animateExplosion);
    };
  
    animateExplosion();
  }







  cleanup() {
    // Remove nuke from scene
    if (this.mesh && this.mesh.parent) {
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
    
    // Remove all trail particles
    for (const particle of this.trailParticles) {
      if (particle.parent) {
        this.scene.remove(particle);
      }
    }
    this.trailParticles = [];
  }
}

export default Nuke;
