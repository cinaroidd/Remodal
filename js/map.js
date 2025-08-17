class MapSystem {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.world = game.world;
        
        this.blocks = new Map();
        this.blockSize = 1;
        this.mapData = null;
        this.currentMap = null;
        
        // Block types
        this.blockTypes = {
            grass: { color: 0x7CB342, destructible: true, health: 100 },
            dirt: { color: 0x8D6E63, destructible: true, health: 80 },
            stone: { color: 0x757575, destructible: true, health: 200 },
            wood: { color: 0xA1887F, destructible: true, health: 120 },
            concrete: { color: 0xBDBDBD, destructible: false, health: -1 },
            metal: { color: 0x546E7A, destructible: false, health: -1 },
            water: { color: 0x2196F3, destructible: false, health: -1 },
            sand: { color: 0xFFE082, destructible: true, health: 60 }
        };
        
        // Predefined maps
        this.maps = {
            'de_dust2_blocks': this.createDust2Map(),
            'test_arena': this.createTestArena()
        };
    }
    
    loadMap(mapName) {
        console.log('Loading map:', mapName);
        
        if (this.maps[mapName]) {
            this.clearMap();
            this.currentMap = mapName;
            this.mapData = this.maps[mapName];
            this.buildMap();
        } else {
            console.error('Map not found:', mapName);
            // Load default test arena
            this.loadMap('test_arena');
        }
    }
    
    clearMap() {
        // Remove all existing blocks
        this.blocks.forEach((blockData, key) => {
            if (blockData.mesh) {
                this.scene.remove(blockData.mesh);
            }
            if (blockData.body) {
                this.world.remove(blockData.body);
            }
        });
        this.blocks.clear();
    }
    
    buildMap() {
        if (!this.mapData) return;
        
        console.log('Building map with', this.mapData.blocks.length, 'blocks');
        
        this.mapData.blocks.forEach(blockInfo => {
            this.createBlock(
                blockInfo.x, 
                blockInfo.y, 
                blockInfo.z, 
                blockInfo.type
            );
        });
        
        // Add spawn points
        if (this.mapData.spawnPoints) {
            this.setupSpawnPoints(this.mapData.spawnPoints);
        }
    }
    
    createBlock(x, y, z, type) {
        const key = `${x},${y},${z}`;
        
        if (this.blocks.has(key)) {
            console.warn('Block already exists at', key);
            return;
        }
        
        const blockType = this.blockTypes[type] || this.blockTypes.stone;
        
        // Create visual mesh
        const geometry = this.game.createBlockGeometry(this.blockSize);
        const material = this.game.createBlockMaterial(blockType.color);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add metadata
        mesh.userData = {
            type: 'block',
            blockType: type,
            destructible: blockType.destructible,
            health: blockType.health,
            maxHealth: blockType.health,
            position: { x, y, z }
        };
        
        this.scene.add(mesh);
        
        // Create physics body
        const shape = new CANNON.Box(new CANNON.Vec3(
            this.blockSize / 2, 
            this.blockSize / 2, 
            this.blockSize / 2
        ));
        const body = new CANNON.Body({ mass: 0 }); // Static body
        body.addShape(shape);
        body.position.set(x, y, z);
        this.world.add(body);
        
        // Store block data
        this.blocks.set(key, {
            mesh: mesh,
            body: body,
            type: type,
            health: blockType.health,
            maxHealth: blockType.health
        });
    }
    
    destroyBlock(blockMesh) {
        if (!blockMesh.userData || !blockMesh.userData.destructible) return;
        
        const pos = blockMesh.userData.position;
        const key = `${pos.x},${pos.y},${pos.z}`;
        const blockData = this.blocks.get(key);
        
        if (blockData) {
            // Remove from scene and physics world
            this.scene.remove(blockData.mesh);
            this.world.remove(blockData.body);
            
            // Remove from blocks map
            this.blocks.delete(key);
            
            // Create destruction particles
            this.createDestructionParticles(pos, blockData.type);
            
            // Play destruction sound
            if (this.game.audio) {
                this.game.audio.playSound('blockBreak');
            }
            
            console.log('Block destroyed at', key);
        }
    }
    
    damageBlock(blockMesh, damage) {
        if (!blockMesh.userData || !blockMesh.userData.destructible) return;
        
        const pos = blockMesh.userData.position;
        const key = `${pos.x},${pos.y},${pos.z}`;
        const blockData = this.blocks.get(key);
        
        if (blockData && blockData.health > 0) {
            blockData.health -= damage;
            
            // Visual damage indication
            const healthPercent = blockData.health / blockData.maxHealth;
            const material = blockMesh.material;
            
            // Darken the block as it takes damage
            const originalColor = this.blockTypes[blockData.type].color;
            const darkenAmount = 1 - (healthPercent * 0.5 + 0.5);
            material.color.setHex(originalColor).multiplyScalar(1 - darkenAmount);
            
            if (blockData.health <= 0) {
                this.destroyBlock(blockMesh);
            }
        }
    }
    
    createDestructionParticles(position, blockType) {
        const particleCount = 8;
        const blockColor = this.blockTypes[blockType].color;
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: blockColor,
                transparent: true,
                opacity: 0.8 
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Random position around the destroyed block
            particle.position.set(
                position.x + (Math.random() - 0.5) * 0.8,
                position.y + (Math.random() - 0.5) * 0.8,
                position.z + (Math.random() - 0.5) * 0.8
            );
            
            this.scene.add(particle);
            
            // Animate particles
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 5
            );
            
            this.animateParticle(particle, velocity);
        }
    }
    
    animateParticle(particle, velocity) {
        const gravity = -9.8;
        const startTime = Date.now();
        const lifetime = 2000; // 2 seconds
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const t = elapsed / 1000; // Convert to seconds
            
            if (elapsed >= lifetime) {
                this.scene.remove(particle);
                return;
            }
            
            // Apply physics
            particle.position.x += velocity.x * 0.016;
            particle.position.z += velocity.z * 0.016;
            particle.position.y += velocity.y * 0.016 + gravity * t * 0.016;
            
            // Fade out
            particle.material.opacity = 1 - (elapsed / lifetime);
            
            // Continue animation
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    setupSpawnPoints(spawnPoints) {
        this.spawnPoints = {
            terrorist: spawnPoints.terrorist || [],
            counter: spawnPoints.counter || []
        };
        
        // Create visual indicators for spawn points (for debugging)
        if (this.game.settings.debug) {
            this.createSpawnPointIndicators();
        }
    }
    
    createSpawnPointIndicators() {
        const createIndicator = (position, color) => {
            const geometry = new THREE.ConeGeometry(0.3, 1, 8);
            const material = new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.7 
            });
            const indicator = new THREE.Mesh(geometry, material);
            indicator.position.set(position.x, position.y + 0.5, position.z);
            this.scene.add(indicator);
        };
        
        // Terrorist spawn points (red)
        this.spawnPoints.terrorist.forEach(spawn => {
            createIndicator(spawn, 0xff0000);
        });
        
        // Counter-terrorist spawn points (blue)
        this.spawnPoints.counter.forEach(spawn => {
            createIndicator(spawn, 0x0000ff);
        });
    }
    
    getSpawnPoint(team) {
        const spawns = this.spawnPoints[team];
        if (spawns && spawns.length > 0) {
            return spawns[Math.floor(Math.random() * spawns.length)];
        }
        
        // Default spawn point
        return { x: 0, y: 10, z: 0 };
    }
    
    // Map creation methods
    createTestArena() {
        const blocks = [];
        const size = 20;
        const height = 3;
        
        // Create floor
        for (let x = -size; x <= size; x++) {
            for (let z = -size; z <= size; z++) {
                blocks.push({ x, y: 0, z, type: 'concrete' });
            }
        }
        
        // Create walls
        for (let x = -size; x <= size; x++) {
            for (let y = 1; y <= height; y++) {
                blocks.push({ x, y, z: -size, type: 'stone' });
                blocks.push({ x, y, z: size, type: 'stone' });
            }
        }
        
        for (let z = -size; z <= size; z++) {
            for (let y = 1; y <= height; y++) {
                blocks.push({ x: -size, y, z, type: 'stone' });
                blocks.push({ x: size, y, z, type: 'stone' });
            }
        }
        
        // Add some cover
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * (size * 2)) - size;
            const z = Math.floor(Math.random() * (size * 2)) - size;
            const height = Math.floor(Math.random() * 3) + 1;
            
            for (let y = 1; y <= height; y++) {
                blocks.push({ x, y, z, type: 'wood' });
            }
        }
        
        return {
            name: 'Test Arena',
            blocks: blocks,
            spawnPoints: {
                terrorist: [
                    { x: -15, y: 1, z: -15 },
                    { x: -15, y: 1, z: 15 },
                    { x: -10, y: 1, z: 0 }
                ],
                counter: [
                    { x: 15, y: 1, z: 15 },
                    { x: 15, y: 1, z: -15 },
                    { x: 10, y: 1, z: 0 }
                ]
            }
        };
    }
    
    createDust2Map() {
        const blocks = [];
        
        // Simplified version of de_dust2 in blocks
        // Create main areas: A site, B site, mid, tunnels
        
        // Ground level
        for (let x = -50; x <= 50; x++) {
            for (let z = -50; z <= 50; z++) {
                blocks.push({ x, y: 0, z, type: 'sand' });
            }
        }
        
        // A Site area
        this.addBuilding(blocks, -30, 1, -30, 20, 4, 20, 'stone');
        
        // B Site area  
        this.addBuilding(blocks, 20, 1, 20, 15, 3, 15, 'concrete');
        
        // Mid area structures
        this.addBuilding(blocks, -5, 1, -5, 10, 2, 10, 'wood');
        
        // Connecting paths and cover
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * 100) - 50;
            const z = Math.floor(Math.random() * 100) - 50;
            const height = Math.floor(Math.random() * 2) + 1;
            
            for (let y = 1; y <= height; y++) {
                blocks.push({ x, y, z, type: 'stone' });
            }
        }
        
        return {
            name: 'de_dust2_blocks',
            blocks: blocks,
            spawnPoints: {
                terrorist: [
                    { x: -40, y: 1, z: -40 },
                    { x: -35, y: 1, z: -35 },
                    { x: -30, y: 1, z: -30 }
                ],
                counter: [
                    { x: 40, y: 1, z: 40 },
                    { x: 35, y: 1, z: 35 },
                    { x: 30, y: 1, z: 30 }
                ]
            }
        };
    }
    
    addBuilding(blocks, startX, startY, startZ, width, height, depth, type) {
        // Create walls
        for (let x = startX; x < startX + width; x++) {
            for (let y = startY; y < startY + height; y++) {
                blocks.push({ x, y, z: startZ, type }); // Front wall
                blocks.push({ x, y, z: startZ + depth - 1, type }); // Back wall
            }
        }
        
        for (let z = startZ; z < startZ + depth; z++) {
            for (let y = startY; y < startY + height; y++) {
                blocks.push({ x: startX, y, z, type }); // Left wall
                blocks.push({ x: startX + width - 1, y, z, type }); // Right wall
            }
        }
        
        // Add some openings (doors/windows)
        const doorX = startX + Math.floor(width / 2);
        const doorZ = startZ;
        blocks.push({ x: doorX, y: startY, z: doorZ, type }); // Remove for door
        blocks.push({ x: doorX, y: startY + 1, z: doorZ, type }); // Remove for door
    }
    
    update(deltaTime) {
        // Update any animated blocks or effects
        // This could include moving platforms, rotating elements, etc.
    }
    
    // Utility methods
    getBlockAt(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.blocks.get(key);
    }
    
    isPositionBlocked(x, y, z) {
        return this.blocks.has(`${x},${y},${z}`);
    }
    
    getBlocksInRadius(centerX, centerY, centerZ, radius) {
        const blocksInRadius = [];
        
        this.blocks.forEach((blockData, key) => {
            const [x, y, z] = key.split(',').map(Number);
            const distance = Math.sqrt(
                Math.pow(x - centerX, 2) + 
                Math.pow(y - centerY, 2) + 
                Math.pow(z - centerZ, 2)
            );
            
            if (distance <= radius) {
                blocksInRadius.push({ ...blockData, x, y, z });
            }
        });
        
        return blocksInRadius;
    }
}

// Export for use in other files
window.MapSystem = MapSystem;