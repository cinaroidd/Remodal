class AudioSystem {
    constructor(game) {
        this.game = game;
        this.sounds = new Map();
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;
            
            // Create separate gain nodes for different sound types
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = this.sfxVolume;
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = this.musicVolume;
            
            // Create sound definitions (using generated tones since we don't have audio files)
            this.createSounds();
            
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio system failed to initialize:', error);
        }
    }
    
    createSounds() {
        // Define sound parameters for procedural generation
        this.soundDefinitions = {
            // Weapon sounds
            glock_fire: { type: 'gunshot', frequency: 200, duration: 0.1, volume: 0.8 },
            ak47_fire: { type: 'gunshot', frequency: 150, duration: 0.15, volume: 1.0 },
            awp_fire: { type: 'gunshot', frequency: 100, duration: 0.3, volume: 1.2 },
            knife: { type: 'melee', frequency: 800, duration: 0.2, volume: 0.6 },
            
            // Reload sounds
            glock_reload: { type: 'mechanical', frequency: 400, duration: 1.5, volume: 0.5 },
            ak47_reload: { type: 'mechanical', frequency: 350, duration: 2.5, volume: 0.5 },
            
            // Grenade sounds
            grenade_throw: { type: 'whoosh', frequency: 300, duration: 0.5, volume: 0.7 },
            heGrenade_explode: { type: 'explosion', frequency: 80, duration: 1.0, volume: 1.0 },
            flashbang_explode: { type: 'flash', frequency: 1000, duration: 0.3, volume: 0.9 },
            smokeGrenade_explode: { type: 'puff', frequency: 200, duration: 0.8, volume: 0.6 },
            
            // Player sounds
            footstep: { type: 'step', frequency: 150, duration: 0.1, volume: 0.3 },
            jump: { type: 'whoosh', frequency: 400, duration: 0.3, volume: 0.5 },
            hurt: { type: 'hurt', frequency: 600, duration: 0.4, volume: 0.8 },
            
            // Environment sounds
            blockBreak: { type: 'break', frequency: 300, duration: 0.3, volume: 0.7 },
            
            // UI sounds
            menuClick: { type: 'click', frequency: 800, duration: 0.1, volume: 0.4 },
            menuHover: { type: 'hover', frequency: 1000, duration: 0.05, volume: 0.2 }
        };
        
        // Pre-generate some sounds
        this.generateSounds();
    }
    
    generateSounds() {
        // Generate procedural sounds using Web Audio API
        Object.keys(this.soundDefinitions).forEach(soundName => {
            const def = this.soundDefinitions[soundName];
            this.sounds.set(soundName, this.createProceduralSound(def));
        });
    }
    
    createProceduralSound(definition) {
        const { type, frequency, duration, volume } = definition;
        
        return {
            play: () => {
                if (!this.audioContext) return;
                
                try {
                    switch (type) {
                        case 'gunshot':
                            this.playGunshot(frequency, duration, volume);
                            break;
                        case 'explosion':
                            this.playExplosion(frequency, duration, volume);
                            break;
                        case 'mechanical':
                            this.playMechanical(frequency, duration, volume);
                            break;
                        case 'whoosh':
                            this.playWhoosh(frequency, duration, volume);
                            break;
                        case 'step':
                            this.playStep(frequency, duration, volume);
                            break;
                        case 'hurt':
                            this.playHurt(frequency, duration, volume);
                            break;
                        case 'break':
                            this.playBreak(frequency, duration, volume);
                            break;
                        case 'click':
                            this.playClick(frequency, duration, volume);
                            break;
                        case 'hover':
                            this.playHover(frequency, duration, volume);
                            break;
                        case 'flash':
                            this.playFlash(frequency, duration, volume);
                            break;
                        case 'puff':
                            this.playPuff(frequency, duration, volume);
                            break;
                        case 'melee':
                            this.playMelee(frequency, duration, volume);
                            break;
                        default:
                            this.playGeneric(frequency, duration, volume);
                    }
                } catch (error) {
                    console.warn('Failed to play sound:', error);
                }
            }
        };
    }
    
    playGunshot(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Create gunshot sound with noise and filtering
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency * 4, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(frequency, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playExplosion(frequency, duration, volume) {
        // Create multiple oscillators for complex explosion sound
        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(frequency * (1 + i * 0.5), this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.1, this.audioContext.currentTime + duration);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(frequency * 8, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);
            
            gainNode.gain.setValueAtTime(volume * (0.3 + i * 0.2), this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start(this.audioContext.currentTime + i * 0.02);
            oscillator.stop(this.audioContext.currentTime + duration);
        }
    }
    
    playMechanical(frequency, duration, volume) {
        // Create mechanical/reload sound with multiple clicks
        const clickCount = Math.floor(duration * 8); // 8 clicks per second
        
        for (let i = 0; i < clickCount; i++) {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(frequency + Math.random() * 100, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.05);
            }, (duration / clickCount) * i * 1000);
        }
    }
    
    playWhoosh(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
        filter.Q.setValueAtTime(10, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + duration * 0.1);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playStep(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(frequency * 0.5, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playHurt(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(frequency * 0.7, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime + duration * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playBreak(frequency, duration, volume) {
        // Create breaking sound with multiple frequency components
        for (let i = 0; i < 5; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(frequency * (1 + i * 0.3), this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.1, this.audioContext.currentTime + duration);
            
            gainNode.gain.setValueAtTime(volume * (0.8 - i * 0.1), this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start(this.audioContext.currentTime + i * 0.01);
            oscillator.stop(this.audioContext.currentTime + duration);
        }
    }
    
    playClick(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playHover(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(frequency * 1.2, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playFlash(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 4, this.audioContext.currentTime + duration * 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.1, this.audioContext.currentTime + duration);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playPuff(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + duration * 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMelee(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + duration * 0.1);
        oscillator.frequency.linearRampToValueAtTime(frequency * 0.8, this.audioContext.currentTime + duration);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime);
        filter.Q.setValueAtTime(5, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playGeneric(frequency, duration, volume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playSound(soundName) {
        const sound = this.sounds.get(soundName);
        if (sound) {
            sound.play();
        } else {
            console.warn('Sound not found:', soundName);
        }
    }
    
    play3DSound(soundName, position, maxDistance = 50) {
        if (!this.game.player || !position) {
            this.playSound(soundName);
            return;
        }
        
        const playerPosition = this.game.player.camera.position;
        const distance = playerPosition.distanceTo(position);
        
        if (distance > maxDistance) return; // Too far to hear
        
        // Calculate volume based on distance
        const volumeMultiplier = 1 - (distance / maxDistance);
        
        // Play sound with distance-based volume
        // For simplicity, we'll just play the regular sound with modified volume
        // In a full implementation, you'd use Web Audio API's PannerNode for 3D positioning
        const originalVolume = this.sfxVolume;
        this.sfxVolume *= volumeMultiplier;
        
        this.playSound(soundName);
        
        this.sfxVolume = originalVolume;
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }
    
    resumeAudioContext() {
        // Resume audio context if it was suspended (required by some browsers)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    update(deltaTime) {
        // Update any ongoing audio effects
        this.resumeAudioContext();
        
        // Handle footstep sounds based on player movement
        if (this.game.player && this.game.player.isAlive) {
            this.handleFootsteps();
        }
    }
    
    handleFootsteps() {
        const player = this.game.player;
        
        if (!player.body) return;
        
        const velocity = player.body.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        
        // Play footstep sounds based on movement speed
        if (speed > 1 && player.isGrounded) {
            const now = Date.now();
            const stepInterval = player.isRunning ? 300 : 500; // ms between steps
            
            if (!this.lastStepTime || now - this.lastStepTime > stepInterval) {
                this.playSound('footstep');
                this.lastStepTime = now;
            }
        }
    }
}

// Export for use in other files
window.AudioSystem = AudioSystem;