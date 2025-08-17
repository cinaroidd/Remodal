class WeaponSystem {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        
        this.weaponDefinitions = this.createWeaponDefinitions();
        this.lastShotTime = 0;
    }
    
    createWeaponDefinitions() {
        return {
            // Knives
            knife: {
                name: 'Knife',
                type: 'knife',
                damage: 50,
                range: 2,
                fireRate: 1000, // ms between attacks
                ammo: -1,
                maxAmmo: -1,
                accuracy: 1.0,
                recoil: 0,
                price: 0
            },
            
            // Pistols
            glock: {
                name: 'Glock-18',
                type: 'secondary',
                damage: 28,
                range: 50,
                fireRate: 400,
                ammo: 20,
                maxAmmo: 120,
                accuracy: 0.75,
                recoil: 0.3,
                price: 200
            },
            
            usp: {
                name: 'USP-S',
                type: 'secondary',
                damage: 35,
                range: 60,
                fireRate: 500,
                ammo: 12,
                maxAmmo: 72,
                accuracy: 0.85,
                recoil: 0.25,
                price: 200
            },
            
            deagle: {
                name: 'Desert Eagle',
                type: 'secondary',
                damage: 63,
                range: 70,
                fireRate: 800,
                ammo: 7,
                maxAmmo: 35,
                accuracy: 0.7,
                recoil: 0.8,
                price: 700
            },
            
            // SMGs
            mp9: {
                name: 'MP9',
                type: 'primary',
                damage: 26,
                range: 40,
                fireRate: 120, // Very fast
                ammo: 30,
                maxAmmo: 120,
                accuracy: 0.65,
                recoil: 0.4,
                price: 1250,
                automatic: true
            },
            
            // Rifles
            ak47: {
                name: 'AK-47',
                type: 'primary',
                damage: 36,
                range: 80,
                fireRate: 600,
                ammo: 30,
                maxAmmo: 90,
                accuracy: 0.73,
                recoil: 0.6,
                price: 2700,
                automatic: true
            },
            
            m4a4: {
                name: 'M4A4',
                type: 'primary',
                damage: 33,
                range: 85,
                fireRate: 666,
                ammo: 30,
                maxAmmo: 90,
                accuracy: 0.78,
                recoil: 0.5,
                price: 3100,
                automatic: true
            },
            
            awp: {
                name: 'AWP',
                type: 'primary',
                damage: 115,
                range: 100,
                fireRate: 1500,
                ammo: 10,
                maxAmmo: 30,
                accuracy: 0.99,
                recoil: 0.9,
                price: 4750,
                scope: true
            },
            
            // Shotguns
            nova: {
                name: 'Nova',
                type: 'primary',
                damage: 26, // Per pellet
                pellets: 9,
                range: 25,
                fireRate: 900,
                ammo: 8,
                maxAmmo: 32,
                accuracy: 0.5,
                recoil: 0.7,
                price: 1200
            },
            
            // Grenades
            heGrenade: {
                name: 'HE Grenade',
                type: 'grenade',
                damage: 99,
                range: 5,
                ammo: 1,
                maxAmmo: 1,
                price: 300,
                explosive: true
            },
            
            flashbang: {
                name: 'Flashbang',
                type: 'grenade',
                damage: 0,
                range: 8,
                ammo: 1,
                maxAmmo: 2,
                price: 200,
                flash: true
            },
            
            smokeGrenade: {
                name: 'Smoke Grenade',
                type: 'grenade',
                damage: 0,
                range: 15,
                ammo: 1,
                maxAmmo: 1,
                price: 300,
                smoke: true
            }
        };
    }
    
    createWeapon(weaponId) {
        const definition = this.weaponDefinitions[weaponId];
        if (!definition) {
            console.error('Weapon not found:', weaponId);
            return null;
        }
        
        return {
            id: weaponId,
            ...JSON.parse(JSON.stringify(definition)), // Deep copy
            currentRecoil: 0,
            isReloading: false,
            lastShotTime: 0
        };
    }
    
    canShoot(weapon) {
        if (!weapon || weapon.isReloading) return false;
        
        const now = Date.now();
        const timeSinceLastShot = now - weapon.lastShotTime;
        
        return timeSinceLastShot >= weapon.fireRate && weapon.ammo > 0;
    }
    
    shoot(weapon, player) {
        if (!this.canShoot(weapon)) return false;
        
        const now = Date.now();
        weapon.lastShotTime = now;
        
        if (weapon.type === 'grenade') {
            return this.throwGrenade(weapon, player);
        } else if (weapon.pellets) {
            return this.fireShotgun(weapon, player);
        } else {
            return this.fireBullet(weapon, player);
        }
    }
    
    fireBullet(weapon, player) {
        // Consume ammo
        if (weapon.ammo > 0) {
            weapon.ammo--;
        }
        
        // Calculate accuracy with recoil
        const baseAccuracy = weapon.accuracy;
        const recoilPenalty = weapon.currentRecoil * 0.1;
        const finalAccuracy = Math.max(0.1, baseAccuracy - recoilPenalty);
        
        // Add recoil
        weapon.currentRecoil = Math.min(weapon.currentRecoil + weapon.recoil, 10);
        
        // Create raycast with spread
        const spread = (1 - finalAccuracy) * 0.1;
        const direction = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            -1
        );
        direction.normalize();
        direction.applyQuaternion(player.camera.quaternion);
        
        const raycaster = new THREE.Raycaster();
        raycaster.set(player.camera.position, direction);
        raycaster.far = weapon.range;
        
        // Check for hits
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            this.handleHit(hit, weapon, player);
        }
        
        // Create bullet trail effect
        this.createBulletTrail(player.camera.position, direction, weapon.range);
        
        // Apply camera recoil
        this.applyCameraRecoil(player, weapon);
        
        // Play sound
        if (this.game.audio) {
            this.game.audio.playSound(`${weapon.id}_fire`);
        }
        
        return true;
    }
    
    fireShotgun(weapon, player) {
        // Consume ammo
        if (weapon.ammo > 0) {
            weapon.ammo--;
        }
        
        const hits = [];
        
        // Fire multiple pellets
        for (let i = 0; i < weapon.pellets; i++) {
            const spread = 0.15; // Shotgun spread
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread,
                -1
            );
            direction.normalize();
            direction.applyQuaternion(player.camera.quaternion);
            
            const raycaster = new THREE.Raycaster();
            raycaster.set(player.camera.position, direction);
            raycaster.far = weapon.range;
            
            const intersects = raycaster.intersectObjects(this.scene.children, true);
            
            if (intersects.length > 0) {
                const hit = intersects[0];
                this.handleHit(hit, weapon, player);
                hits.push(hit);
            }
            
            // Create pellet trail
            this.createBulletTrail(player.camera.position, direction, weapon.range, true);
        }
        
        // Apply camera recoil
        this.applyCameraRecoil(player, weapon);
        
        // Play sound
        if (this.game.audio) {
            this.game.audio.playSound(`${weapon.id}_fire`);
        }
        
        return hits.length > 0;
    }
    
    throwGrenade(weapon, player) {
        // Consume grenade
        if (weapon.ammo > 0) {
            weapon.ammo--;
        }
        
        // Create grenade projectile
        const grenadeGeometry = new THREE.SphereGeometry(0.1, 8, 6);
        const grenadeMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const grenade = new THREE.Mesh(grenadeGeometry, grenadeMaterial);
        
        // Set initial position
        const throwPosition = player.camera.position.clone();
        throwPosition.add(new THREE.Vector3(0, -0.2, -0.5).applyQuaternion(player.camera.quaternion));
        grenade.position.copy(throwPosition);
        
        // Calculate throw velocity
        const throwDirection = new THREE.Vector3(0, 0, -1);
        throwDirection.applyQuaternion(player.camera.quaternion);
        const throwForce = 20;
        const velocity = throwDirection.multiplyScalar(throwForce);
        velocity.y += 5; // Add upward arc
        
        this.scene.add(grenade);
        
        // Animate grenade
        this.animateGrenade(grenade, velocity, weapon, player);
        
        // Play throw sound
        if (this.game.audio) {
            this.game.audio.playSound('grenade_throw');
        }
        
        return true;
    }
    
    animateGrenade(grenade, velocity, weapon, player) {
        const gravity = -9.8;
        const startTime = Date.now();
        const fuseTime = weapon.explosive ? 3000 : 2000; // 3s for HE, 2s for flash/smoke
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const deltaTime = 0.016; // ~60fps
            
            // Apply physics
            velocity.y += gravity * deltaTime;
            grenade.position.add(velocity.clone().multiplyScalar(deltaTime));
            
            // Check for ground collision or timeout
            if (grenade.position.y <= 0.5 || elapsed >= fuseTime) {
                this.explodeGrenade(grenade, weapon, player);
                return;
            }
            
            // Continue animation
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    explodeGrenade(grenade, weapon, player) {
        const explosionPosition = grenade.position.clone();
        
        // Remove grenade mesh
        this.scene.remove(grenade);
        
        if (weapon.explosive) {
            // HE Grenade explosion
            this.createExplosion(explosionPosition, weapon.range, weapon.damage);
        } else if (weapon.flash) {
            // Flashbang effect
            this.createFlashEffect(explosionPosition, weapon.range);
        } else if (weapon.smoke) {
            // Smoke grenade effect
            this.createSmokeEffect(explosionPosition, weapon.range);
        }
        
        // Play explosion sound
        if (this.game.audio) {
            this.game.audio.playSound(`${weapon.id}_explode`);
        }
    }
    
    createExplosion(position, radius, damage) {
        // Visual explosion effect
        const explosionGeometry = new THREE.SphereGeometry(radius, 16, 12);
        const explosionMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4444,
            transparent: true,
            opacity: 0.7
        });
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(position);
        this.scene.add(explosion);
        
        // Animate explosion
        let scale = 0.1;
        const animate = () => {
            scale += 0.1;
            explosion.scale.setScalar(scale);
            explosion.material.opacity -= 0.05;
            
            if (explosion.material.opacity <= 0) {
                this.scene.remove(explosion);
                return;
            }
            
            requestAnimationFrame(animate);
        };
        animate();
        
        // Damage blocks in radius
        if (this.game.map) {
            const blocksInRadius = this.game.map.getBlocksInRadius(
                position.x, position.y, position.z, radius
            );
            
            blocksInRadius.forEach(blockData => {
                const distance = position.distanceTo(new THREE.Vector3(blockData.x, blockData.y, blockData.z));
                const damageFalloff = 1 - (distance / radius);
                const finalDamage = damage * damageFalloff;
                
                if (blockData.mesh && blockData.mesh.userData.destructible) {
                    this.game.map.damageBlock(blockData.mesh, finalDamage);
                }
            });
        }
    }
    
    createFlashEffect(position, radius) {
        // Create bright flash
        const flashGeometry = new THREE.SphereGeometry(radius, 16, 12);
        const flashMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 1.0
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(position);
        this.scene.add(flash);
        
        // Flash effect on screen if player is close enough
        const playerDistance = position.distanceTo(this.game.player.camera.position);
        if (playerDistance <= radius) {
            this.applyFlashEffect(1 - (playerDistance / radius));
        }
        
        // Remove flash
        setTimeout(() => {
            this.scene.remove(flash);
        }, 200);
    }
    
    createSmokeEffect(position, radius) {
        // Create multiple smoke particles
        const smokeParticles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const smokeGeometry = new THREE.SphereGeometry(0.5, 8, 6);
            const smokeMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xaaaaaa,
                transparent: true,
                opacity: 0.3
            });
            const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
            
            smoke.position.copy(position);
            smoke.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * radius,
                Math.random() * radius,
                (Math.random() - 0.5) * radius
            ));
            
            this.scene.add(smoke);
            smokeParticles.push(smoke);
        }
        
        // Animate smoke
        let lifetime = 0;
        const maxLifetime = 15000; // 15 seconds
        
        const animate = () => {
            lifetime += 16;
            
            smokeParticles.forEach(smoke => {
                smoke.position.y += 0.01; // Rise slowly
                smoke.scale.addScalar(0.001); // Expand
            });
            
            if (lifetime >= maxLifetime) {
                smokeParticles.forEach(smoke => {
                    this.scene.remove(smoke);
                });
                return;
            }
            
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    applyFlashEffect(intensity) {
        // Create white overlay on screen
        const flashOverlay = document.createElement('div');
        flashOverlay.style.position = 'fixed';
        flashOverlay.style.top = '0';
        flashOverlay.style.left = '0';
        flashOverlay.style.width = '100%';
        flashOverlay.style.height = '100%';
        flashOverlay.style.backgroundColor = 'white';
        flashOverlay.style.opacity = intensity.toString();
        flashOverlay.style.pointerEvents = 'none';
        flashOverlay.style.zIndex = '9999';
        
        document.body.appendChild(flashOverlay);
        
        // Fade out
        let opacity = intensity;
        const fadeOut = () => {
            opacity -= 0.02;
            flashOverlay.style.opacity = opacity.toString();
            
            if (opacity <= 0) {
                document.body.removeChild(flashOverlay);
                return;
            }
            
            requestAnimationFrame(fadeOut);
        };
        
        setTimeout(fadeOut, 100);
    }
    
    handleHit(hit, weapon, player) {
        // Handle different types of hits
        if (hit.object.userData && hit.object.userData.type === 'block') {
            if (hit.object.userData.destructible) {
                this.game.map.damageBlock(hit.object, weapon.damage);
            }
        }
        
        // Create bullet impact effect
        this.createBulletImpact(hit.point);
    }
    
    createBulletTrail(startPosition, direction, range, isPellet = false) {
        const endPosition = startPosition.clone().add(direction.clone().multiplyScalar(range));
        
        // Create line geometry for bullet trail
        const geometry = new THREE.BufferGeometry().setFromPoints([startPosition, endPosition]);
        const material = new THREE.LineBasicMaterial({ 
            color: isPellet ? 0xffff00 : 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const trail = new THREE.Line(geometry, material);
        this.scene.add(trail);
        
        // Remove trail after short time
        setTimeout(() => {
            this.scene.remove(trail);
        }, 50);
    }
    
    createBulletImpact(position) {
        // Create impact spark effect
        const impactGeometry = new THREE.SphereGeometry(0.05, 8, 6);
        const impactMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8
        });
        
        const impact = new THREE.Mesh(impactGeometry, impactMaterial);
        impact.position.copy(position);
        this.scene.add(impact);
        
        // Remove impact after short time
        setTimeout(() => {
            this.scene.remove(impact);
        }, 200);
    }
    
    applyCameraRecoil(player, weapon) {
        // Apply recoil to camera
        const recoilAmount = weapon.recoil * 0.01;
        player.pitch -= recoilAmount * (0.5 + Math.random() * 0.5);
        player.yaw += (Math.random() - 0.5) * recoilAmount * 0.5;
        
        // Clamp pitch
        player.pitch = Math.max(player.minPitch, Math.min(player.maxPitch, player.pitch));
        
        player.updateCameraRotation();
    }
    
    reload(weapon) {
        if (weapon.isReloading || weapon.ammo === weapon.maxAmmo) return false;
        
        weapon.isReloading = true;
        
        // Simulate reload time based on weapon type
        const reloadTime = this.getReloadTime(weapon);
        
        setTimeout(() => {
            weapon.ammo = weapon.maxAmmo;
            weapon.isReloading = false;
        }, reloadTime);
        
        // Play reload sound
        if (this.game.audio) {
            this.game.audio.playSound(`${weapon.id}_reload`);
        }
        
        return true;
    }
    
    getReloadTime(weapon) {
        const baseTimes = {
            'knife': 0,
            'secondary': 1500,
            'primary': 2500,
            'grenade': 0
        };
        
        return baseTimes[weapon.type] || 2000;
    }
    
    update(deltaTime, weapon) {
        if (!weapon) return;
        
        // Reduce recoil over time
        if (weapon.currentRecoil > 0) {
            weapon.currentRecoil -= deltaTime * 2;
            weapon.currentRecoil = Math.max(0, weapon.currentRecoil);
        }
    }
}

// Export for use in other files
window.WeaponSystem = WeaponSystem;