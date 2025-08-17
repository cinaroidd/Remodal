# BlockStrike

A Minecraft-style Counter-Strike web game built with Three.js and Cannon.js physics engine.

![BlockStrike Game](https://img.shields.io/badge/Game-BlockStrike-orange) ![Three.js](https://img.shields.io/badge/Three.js-r128-blue) ![Physics](https://img.shields.io/badge/Physics-Cannon.js-green)

## 🎮 Features

### Core Gameplay
- **First-Person Shooter**: Classic FPS controls with mouse look and WASD movement
- **Minecraft-Style Graphics**: Blocky, pixelated aesthetic with destructible environments
- **Counter-Strike Mechanics**: Weapon system inspired by CS with different gun types
- **Physics-Based**: Realistic movement, jumping, and projectile physics

### Weapons & Combat
- **Diverse Arsenal**: Pistols (Glock, USP, Desert Eagle), Rifles (AK-47, M4A4, AWP), SMGs, Shotguns
- **Grenades**: HE Grenades, Flashbangs, Smoke Grenades with realistic effects
- **Realistic Ballistics**: Bullet drop, recoil patterns, and damage falloff
- **Destructible Environment**: Shoot and destroy blocks in the world

### Game Systems
- **Dynamic Maps**: Procedurally enhanced maps with multiple game modes
- **Health & Armor System**: CS-style health management
- **Team-Based**: Terrorist vs Counter-Terrorist gameplay
- **HUD & UI**: Professional game interface with minimap, health bars, ammo counter

### Audio & Effects
- **Procedural Audio**: Web Audio API generated sounds for weapons, explosions, footsteps
- **3D Spatial Audio**: Distance-based sound effects
- **Visual Effects**: Muzzle flashes, bullet trails, particle systems for explosions

## 🚀 Getting Started

### Prerequisites
- Modern web browser with WebGL support
- No installation required - runs directly in browser

### How to Play
1. Open `index.html` in your web browser
2. Click "Play Game" to start
3. Use the following controls:

#### Controls
- **WASD** - Move (W: Forward, S: Backward, A: Left, D: Right)
- **Mouse** - Look around
- **Left Click** - Shoot/Attack
- **Right Click** - Aim down sights
- **Space** - Jump
- **Shift** - Run
- **C** - Crouch
- **R** - Reload
- **1-3** - Switch weapons (1: Primary, 2: Secondary, 3: Knife)
- **4-5** - Grenades
- **Tab** - Show scoreboard
- **M** - Toggle minimap
- **ESC** - Pause menu

## 🏗️ Technical Architecture

### Core Technologies
- **Three.js r128**: 3D graphics rendering and scene management
- **Cannon.js**: Physics simulation for realistic movement and collisions
- **Web Audio API**: Procedural sound generation and 3D audio
- **HTML5 Canvas**: 2D minimap rendering

### Project Structure
```
BlockStrike/
├── index.html          # Main game page
├── styles.css          # Game styling and UI
├── js/
│   ├── main.js         # Entry point and initialization
│   ├── game.js         # Core game engine and loop
│   ├── player.js       # Player movement and controls
│   ├── weapons.js      # Weapon system and ballistics
│   ├── map.js          # Map generation and block system
│   ├── ui.js           # User interface and HUD
│   ├── audio.js        # Audio system and effects
│   └── multiplayer.js  # Multiplayer framework (placeholder)
└── README.md           # This file
```

### Key Classes
- **Game**: Main game engine, scene management, game loop
- **Player**: First-person controls, physics, weapon handling
- **WeaponSystem**: Weapon mechanics, ballistics, effects
- **MapSystem**: Block-based world, destructible environment
- **UI**: Game interface, HUD, menus
- **AudioSystem**: Procedural sound generation, 3D audio

## 🎯 Game Modes

### Deathmatch
- Free-for-all combat
- Destroy blocks for cover
- First to reach score limit wins

### Team Deathmatch (Planned)
- Terrorist vs Counter-Terrorist teams
- Team-based objectives
- Round-based gameplay

### Bomb Defusal (Planned)
- Classic Counter-Strike mode
- Plant/defuse bomb objectives
- Strategic team gameplay

## 🔧 Customization & Modding

The game is built with modularity in mind. You can easily:

### Add New Weapons
```javascript
// In weapons.js, add to weaponDefinitions
newWeapon: {
    name: 'Custom Gun',
    type: 'primary',
    damage: 40,
    range: 75,
    fireRate: 500,
    // ... other properties
}
```

### Create New Maps
```javascript
// In map.js, add to maps object
customMap: {
    name: 'My Custom Map',
    blocks: [
        { x: 0, y: 1, z: 0, type: 'stone' },
        // ... more blocks
    ],
    spawnPoints: { /* spawn locations */ }
}
```

### Modify Block Types
```javascript
// In map.js, modify blockTypes
blockTypes: {
    customBlock: { 
        color: 0xFF6B35, 
        destructible: true, 
        health: 150 
    }
}
```

## 🌐 Browser Compatibility

- **Chrome/Chromium**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅
- **Edge**: Full support ✅

### Requirements
- WebGL 1.0 support
- Web Audio API support
- Pointer Lock API support
- ES6+ JavaScript support

## 🔊 Audio System

The game features a sophisticated procedural audio system:

### Sound Types
- **Gunshots**: Realistic weapon firing sounds
- **Explosions**: Multi-layered explosion effects
- **Environmental**: Footsteps, block breaking, ambient sounds
- **UI**: Menu interactions and feedback sounds

### 3D Audio Features
- Distance-based volume attenuation
- Spatial positioning (planned)
- Dynamic range compression
- Multiple audio channels (SFX, Music, Master)

## 🎨 Graphics & Rendering

### Visual Style
- **Blocky Aesthetic**: Minecraft-inspired cubic world
- **Pixelated Textures**: Retro gaming feel with modern lighting
- **Particle Effects**: Explosions, muzzle flashes, block destruction
- **Dynamic Lighting**: Directional shadows and ambient lighting

### Performance Optimizations
- Frustum culling for off-screen objects
- LOD system for distant blocks
- Efficient particle pooling
- Optimized physics calculations

## 🚧 Development Status

### Completed Features ✅
- ✅ Core game engine and 3D rendering
- ✅ First-person player movement and physics
- ✅ Complete weapon system with multiple gun types
- ✅ Destructible block-based world
- ✅ Professional UI and HUD system
- ✅ Procedural audio system
- ✅ Particle effects and visual feedback
- ✅ Basic AI and game modes framework

### Planned Features 🔄
- 🔄 Multiplayer networking (WebSocket/WebRTC)
- 🔄 Advanced AI opponents
- 🔄 More maps and game modes
- 🔄 Weapon customization system
- 🔄 Achievement system
- 🔄 Mobile device support

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Areas for Contribution
- New weapons and game mechanics
- Additional maps and environments
- UI/UX improvements
- Performance optimizations
- Mobile compatibility
- Multiplayer implementation

## 📝 License

This project is open-source and available under the MIT License.

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D graphics library
- **Cannon.js** - Excellent physics engine
- **Counter-Strike** - Inspiration for gameplay mechanics
- **Minecraft** - Inspiration for visual style

## 📞 Support

If you encounter issues or have questions:
1. Check the browser console for error messages
2. Ensure your browser supports WebGL and Web Audio API
3. Try refreshing the page
4. Create an issue on the project repository

---

**Have fun playing BlockStrike!** 🎮💥
