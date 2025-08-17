class UI {
    constructor(game) {
        this.game = game;
        this.elements = this.getUIElements();
        this.minimapEnabled = true;
        this.scoreboardVisible = false;
        
        this.init();
    }
    
    getUIElements() {
        return {
            // HUD elements
            healthFill: document.getElementById('healthFill'),
            healthText: document.getElementById('healthText'),
            currentAmmo: document.getElementById('currentAmmo'),
            totalAmmo: document.getElementById('totalAmmo'),
            weaponName: document.getElementById('weaponName'),
            
            // Team scores
            terroristScore: document.getElementById('terroristScore'),
            counterScore: document.getElementById('counterScore'),
            playerScore: document.getElementById('playerScore'),
            
            // Minimap
            minimap: document.getElementById('minimap'),
            minimapCanvas: document.getElementById('minimapCanvas'),
            
            // Crosshair
            crosshair: document.getElementById('crosshair'),
            
            // Screens
            mainMenu: document.getElementById('mainMenu'),
            gameUI: document.getElementById('gameUI'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            loadingScreen: document.getElementById('loadingScreen'),
            instructions: document.getElementById('instructions')
        };
    }
    
    init() {
        this.setupMinimap();
        this.setupEventListeners();
        this.hideGameUI();
    }
    
    setupEventListeners() {
        // Menu buttons
        const playBtn = document.getElementById('playBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const creditsBtn = document.getElementById('creditsBtn');
        const respawnBtn = document.getElementById('respawnBtn');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showInstructions();
            });
        }
        
        if (creditsBtn) {
            creditsBtn.addEventListener('click', () => {
                this.showCredits();
            });
        }
        
        if (respawnBtn) {
            respawnBtn.addEventListener('click', () => {
                this.game.restartGame();
            });
        }
        
        // Prevent right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    setupMinimap() {
        if (!this.elements.minimapCanvas) return;
        
        this.minimapCtx = this.elements.minimapCanvas.getContext('2d');
        this.minimapScale = 3; // Scale factor for minimap
        this.minimapSize = 150;
        
        // Set canvas properties
        this.elements.minimapCanvas.width = this.minimapSize;
        this.elements.minimapCanvas.height = this.minimapSize;
    }
    
    startGame() {
        this.showLoadingScreen();
        
        // Simulate loading time
        setTimeout(() => {
            this.hideLoadingScreen();
            this.game.startGame();
            this.showGameUI();
        }, 2000);
    }
    
    showLoadingScreen() {
        this.elements.loadingScreen.style.display = 'flex';
        this.elements.mainMenu.style.display = 'none';
        
        // Animate loading bar
        const progressBar = document.getElementById('loadingProgress');
        let progress = 0;
        
        const animate = () => {
            progress += Math.random() * 5;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            
            if (progress < 100) {
                setTimeout(animate, 100);
            }
        };
        
        animate();
    }
    
    hideLoadingScreen() {
        this.elements.loadingScreen.style.display = 'none';
    }
    
    showGameUI() {
        this.elements.gameUI.style.display = 'block';
        this.elements.mainMenu.style.display = 'none';
        this.elements.gameOverScreen.style.display = 'none';
        this.updateAllUI();
    }
    
    hideGameUI() {
        this.elements.gameUI.style.display = 'none';
    }
    
    showMainMenu() {
        this.elements.mainMenu.style.display = 'flex';
        this.elements.gameUI.style.display = 'none';
        this.elements.gameOverScreen.style.display = 'none';
    }
    
    showInstructions() {
        this.elements.instructions.classList.remove('hidden');
        
        // Hide instructions after 5 seconds
        setTimeout(() => {
            this.elements.instructions.classList.add('hidden');
        }, 5000);
    }
    
    showCredits() {
        alert('BlockStrike - A Minecraft-style Counter-Strike game\nCreated with Three.js and Cannon.js\n\nControls: WASD to move, Mouse to look, Click to shoot');
    }
    
    updateHealth(health) {
        if (!this.elements.healthFill || !this.elements.healthText) return;
        
        const healthPercent = Math.max(0, Math.min(100, health));
        this.elements.healthFill.style.width = healthPercent + '%';
        this.elements.healthText.textContent = Math.floor(healthPercent);
        
        // Change color based on health
        if (healthPercent > 60) {
            this.elements.healthFill.style.background = 'linear-gradient(to right, #2ecc71, #27ae60)';
        } else if (healthPercent > 30) {
            this.elements.healthFill.style.background = 'linear-gradient(to right, #f39c12, #e67e22)';
        } else {
            this.elements.healthFill.style.background = 'linear-gradient(to right, #e74c3c, #c0392b)';
        }
    }
    
    updateAmmo(current, total) {
        if (!this.elements.currentAmmo || !this.elements.totalAmmo) return;
        
        if (current === -1) {
            // Unlimited ammo (knife)
            this.elements.currentAmmo.textContent = '∞';
            this.elements.totalAmmo.textContent = '';
        } else {
            this.elements.currentAmmo.textContent = current;
            this.elements.totalAmmo.textContent = `/ ${total}`;
        }
        
        // Change color based on ammo level
        const ammoPercent = total > 0 ? current / total : 1;
        if (ammoPercent > 0.3) {
            this.elements.currentAmmo.style.color = '#fff';
        } else if (ammoPercent > 0.1) {
            this.elements.currentAmmo.style.color = '#f39c12';
        } else {
            this.elements.currentAmmo.style.color = '#e74c3c';
        }
    }
    
    updateWeaponName(name) {
        if (!this.elements.weaponName) return;
        this.elements.weaponName.textContent = name;
    }
    
    updateScore() {
        if (!this.elements.playerScore) return;
        
        const stats = this.game.stats;
        this.elements.playerScore.textContent = `Kills: ${stats.kills} | Deaths: ${stats.deaths}`;
    }
    
    updateTeamScores() {
        if (!this.elements.terroristScore || !this.elements.counterScore) return;
        
        const teams = this.game.teams;
        this.elements.terroristScore.textContent = `T: ${teams.terrorist.score}`;
        this.elements.counterScore.textContent = `CT: ${teams.counter.score}`;
    }
    
    updateCrosshair(isActive) {
        if (!this.elements.crosshair) return;
        
        this.elements.crosshair.style.opacity = isActive ? '1' : '0.3';
    }
    
    updateMinimap() {
        if (!this.minimapCtx || !this.minimapEnabled || !this.game.player) return;
        
        const ctx = this.minimapCtx;
        const player = this.game.player;
        const map = this.game.map;
        
        // Clear minimap
        ctx.clearRect(0, 0, this.minimapSize, this.minimapSize);
        
        // Draw background
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, this.minimapSize, this.minimapSize);
        
        // Get player position
        const playerPos = player.body.position;
        const centerX = this.minimapSize / 2;
        const centerY = this.minimapSize / 2;
        
        // Draw map blocks around player
        if (map && map.blocks) {
            const viewRange = 25; // Blocks to show around player
            
            map.blocks.forEach((blockData, key) => {
                const [x, y, z] = key.split(',').map(Number);
                
                // Check if block is within view range
                const dx = x - playerPos.x;
                const dz = z - playerPos.z;
                
                if (Math.abs(dx) <= viewRange && Math.abs(dz) <= viewRange) {
                    // Convert world coordinates to minimap coordinates
                    const mapX = centerX + (dx * this.minimapScale);
                    const mapZ = centerY + (dz * this.minimapScale);
                    
                    // Draw block
                    const blockType = map.blockTypes[blockData.type];
                    if (blockType) {
                        ctx.fillStyle = `#${blockType.color.toString(16).padStart(6, '0')}`;
                        ctx.fillRect(mapX - 1, mapZ - 1, 2, 2);
                    }
                }
            });
        }
        
        // Draw player
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player direction
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.sin(player.yaw) * 8,
            centerY - Math.cos(player.yaw) * 8
        );
        ctx.stroke();
        
        // Draw minimap border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.minimapSize, this.minimapSize);
    }
    
    toggleMinimap() {
        this.minimapEnabled = !this.minimapEnabled;
        
        if (this.elements.minimap) {
            this.elements.minimap.style.display = this.minimapEnabled ? 'block' : 'none';
        }
    }
    
    toggleScoreboard(show) {
        this.scoreboardVisible = show;
        
        // Create or update scoreboard
        if (show) {
            this.showScoreboard();
        } else {
            this.hideScoreboard();
        }
    }
    
    showScoreboard() {
        let scoreboard = document.getElementById('scoreboard');
        
        if (!scoreboard) {
            scoreboard = document.createElement('div');
            scoreboard.id = 'scoreboard';
            scoreboard.style.position = 'absolute';
            scoreboard.style.top = '50%';
            scoreboard.style.left = '50%';
            scoreboard.style.transform = 'translate(-50%, -50%)';
            scoreboard.style.background = 'rgba(0, 0, 0, 0.9)';
            scoreboard.style.padding = '20px';
            scoreboard.style.border = '2px solid #f39c12';
            scoreboard.style.borderRadius = '10px';
            scoreboard.style.color = '#fff';
            scoreboard.style.fontFamily = 'Courier New, monospace';
            scoreboard.style.zIndex = '1500';
            scoreboard.style.minWidth = '400px';
            
            document.getElementById('gameUI').appendChild(scoreboard);
        }
        
        // Update scoreboard content
        const stats = this.game.stats;
        const teams = this.game.teams;
        
        scoreboard.innerHTML = `
            <h3 style="text-align: center; margin-bottom: 20px; color: #f39c12;">Scoreboard</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="color: #e74c3c;">
                    <h4>Terrorists: ${teams.terrorist.score}</h4>
                </div>
                <div style="color: #3498db;">
                    <h4>Counter-Terrorists: ${teams.counter.score}</h4>
                </div>
            </div>
            <div style="text-align: center;">
                <p>Your Stats:</p>
                <p>Kills: ${stats.kills}</p>
                <p>Deaths: ${stats.deaths}</p>
                <p>Score: ${stats.score}</p>
                <p>K/D Ratio: ${stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills}</p>
            </div>
        `;
        
        scoreboard.style.display = 'block';
    }
    
    hideScoreboard() {
        const scoreboard = document.getElementById('scoreboard');
        if (scoreboard) {
            scoreboard.style.display = 'none';
        }
    }
    
    showDamageIndicator(damage, position) {
        const indicator = document.createElement('div');
        indicator.textContent = `-${damage}`;
        indicator.style.position = 'absolute';
        indicator.style.color = '#e74c3c';
        indicator.style.fontSize = '24px';
        indicator.style.fontWeight = 'bold';
        indicator.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        indicator.style.pointerEvents = 'none';
        indicator.style.zIndex = '1000';
        
        // Convert 3D position to screen coordinates
        const screenPos = this.worldToScreen(position);
        indicator.style.left = screenPos.x + 'px';
        indicator.style.top = screenPos.y + 'px';
        
        document.getElementById('gameUI').appendChild(indicator);
        
        // Animate damage indicator
        let opacity = 1;
        let y = screenPos.y;
        
        const animate = () => {
            opacity -= 0.02;
            y -= 2;
            
            indicator.style.opacity = opacity;
            indicator.style.top = y + 'px';
            
            if (opacity <= 0) {
                document.getElementById('gameUI').removeChild(indicator);
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    worldToScreen(worldPosition) {
        const camera = this.game.camera;
        const vector = worldPosition.clone();
        
        vector.project(camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
        
        return { x, y };
    }
    
    showKillFeed(killer, victim, weapon) {
        let killFeed = document.getElementById('killFeed');
        
        if (!killFeed) {
            killFeed = document.createElement('div');
            killFeed.id = 'killFeed';
            killFeed.style.position = 'absolute';
            killFeed.style.top = '20px';
            killFeed.style.right = '200px';
            killFeed.style.width = '300px';
            killFeed.style.zIndex = '1000';
            
            document.getElementById('gameUI').appendChild(killFeed);
        }
        
        const killEntry = document.createElement('div');
        killEntry.style.background = 'rgba(0, 0, 0, 0.7)';
        killEntry.style.padding = '5px 10px';
        killEntry.style.marginBottom = '5px';
        killEntry.style.borderRadius = '5px';
        killEntry.style.color = '#fff';
        killEntry.style.fontSize = '14px';
        killEntry.style.fontFamily = 'Courier New, monospace';
        
        killEntry.innerHTML = `
            <span style="color: #e74c3c;">${killer}</span>
            <span style="color: #f39c12;"> [${weapon}] </span>
            <span style="color: #3498db;">${victim}</span>
        `;
        
        killFeed.insertBefore(killEntry, killFeed.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (killFeed.contains(killEntry)) {
                killFeed.removeChild(killEntry);
            }
        }, 5000);
        
        // Keep only last 5 entries
        while (killFeed.children.length > 5) {
            killFeed.removeChild(killFeed.lastChild);
        }
    }
    
    updateAllUI() {
        if (!this.game.player) return;
        
        const player = this.game.player;
        
        this.updateHealth(player.health);
        this.updateAmmo(
            player.currentWeapon ? player.currentWeapon.ammo : 0,
            player.currentWeapon ? player.currentWeapon.maxAmmo : 0
        );
        this.updateWeaponName(player.currentWeapon ? player.currentWeapon.name : '');
        this.updateScore();
        this.updateTeamScores();
    }
    
    update(deltaTime) {
        if (this.game.gameState === 'playing') {
            this.updateMinimap();
            this.updateAllUI();
        }
    }
}

// Export for use in other files
window.UI = UI;