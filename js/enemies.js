/**
 * Enemy class - Handles enemy creation and behavior
 */

class Enemy {
  constructor(scene, zPosition) {
    this.scene = scene;
    this.mesh = this.createEnemyMesh();
    
    // Position enemy
    this.mesh.position.x = Math.random() * 16 - 8; // Random x position between -8 and 8
    this.mesh.position.y = 1;
    this.mesh.position.z = zPosition;
    
    // Add enemy to scene
    scene.add(this.mesh);
  }
  
  createEnemyMesh() {
    const types = [
      { 
        geometry: new THREE.BoxGeometry(1.5, 1.5, 1.5),
        color: 0xff0000,
        emissive: 0x330000,
        speed: 0.08
      },
      { 
        geometry: new THREE.SphereGeometry(0.8, 16, 16),
        color: 0xff6600,
        emissive: 0x331100,
        speed: 0.12
      },
      { 
        geometry: new THREE.ConeGeometry(0.8, 2, 16),
        color: 0x990000,
        emissive: 0x220000,
        speed: 0.05
      }
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const geometry = type.geometry;
    const material = new THREE.MeshStandardMaterial({ 
      color: type.color,
      emissive: type.emissive,
      emissiveIntensity: 0.5,
      roughness: 0.7,
      metalness: 0.3
    });
    
    const enemy = new THREE.Mesh(geometry, material);
    enemy.castShadow = true;
    enemy.receiveShadow = true;
    
    // Store speed as a property of the enemy
    enemy.userData.speed = type.speed;
    
    return enemy;
  }
  
  update(targetPosition) {
    // Move towards the target
    const direction = new THREE.Vector3()
      .subVectors(targetPosition, this.mesh.position)
      .normalize();
    
    this.mesh.position.add(direction.clone().multiplyScalar(this.mesh.userData.speed));
    
    // Rotate the enemy
    this.mesh.rotation.y += 0.01;
    this.mesh.rotation.x += 0.005;
  }
}

export default Enemy;
