class Player {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.camera = game.camera;
        this.world = game.world;
        
        // Player properties
        this.health = 100;
        this.maxHealth = 100;
        this.armor = 0;
        this.maxArmor = 100;
        this.money = 800;
        this.team = 'counter'; // 'terrorist' or 'counter'
        this.isAlive = true;
        
        // Movement properties
        this.velocity = new THREE.Vector3();
        this.speed = 5;
        this.runSpeed = 8;
        this.crouchSpeed = 2;
        this.jumpForce = 15;
        this.isRunning = false;
        this.isCrouching = false;
        this.isGrounded = false;
        
        // Camera/Look properties
        this.yaw = 0;
        this.pitch = 0;
        this.maxPitch = Math.PI / 2 - 0.1;
        this.minPitch = -Math.PI / 2 + 0.1;
        
        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            crouch: false,
            run: false
        };
        
        this.mouse = {
            left: false,
            right: false
        };
        
        // Physics body
        this.body = null;
        this.bodyHeight = 1.8;
        this.bodyRadius = 0.3;
        this.crouchHeight = 1.2;
        
        // Weapon system
        this.currentWeapon = null;
        this.weapons = [];
        this.weaponSlots = {
            primary: null,
            secondary: null,
            knife: null,
            grenades: []
        };
        
        this.init();
    }
    
    init() {
        this.setupPhysicsBody();
        this.setupWeapons();
        this.setupCamera();
    }
    
    setupPhysicsBody() {
        // Create physics body for player
        const shape = new CANNON.Cylinder(this.bodyRadius, this.bodyRadius, this.bodyHeight, 8);
        this.body = new CANNON.Body({ mass: 80 });
        this.body.addShape(shape);
        this.body.position.set(0, this.bodyHeight / 2, 0);
        this.body.material = new CANNON.Material({ friction: 0.1, restitution: 0 });
        
        // Prevent body from rotating
        this.body.fixedRotation = true;
        this.body.updateMassProperties();
        
        this.world.add(this.body);
        
        // Setup collision detection
        this.body.addEventListener('collide', (e) => {
            const contact = e.contact;
            const normal = contact.ni;
            
            // Check if we're on the ground
            if (normal.y > 0.5) {
                this.isGrounded = true;
            }
        });
    }
    
    setupWeapons() {
        // Start with basic weapons
        const knife = {
            name: 'Knife',
            type: 'knife',
            damage: 50,
            range: 2,
            fireRate: 1000,
            ammo: -1, // Unlimited
            maxAmmo: -1
        };
        
        const pistol = {
            name: 'Glock-18',
            type: 'secondary',
            damage: 28,
            range: 50,
            fireRate: 400,
            ammo: 20,
            maxAmmo: 120,
            accuracy: 0.8,
            recoil: 0.3
        };
        
        this.weaponSlots.knife = knife;
        this.weaponSlots.secondary = pistol;
        this.currentWeapon = pistol;
        
        this.weapons = [knife, pistol];
    }
    
    setupCamera() {
        // Position camera at head level
        this.updateCameraPosition();
    }
    
    spawn(position = new THREE.Vector3(0, 10, 0)) {
        this.health = this.maxHealth;
        this.isAlive = true;
        
        // Set physics body position
        this.body.position.set(position.x, position.y, position.z);
        this.body.velocity.set(0, 0, 0);
        this.body.angularVelocity.set(0, 0, 0);
        
        // Reset camera
        this.yaw = 0;
        this.pitch = 0;
        this.updateCameraRotation();
        this.updateCameraPosition();
        
        console.log('Player spawned at:', position);
    }
    
    update(deltaTime) {
        if (!this.isAlive) return;
        
        this.handleMovement(deltaTime);
        this.updateCameraPosition();
        this.updateWeapons(deltaTime);
        this.checkGrounded();
        
        // Update UI
        if (this.game.ui) {
            this.game.ui.updateHealth(this.health);
            this.game.ui.updateAmmo(
                this.currentWeapon ? this.currentWeapon.ammo : 0,
                this.currentWeapon ? this.currentWeapon.maxAmmo : 0
            );
            this.game.ui.updateWeaponName(this.currentWeapon ? this.currentWeapon.name : '');
        }
    }
    
    handleMovement(deltaTime) {
        if (!this.body) return;
        
        // Calculate movement direction
        const direction = new THREE.Vector3();
        
        if (this.keys.forward) direction.z -= 1;
        if (this.keys.backward) direction.z += 1;
        if (this.keys.left) direction.x -= 1;
        if (this.keys.right) direction.x += 1;
        
        // Normalize direction
        if (direction.length() > 0) {
            direction.normalize();
            
            // Apply camera rotation to movement
            const yawRotation = new THREE.Matrix4().makeRotationY(this.yaw);
            direction.applyMatrix4(yawRotation);
            
            // Calculate speed
            let currentSpeed = this.speed;
            if (this.keys.run && !this.isCrouching) {
                currentSpeed = this.runSpeed;
                this.isRunning = true;
            } else if (this.isCrouching) {
                currentSpeed = this.crouchSpeed;
                this.isRunning = false;
            } else {
                this.isRunning = false;
            }
            
            // Apply movement
            this.body.velocity.x = direction.x * currentSpeed;
            this.body.velocity.z = direction.z * currentSpeed;
        } else {
            // Apply friction when not moving
            this.body.velocity.x *= 0.8;
            this.body.velocity.z *= 0.8;
        }
        
        // Handle jumping
        if (this.keys.jump && this.isGrounded && !this.isCrouching) {
            this.body.velocity.y = this.jumpForce;
            this.isGrounded = false;
            
            if (this.game.audio) {
                this.game.audio.playSound('jump');
            }
        }
        
        // Handle crouching
        if (this.keys.crouch && !this.isCrouching) {
            this.startCrouch();
        } else if (!this.keys.crouch && this.isCrouching) {
            this.stopCrouch();
        }
    }
    
    startCrouch() {
        this.isCrouching = true;
        // Lower the camera
        this.bodyHeight = this.crouchHeight;
        // You might want to change the physics body shape here too
    }
    
    stopCrouch() {
        this.isCrouching = false;
        this.bodyHeight = 1.8;
        // Restore normal camera height
    }
    
    updateCameraPosition() {
        if (!this.body) return;
        
        // Position camera at head level
        const headHeight = this.isCrouching ? this.crouchHeight - 0.2 : this.bodyHeight - 0.2;
        this.camera.position.copy(this.body.position);
        this.camera.position.y += headHeight / 2;
    }
    
    updateCameraRotation() {
        // Apply pitch and yaw to camera
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }
    
    updateWeapons(deltaTime) {
        if (this.currentWeapon && this.game.weapons) {
            this.game.weapons.update(deltaTime, this.currentWeapon);
        }
    }
    
    checkGrounded() {
        // Reset grounded state - will be set by collision detection
        this.isGrounded = Math.abs(this.body.velocity.y) < 0.1;
    }
    
    // Input handlers
    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                event.preventDefault();
                this.keys.jump = true;
                break;
            case 'ShiftLeft':
                this.keys.run = true;
                break;
            case 'KeyC':
                this.keys.crouch = true;
                break;
            case 'KeyR':
                this.reload();
                break;
            case 'Digit1':
                this.switchWeapon('primary');
                break;
            case 'Digit2':
                this.switchWeapon('secondary');
                break;
            case 'Digit3':
                this.switchWeapon('knife');
                break;
            case 'KeyQ':
                this.switchToLastWeapon();
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'ShiftLeft':
                this.keys.run = false;
                break;
            case 'KeyC':
                this.keys.crouch = false;
                break;
        }
    }
    
    onMouseMove(event) {
        if (document.pointerLockElement !== document.body) return;
        
        const sensitivity = this.game.settings.controls.mouseSensitivity;
        
        // Update yaw (left/right rotation)
        this.yaw -= event.movementX * sensitivity;
        
        // Update pitch (up/down rotation)
        this.pitch -= event.movementY * sensitivity * (this.game.settings.controls.invertY ? -1 : 1);
        
        // Clamp pitch
        this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
        
        this.updateCameraRotation();
    }
    
    onMouseDown(event) {
        switch (event.button) {
            case 0: // Left click
                this.mouse.left = true;
                this.shoot();
                break;
            case 2: // Right click
                event.preventDefault();
                this.mouse.right = true;
                this.aim(true);
                break;
        }
    }
    
    onMouseUp(event) {
        switch (event.button) {
            case 0: // Left click
                this.mouse.left = false;
                break;
            case 2: // Right click
                this.mouse.right = false;
                this.aim(false);
                break;
        }
    }
    
    // Weapon actions
    shoot() {
        if (!this.currentWeapon || !this.isAlive) return;
        
        if (this.currentWeapon.type === 'knife') {
            this.meleeAttack();
        } else {
            this.fireWeapon();
        }
    }
    
    fireWeapon() {
        if (!this.currentWeapon || this.currentWeapon.ammo <= 0) return;
        
        // Consume ammo
        if (this.currentWeapon.ammo > 0) {
            this.currentWeapon.ammo--;
        }
        
        // Create raycast for bullet
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        
        raycaster.set(this.camera.position, direction);
        
        // Check for hits
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            this.handleBulletHit(hit);
        }
        
        // Play sound effect
        if (this.game.audio) {
            this.game.audio.playSound('gunshot');
        }
        
        // Add muzzle flash effect
        this.createMuzzleFlash();
    }
    
    meleeAttack() {
        // Knife attack logic
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        
        raycaster.set(this.camera.position, direction);
        raycaster.far = this.currentWeapon.range;
        
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            this.handleMeleeHit(hit);
        }
        
        if (this.game.audio) {
            this.game.audio.playSound('knife');
        }
    }
    
    handleBulletHit(hit) {
        // Handle different types of hits (players, blocks, etc.)
        console.log('Bullet hit:', hit.object);
        
        // If it's a block, potentially destroy it
        if (hit.object.userData && hit.object.userData.type === 'block') {
            if (hit.object.userData.destructible) {
                this.game.map.destroyBlock(hit.object);
            }
        }
        
        // Create bullet impact effect
        this.createBulletImpact(hit.point);
    }
    
    handleMeleeHit(hit) {
        console.log('Melee hit:', hit.object);
        
        // Similar to bullet hit but with different effects
        if (hit.object.userData && hit.object.userData.type === 'block') {
            if (hit.object.userData.destructible) {
                this.game.map.destroyBlock(hit.object);
            }
        }
    }
    
    createMuzzleFlash() {
        // Simple muzzle flash effect
        const flashGeometry = new THREE.SphereGeometry(0.1, 8, 6);
        const flashMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        
        // Position in front of camera
        const flashPosition = new THREE.Vector3(0, 0, -0.5);
        flashPosition.applyQuaternion(this.camera.quaternion);
        flashPosition.add(this.camera.position);
        
        flash.position.copy(flashPosition);
        this.scene.add(flash);
        
        // Remove after short time
        setTimeout(() => {
            this.scene.remove(flash);
        }, 100);
    }
    
    createBulletImpact(position) {
        // Create bullet impact particle effect
        const impactGeometry = new THREE.SphereGeometry(0.05, 8, 6);
        const impactMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.7
        });
        
        const impact = new THREE.Mesh(impactGeometry, impactMaterial);
        impact.position.copy(position);
        this.scene.add(impact);
        
        // Animate and remove
        setTimeout(() => {
            this.scene.remove(impact);
        }, 500);
    }
    
    reload() {
        if (!this.currentWeapon || this.currentWeapon.ammo === this.currentWeapon.maxAmmo) return;
        
        console.log('Reloading...');
        
        if (this.game.audio) {
            this.game.audio.playSound('reload');
        }
        
        // Simulate reload time
        setTimeout(() => {
            if (this.currentWeapon) {
                this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
            }
        }, 2000);
    }
    
    switchWeapon(slot) {
        const weapon = this.weaponSlots[slot];
        if (weapon) {
            this.currentWeapon = weapon;
            console.log('Switched to:', weapon.name);
        }
    }
    
    switchToLastWeapon() {
        // Quick switch between last two weapons
        // Implementation would track previous weapon
    }
    
    aim(isAiming) {
        // Implement aiming mechanics (reduce FOV, increase accuracy, etc.)
        if (isAiming) {
            this.camera.fov = 60; // Zoom in
        } else {
            this.camera.fov = this.game.settings.graphics.fov; // Zoom out
        }
        this.camera.updateProjectionMatrix();
    }
    
    takeDamage(damage) {
        if (!this.isAlive) return;
        
        this.health -= damage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        // Play hurt sound
        if (this.game.audio) {
            this.game.audio.playSound('hurt');
        }
    }
    
    die() {
        this.isAlive = false;
        this.game.addDeath();
        
        console.log('Player died');
        
        // Handle death (respawn timer, spectate mode, etc.)
        setTimeout(() => {
            this.spawn();
        }, 5000);
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}

// Export for use in other files
window.Player = Player;