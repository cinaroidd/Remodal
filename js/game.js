class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.player = null;
        this.weapons = null;
        this.map = null;
        this.ui = null;
        this.audio = null;
        this.multiplayer = null;
        
        this.gameState = 'menu'; // menu, loading, playing, paused, gameOver
        this.gameMode = 'deathmatch'; // deathmatch, bombDefusal
        this.isRunning = false;
        this.clock = new THREE.Clock();
        
        // Game settings
        this.settings = {
            graphics: {
                renderDistance: 100,
                shadows: true,
                antialiasing: false, // Keep pixelated look
                fov: 75
            },
            controls: {
                mouseSensitivity: 0.002,
                invertY: false
            },
            audio: {
                masterVolume: 0.7,
                sfxVolume: 0.8,
                musicVolume: 0.5
            }
        };
        
        // Game stats
        this.stats = {
            kills: 0,
            deaths: 0,
            score: 0,
            roundsWon: 0,
            roundsLost: 0
        };
        
        // Teams
        this.teams = {
            terrorist: { score: 0, players: [] },
            counter: { score: 0, players: [] }
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.setupRenderer();
            this.setupScene();
            this.setupCamera();
            this.setupLights();
            this.setupPhysics();
            
            // Initialize game systems
            this.player = new Player(this);
            this.weapons = new WeaponSystem(this);
            this.map = new MapSystem(this);
            this.ui = new UI(this);
            this.audio = new AudioSystem(this);
            this.multiplayer = new MultiplayerSystem(this);
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }
    
    setupRenderer() {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: false, // Keep pixelated look
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.settings.graphics.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Add fog for atmosphere
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, this.settings.graphics.renderDistance);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            this.settings.graphics.fov,
            window.innerWidth / window.innerHeight,
            0.1,
            this.settings.graphics.renderDistance
        );
        
        this.camera.position.set(0, 10, 0);
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = this.settings.graphics.shadows;
        
        if (this.settings.graphics.shadows) {
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 200;
            directionalLight.shadow.camera.left = -50;
            directionalLight.shadow.camera.right = 50;
            directionalLight.shadow.camera.top = 50;
            directionalLight.shadow.camera.bottom = -50;
        }
        
        this.scene.add(directionalLight);
    }
    
    setupPhysics() {
        // Initialize Cannon.js physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -30, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        
        // Ground physics
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.add(groundBody);
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Pointer lock for FPS controls
        document.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                document.body.requestPointerLock();
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Mouse events
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Pointer lock change
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onKeyDown(event) {
        if (this.player) {
            this.player.onKeyDown(event);
        }
        
        // Game-specific controls
        switch (event.code) {
            case 'Escape':
                this.togglePause();
                break;
            case 'Tab':
                event.preventDefault();
                this.ui.toggleScoreboard(true);
                break;
            case 'KeyM':
                this.ui.toggleMinimap();
                break;
        }
    }
    
    onKeyUp(event) {
        if (this.player) {
            this.player.onKeyUp(event);
        }
        
        if (event.code === 'Tab') {
            this.ui.toggleScoreboard(false);
        }
    }
    
    onMouseMove(event) {
        if (this.player && document.pointerLockElement === document.body) {
            this.player.onMouseMove(event);
        }
    }
    
    onMouseDown(event) {
        if (this.player && this.gameState === 'playing') {
            this.player.onMouseDown(event);
        }
    }
    
    onMouseUp(event) {
        if (this.player && this.gameState === 'playing') {
            this.player.onMouseUp(event);
        }
    }
    
    onPointerLockChange() {
        if (this.ui) {
            this.ui.updateCrosshair(document.pointerLockElement === document.body);
        }
    }
    
    startGame() {
        if (this.isRunning) return;
        
        this.gameState = 'playing';
        this.isRunning = true;
        
        // Hide menu, show game UI
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameUI').style.display = 'block';
        
        // Start game systems
        if (this.map) {
            this.map.loadMap('de_dust2_blocks');
        }
        
        if (this.player) {
            this.player.spawn();
        }
        
        // Start game loop
        this.gameLoop();
        
        console.log('Game started');
    }
    
    pauseGame() {
        this.gameState = 'paused';
        document.exitPointerLock();
    }
    
    resumeGame() {
        this.gameState = 'playing';
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    endGame(winner) {
        this.gameState = 'gameOver';
        this.isRunning = false;
        
        document.exitPointerLock();
        
        // Show game over screen
        const gameOverScreen = document.getElementById('gameOverScreen');
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverStats = document.getElementById('gameOverStats');
        
        gameOverTitle.textContent = winner ? `${winner} Wins!` : 'Game Over';
        gameOverStats.innerHTML = `
            <p>Kills: ${this.stats.kills}</p>
            <p>Deaths: ${this.stats.deaths}</p>
            <p>Score: ${this.stats.score}</p>
        `;
        
        gameOverScreen.classList.remove('hidden');
    }
    
    restartGame() {
        // Reset game state
        this.stats = { kills: 0, deaths: 0, score: 0, roundsWon: 0, roundsLost: 0 };
        this.teams.terrorist.score = 0;
        this.teams.counter.score = 0;
        
        // Hide game over screen
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        // Restart
        this.startGame();
    }
    
    gameLoop() {
        if (!this.isRunning || this.gameState !== 'playing') return;
        
        requestAnimationFrame(this.gameLoop.bind(this));
        
        const deltaTime = this.clock.getDelta();
        
        // Update game systems
        if (this.world) {
            this.world.step(1/60, deltaTime, 3);
        }
        
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        if (this.weapons) {
            this.weapons.update(deltaTime);
        }
        
        if (this.map) {
            this.map.update(deltaTime);
        }
        
        if (this.ui) {
            this.ui.update(deltaTime);
        }
        
        if (this.audio) {
            this.audio.update(deltaTime);
        }
        
        if (this.multiplayer) {
            this.multiplayer.update(deltaTime);
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    // Utility methods
    createBlockGeometry(size = 1) {
        return new THREE.BoxGeometry(size, size, size);
    }
    
    createBlockMaterial(color, texture = null) {
        const material = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: false
        });
        
        if (texture) {
            material.map = texture;
            material.map.magFilter = THREE.NearestFilter;
            material.map.minFilter = THREE.NearestFilter;
        }
        
        return material;
    }
    
    addScore(points) {
        this.stats.score += points;
        if (this.ui) {
            this.ui.updateScore();
        }
    }
    
    addKill() {
        this.stats.kills++;
        this.addScore(100);
        if (this.ui) {
            this.ui.updateScore();
        }
    }
    
    addDeath() {
        this.stats.deaths++;
        if (this.ui) {
            this.ui.updateScore();
        }
    }
}

// Export for use in other files
window.Game = Game;