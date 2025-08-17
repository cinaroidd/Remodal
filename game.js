// Minecraft Counter-Strike Game
class MinecraftCS {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, teamSelect, playing, paused, roundEnd
        this.playerTeam = null; // 'ct' or 't'
        
        // Game settings
        this.settings = {
            sensitivity: 1.0,
            volume: 50,
            fullscreen: false
        };
        
        // Game state
        this.round = 1;
        this.ctScore = 0;
        this.tScore = 0;
        this.roundTime = 120; // 2 minutes
        this.roundTimer = this.roundTime;
        this.bombPlanted = false;
        this.bombTimer = 45; // 45 seconds to defuse
        this.bombTimeLeft = this.bombTimer;
        
        // Player state
        this.player = {
            x: 100,
            y: 100,
            angle: 0,
            health: 100,
            armor: 100,
            currentWeapon: 0,
            weapons: [
                { name: 'AK-47', ammo: 30, maxAmmo: 30, totalAmmo: 90, damage: 36, reloadTime: 2000 },
                { name: 'M4A4', ammo: 30, maxAmmo: 30, totalAmmo: 90, damage: 33, reloadTime: 2000 },
                { name: 'AWP', ammo: 5, maxAmmo: 5, totalAmmo: 30, damage: 115, reloadTime: 3500 },
                { name: 'Desert Eagle', ammo: 7, maxAmmo: 7, totalAmmo: 35, damage: 63, reloadTime: 1500 },
                { name: 'Knife', ammo: 1, maxAmmo: 1, totalAmmo: 1, damage: 65, reloadTime: 0 }
            ],
            isReloading: false,
            reloadStartTime: 0,
            kills: 0,
            deaths: 0,
            damage: 0
        };
        
        // AI Players
        this.aiPlayers = [];
        this.maxPlayers = 10; // 5v5
        
        // Map data
        this.map = {
            width: 800,
            height: 600,
            blocks: [],
            bombsites: [
                { x: 200, y: 150, radius: 50, name: 'A' },
                { x: 600, y: 450, radius: 50, name: 'B' }
            ]
        };
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, dx: 0, dy: 0 };
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Game loop
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.generateMap();
        this.spawnAI();
        this.gameLoop();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Center player
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
    }
    
    setupEventListeners() {
        // Menu navigation
        document.getElementById('playBtn').addEventListener('click', () => this.showTeamSelect());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        
        // Team selection
        document.getElementById('ctBtn').addEventListener('click', () => this.selectTeam('ct'));
        document.getElementById('tBtn').addEventListener('click', () => this.selectTeam('t'));
        document.getElementById('backToMenu').addEventListener('click', () => this.showMainMenu());
        
        // Settings
        document.getElementById('backFromSettings').addEventListener('click', () => this.showMainMenu());
        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.settings.sensitivity = parseFloat(e.target.value);
            document.getElementById('sensitivityValue').textContent = this.settings.sensitivity.toFixed(1);
        });
        document.getElementById('volume').addEventListener('input', (e) => {
            this.settings.volume = parseInt(e.target.value);
            document.getElementById('volumeValue').textContent = this.settings.volume + '%';
        });
        
        // Help
        document.getElementById('backFromHelp').addEventListener('click', () => this.showMainMenu());
        
        // Game controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Pause menu
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('quitBtn').addEventListener('click', () => this.quitToMenu());
        
        // Round end
        document.getElementById('nextRoundBtn').addEventListener('click', () => this.nextRound());
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('mainMenu').classList.remove('hidden');
        this.gameState = 'menu';
    }
    
    showTeamSelect() {
        this.hideAllScreens();
        document.getElementById('teamSelect').classList.remove('hidden');
        this.gameState = 'teamSelect';
    }
    
    showSettings() {
        this.hideAllScreens();
        document.getElementById('settingsMenu').classList.remove('hidden');
        this.gameState = 'settings';
    }
    
    showHelp() {
        this.hideAllScreens();
        document.getElementById('helpMenu').classList.remove('hidden');
        this.gameState = 'help';
    }
    
    selectTeam(team) {
        this.playerTeam = team;
        this.startGame();
    }
    
    startGame() {
        this.hideAllScreens();
        document.getElementById('gameUI').classList.remove('hidden');
        this.gameState = 'playing';
        this.canvas.requestPointerLock();
        this.updateHUD();
    }
    
    hideAllScreens() {
        const screens = ['mainMenu', 'teamSelect', 'gameUI', 'settingsMenu', 'helpMenu'];
        screens.forEach(screen => {
            document.getElementById(screen).classList.add('hidden');
        });
    }
    
    generateMap() {
        // Generate Minecraft-style blocks
        this.map.blocks = [];
        
        // Ground blocks
        for (let x = 0; x < this.map.width; x += 32) {
            for (let y = this.map.height - 32; y < this.map.height; y += 32) {
                this.map.blocks.push({
                    x: x,
                    y: y,
                    width: 32,
                    height: 32,
                    type: 'ground',
                    color: '#8B4513'
                });
            }
        }
        
        // Walls and obstacles
        const wallPositions = [
            { x: 100, y: 100, width: 200, height: 32 },
            { x: 500, y: 100, width: 200, height: 32 },
            { x: 100, y: 400, width: 200, height: 32 },
            { x: 500, y: 400, width: 200, height: 32 },
            { x: 300, y: 200, width: 32, height: 200 },
            { x: 300, y: 50, width: 32, height: 100 },
            { x: 300, y: 350, width: 32, height: 100 }
        ];
        
        wallPositions.forEach(pos => {
            this.map.blocks.push({
                x: pos.x,
                y: pos.y,
                width: pos.width,
                height: pos.height,
                type: 'wall',
                color: '#696969'
            });
        });
        
        // Cover blocks
        const coverPositions = [
            { x: 150, y: 150, width: 64, height: 32 },
            { x: 550, y: 150, width: 64, height: 32 },
            { x: 150, y: 450, width: 64, height: 32 },
            { x: 550, y: 450, width: 64, height: 32 }
        ];
        
        coverPositions.forEach(pos => {
            this.map.blocks.push({
                x: pos.x,
                y: pos.y,
                width: pos.width,
                height: pos.height,
                type: 'cover',
                color: '#A0522D'
            });
        });
    }
    
    spawnAI() {
        this.aiPlayers = [];
        
        // Spawn CT players
        const ctSpawns = [
            { x: 50, y: 50 },
            { x: 50, y: 150 },
            { x: 50, y: 250 },
            { x: 150, y: 50 },
            { x: 150, y: 150 }
        ];
        
        // Spawn T players
        const tSpawns = [
            { x: 750, y: 550 },
            { x: 750, y: 450 },
            { x: 750, y: 350 },
            { x: 650, y: 550 },
            { x: 650, y: 450 }
        ];
        
        for (let i = 0; i < 5; i++) {
            // CT AI
            this.aiPlayers.push({
                x: ctSpawns[i].x,
                y: ctSpawns[i].y,
                team: 'ct',
                health: 100,
                armor: 100,
                angle: 0,
                isAlive: true,
                lastShot: 0,
                weapon: { name: 'M4A4', damage: 33, fireRate: 600 }
            });
            
            // T AI
            this.aiPlayers.push({
                x: tSpawns[i].x,
                y: tSpawns[i].y,
                team: 't',
                health: 100,
                armor: 100,
                angle: Math.PI,
                isAlive: true,
                lastShot: 0,
                weapon: { name: 'AK-47', damage: 36, fireRate: 600 }
            });
        }
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        if (e.code === 'Escape') {
            if (this.gameState === 'playing') {
                this.pauseGame();
            } else if (this.gameState === 'paused') {
                this.resumeGame();
            }
        }
        
        if (this.gameState === 'playing') {
            if (e.code === 'KeyR') {
                this.reloadWeapon();
            }
            if (e.code === 'KeyE') {
                this.interact();
            }
            if (e.code >= 'Digit1' && e.code <= 'Digit5') {
                const weaponIndex = parseInt(e.code.slice(-1)) - 1;
                this.switchWeapon(weaponIndex);
            }
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    handleMouseMove(e) {
        if (this.gameState === 'playing') {
            this.mouse.dx = e.movementX * this.settings.sensitivity * 0.01;
            this.mouse.dy = e.movementY * this.settings.sensitivity * 0.01;
            
            this.player.angle += this.mouse.dx;
            this.player.angle = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.player.angle));
        }
    }
    
    handleClick(e) {
        if (this.gameState === 'playing' && !this.player.isReloading) {
            this.shoot();
        }
    }
    
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    shoot() {
        const weapon = this.player.weapons[this.player.currentWeapon];
        if (weapon.ammo > 0) {
            weapon.ammo--;
            this.updateHUD();
            
            // Check for hits on AI players
            const hitPlayer = this.checkHit();
            if (hitPlayer) {
                this.damagePlayer(hitPlayer, weapon.damage);
            }
            
            // AI response
            this.aiResponse();
        }
    }
    
    checkHit() {
        const weapon = this.player.weapons[this.player.currentWeapon];
        const range = weapon.name === 'AWP' ? 1000 : 300;
        
        for (let ai of this.aiPlayers) {
            if (!ai.isAlive) continue;
            
            const dx = ai.x - this.player.x;
            const dy = ai.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= range) {
                // Simple hit detection
                const angleToTarget = Math.atan2(dy, dx);
                const angleDiff = Math.abs(angleToTarget - this.player.angle);
                
                if (angleDiff < 0.1 || angleDiff > Math.PI - 0.1) {
                    return ai;
                }
            }
        }
        return null;
    }
    
    damagePlayer(target, damage) {
        if (target.armor > 0) {
            const armorDamage = Math.min(damage * 0.5, target.armor);
            target.armor -= armorDamage;
            damage -= armorDamage;
        }
        
        target.health -= damage;
        this.player.damage += damage;
        
        if (target.health <= 0) {
            target.isAlive = false;
            this.player.kills++;
            
            if (target.team === this.playerTeam) {
                // Team kill penalty
                this.player.damage -= 50;
            }
        }
        
        this.updateHUD();
        this.checkRoundEnd();
    }
    
    reloadWeapon() {
        const weapon = this.player.weapons[this.player.currentWeapon];
        if (weapon.ammo < weapon.maxAmmo && weapon.totalAmmo > 0 && !this.player.isReloading) {
            this.player.isReloading = true;
            this.player.reloadStartTime = Date.now();
            
            setTimeout(() => {
                const ammoNeeded = weapon.maxAmmo - weapon.ammo;
                const ammoToAdd = Math.min(ammoNeeded, weapon.totalAmmo);
                weapon.ammo += ammoToAdd;
                weapon.totalAmmo -= ammoToAdd;
                this.player.isReloading = false;
                this.updateHUD();
            }, weapon.reloadTime);
        }
    }
    
    switchWeapon(index) {
        if (index >= 0 && index < this.player.weapons.length) {
            this.player.currentWeapon = index;
            this.updateHUD();
        }
    }
    
    interact() {
        // Check if near bombsites
        for (let site of this.map.bombsites) {
            const dx = site.x - this.player.x;
            const dy = site.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < site.radius) {
                if (this.playerTeam === 't' && !this.bombPlanted) {
                    this.plantBomb(site);
                } else if (this.playerTeam === 'ct' && this.bombPlanted) {
                    this.defuseBomb();
                }
                break;
            }
        }
    }
    
    plantBomb(site) {
        this.bombPlanted = true;
        this.bombTimeLeft = this.bombTimer;
        document.getElementById('bombStatus').classList.remove('hidden');
        this.updateHUD();
    }
    
    defuseBomb() {
        this.bombPlanted = false;
        document.getElementById('bombStatus').classList.add('hidden');
        this.updateHUD();
        this.endRound('ct');
    }
    
    aiResponse() {
        // Simple AI that shoots back when player shoots
        for (let ai of this.aiPlayers) {
            if (!ai.isAlive) continue;
            
            const dx = this.player.x - ai.x;
            const dy = this.player.y - ai.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200 && Math.random() < 0.3) {
                // AI shoots back
                setTimeout(() => {
                    if (this.player.health > 0) {
                        this.damagePlayer(this.player, ai.weapon.damage);
                    }
                }, Math.random() * 1000);
            }
        }
    }
    
    updatePlayer() {
        if (this.gameState !== 'playing') return;
        
        const speed = 3;
        let dx = 0;
        let dy = 0;
        
        if (this.keys['KeyW']) dy -= speed;
        if (this.keys['KeyS']) dy += speed;
        if (this.keys['KeyA']) dx -= speed;
        if (this.keys['KeyD']) dx += speed;
        
        // Simple collision detection
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (this.canMoveTo(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
        }
        
        // Keep player in bounds
        this.player.x = Math.max(16, Math.min(this.canvas.width - 16, this.player.x));
        this.player.y = Math.max(16, Math.min(this.canvas.height - 16, this.player.y));
    }
    
    canMoveTo(x, y) {
        // Check collision with blocks
        for (let block of this.map.blocks) {
            if (block.type === 'wall' || block.type === 'cover') {
                if (x > block.x - 16 && x < block.x + block.width + 16 &&
                    y > block.y - 16 && y < block.y + block.height + 16) {
                    return false;
                }
            }
        }
        return true;
    }
    
    updateAI() {
        for (let ai of this.aiPlayers) {
            if (!ai.isAlive) continue;
            
            // Simple AI movement
            if (Math.random() < 0.02) {
                ai.angle += (Math.random() - 0.5) * 0.5;
            }
            
            const speed = 1;
            const newX = ai.x + Math.cos(ai.angle) * speed;
            const newY = ai.y + Math.sin(ai.angle) * speed;
            
            if (this.canMoveTo(newX, newY)) {
                ai.x = newX;
                ai.y = newY;
            }
            
            // Keep AI in bounds
            ai.x = Math.max(16, Math.min(this.map.width - 16, ai.x));
            ai.y = Math.max(16, Math.min(this.map.height - 16, ai.y));
        }
    }
    
    updateTimers() {
        if (this.gameState === 'playing') {
            this.roundTimer -= this.deltaTime;
            
            if (this.bombPlanted) {
                this.bombTimeLeft -= this.deltaTime;
                if (this.bombTimeLeft <= 0) {
                    this.endRound('t');
                }
            }
            
            if (this.roundTimer <= 0) {
                this.endRound('ct');
            }
            
            this.updateHUD();
        }
    }
    
    endRound(winner) {
        if (winner === 'ct') {
            this.ctScore++;
        } else {
            this.tScore++;
        }
        
        this.gameState = 'roundEnd';
        document.getElementById('roundResult').textContent = winner === 'ct' ? 'CT WIN' : 'T WIN';
        document.getElementById('killsStat').textContent = this.player.kills;
        document.getElementById('deathsStat').textContent = this.player.deaths;
        document.getElementById('damageStat').textContent = this.player.damage;
        
        document.getElementById('roundEnd').classList.remove('hidden');
        this.updateHUD();
    }
    
    nextRound() {
        this.round++;
        this.roundTimer = this.roundTime;
        this.bombPlanted = false;
        this.bombTimeLeft = this.bombTimer;
        document.getElementById('bombStatus').classList.add('hidden');
        
        // Reset player
        this.player.health = 100;
        this.player.armor = 100;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        
        // Reset AI
        this.spawnAI();
        
        document.getElementById('roundEnd').classList.add('hidden');
        this.gameState = 'playing';
        this.updateHUD();
    }
    
    checkRoundEnd() {
        const ctAlive = this.aiPlayers.filter(p => p.team === 'ct' && p.isAlive).length;
        const tAlive = this.aiPlayers.filter(p => p.team === 't' && p.isAlive).length;
        
        if (this.playerTeam === 'ct' && tAlive === 0) {
            this.endRound('ct');
        } else if (this.playerTeam === 't' && ctAlive === 0) {
            this.endRound('t');
        }
    }
    
    updateHUD() {
        // Update scores
        document.getElementById('ctScore').textContent = this.ctScore;
        document.getElementById('tScore').textContent = this.tScore;
        document.getElementById('roundNumber').textContent = this.round;
        
        // Update timer
        const minutes = Math.floor(this.roundTimer / 60);
        const seconds = Math.floor(this.roundTimer % 60);
        document.getElementById('roundTimer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update weapon info
        const weapon = this.player.weapons[this.player.currentWeapon];
        document.getElementById('currentAmmo').textContent = weapon.ammo;
        document.getElementById('totalAmmo').textContent = weapon.totalAmmo;
        document.getElementById('weaponName').textContent = weapon.name;
        
        // Update health and armor
        document.getElementById('healthText').textContent = this.player.health;
        document.getElementById('armorText').textContent = this.player.armor;
        document.getElementById('healthFill').style.width = this.player.health + '%';
        document.getElementById('armorFill').style.width = this.player.armor + '%';
        
        // Update objective
        if (this.bombPlanted) {
            const bombMinutes = Math.floor(this.bombTimeLeft / 60);
            const bombSeconds = Math.floor(this.bombTimeLeft % 60);
            document.getElementById('bombStatus').textContent = 
                `Bomb planted! Defuse it! (${bombMinutes}:${bombSeconds.toString().padStart(2, '0')})`;
        }
    }
    
    pauseGame() {
        this.gameState = 'paused';
        document.getElementById('pauseMenu').classList.remove('hidden');
        document.exitPointerLock();
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pauseMenu').classList.add('hidden');
        this.canvas.requestPointerLock();
    }
    
    restartGame() {
        this.round = 1;
        this.ctScore = 0;
        this.tScore = 0;
        this.roundTimer = this.roundTime;
        this.bombPlanted = false;
        this.bombTimeLeft = this.bombTimer;
        
        this.player.health = 100;
        this.player.armor = 100;
        this.player.kills = 0;
        this.player.deaths = 0;
        this.player.damage = 0;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        
        this.spawnAI();
        this.updateHUD();
        
        this.resumeGame();
    }
    
    quitToMenu() {
        document.exitPointerLock();
        this.showMainMenu();
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing') {
            this.renderGame();
        }
    }
    
    renderGame() {
        // Render map blocks
        for (let block of this.map.blocks) {
            this.ctx.fillStyle = block.color;
            this.ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Add Minecraft-style texture
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        }
        
        // Render bombsites
        for (let site of this.map.bombsites) {
            this.ctx.strokeStyle = this.bombPlanted ? '#f44336' : '#4a90e2';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(site.x, site.y, site.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Site label
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`SITE ${site.name}`, site.x, site.y + 5);
        }
        
        // Render AI players
        for (let ai of this.aiPlayers) {
            if (!ai.isAlive) continue;
            
            this.ctx.fillStyle = ai.team === 'ct' ? '#4CAF50' : '#f44336';
            this.ctx.fillRect(ai.x - 8, ai.y - 8, 16, 16);
            
            // Health bar
            const healthPercent = ai.health / 100;
            this.ctx.fillStyle = '#f44336';
            this.ctx.fillRect(ai.x - 10, ai.y - 15, 20 * healthPercent, 3);
            this.ctx.strokeStyle = '#fff';
            this.ctx.strokeRect(ai.x - 10, ai.y - 15, 20, 3);
        }
        
        // Render player
        this.ctx.fillStyle = this.playerTeam === 'ct' ? '#4CAF50' : '#f44336';
        this.ctx.fillRect(this.player.x - 8, this.player.y - 8, 16, 16);
        
        // Player direction indicator
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x, this.player.y);
        this.ctx.lineTo(
            this.player.x + Math.cos(this.player.angle) * 20,
            this.player.y + Math.sin(this.player.angle) * 20
        );
        this.ctx.stroke();
        
        // Render UI elements
        this.renderUI();
    }
    
    renderUI() {
        // Render weapon crosshair
        if (this.player.isReloading) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25, 50, 50);
        }
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.updatePlayer();
        this.updateAI();
        this.updateTimers();
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MinecraftCS();
});