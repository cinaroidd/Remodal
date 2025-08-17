# Minecraft Counter-Strike

A web-based first-person shooter game that combines the tactical gameplay of Counter-Strike with the blocky, pixelated aesthetics of Minecraft.

## 🎮 Game Features

### Core Gameplay
- **Team-based combat**: Choose between Counter-Terrorists (CT) or Terrorists (T)
- **Multiple weapons**: AK-47, M4A4, AWP sniper rifle, Desert Eagle, and Knife
- **Bomb planting/defusing**: Classic CS objectives with bomb sites A and B
- **Round-based matches**: Multiple rounds with score tracking
- **AI opponents**: Intelligent bots that respond to your actions

### Minecraft-Style Graphics
- **Blocky aesthetics**: Pixelated, Minecraft-inspired visual design
- **Simple 3D perspective**: Top-down view with directional indicators
- **Color-coded teams**: Green for CT, Red for T
- **Health and armor bars**: Visual status indicators

### Game Systems
- **Weapon management**: Reload mechanics, ammo tracking, weapon switching
- **Damage system**: Health, armor, and realistic damage calculations
- **Collision detection**: Block-based movement and cover system
- **Timer system**: Round timers and bomb countdown
- **Score tracking**: Kills, deaths, and damage statistics

## 🎯 How to Play

### Controls
- **WASD**: Move around the map
- **Mouse**: Look around and aim
- **Left Click**: Shoot your weapon
- **R**: Reload weapon
- **E**: Interact (plant/defuse bomb)
- **1-5**: Switch between weapons
- **ESC**: Pause game

### Objectives

#### For Terrorists (T):
- Plant the bomb at either bombsite A or B
- Eliminate all Counter-Terrorists
- Prevent bomb defusal

#### For Counter-Terrorists (CT):
- Prevent bomb planting
- Defuse the bomb if planted
- Eliminate all Terrorists

### Weapons

1. **AK-47** (Slot 1)
   - High damage, high recoil
   - 30 rounds per magazine
   - Best for close to medium range

2. **M4A4** (Slot 2)
   - Balanced weapon
   - 30 rounds per magazine
   - Good for all ranges

3. **AWP** (Slot 3)
   - Sniper rifle
   - One-shot kill potential
   - 5 rounds per magazine
   - Long reload time

4. **Desert Eagle** (Slot 4)
   - Powerful pistol
   - 7 rounds per magazine
   - High damage, low capacity

5. **Knife** (Slot 5)
   - Melee weapon
   - Instant kill at close range
   - No ammo required

### Game Mechanics

#### Health and Armor
- **Health**: 100 points, when depleted you die
- **Armor**: 100 points, reduces incoming damage by 50%
- **Regeneration**: None - health and armor don't regenerate

#### Damage System
- Different weapons deal different damage
- Armor absorbs 50% of damage
- Headshots and critical hits are not implemented in this version

#### Round System
- Each round lasts 2 minutes
- Teams score points for winning rounds
- New round starts after round end
- All players respawn with full health and armor

#### Bomb Mechanics
- Terrorists can plant bomb at designated sites
- Bomb takes 45 seconds to explode
- Counter-Terrorists can defuse bomb by pressing E near it
- Bomb explosion wins the round for Terrorists

## 🚀 Getting Started

1. **Open the game**: Simply open `index.html` in a modern web browser
2. **Select team**: Choose between Counter-Terrorists or Terrorists
3. **Start playing**: Use WASD to move and mouse to aim
4. **Complete objectives**: Plant/defuse bombs or eliminate enemies

## 🎨 Technical Details

### Built With
- **HTML5 Canvas**: For rendering the game graphics
- **Vanilla JavaScript**: No external libraries or frameworks
- **CSS3**: Modern styling with animations and effects
- **Web APIs**: Pointer Lock API for mouse control

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

### Performance
- Optimized for 60 FPS gameplay
- Efficient collision detection
- Smooth animations and transitions

## 🎮 Game Tips

### For Beginners
1. **Start with M4A4**: It's the most balanced weapon
2. **Use cover**: Hide behind blocks to avoid enemy fire
3. **Watch your health**: Don't engage when low on health
4. **Learn the map**: Know where bombsites are located
5. **Reload often**: Keep your weapon loaded

### Advanced Strategies
1. **Weapon switching**: Use different weapons for different situations
2. **Positioning**: Use high ground and cover effectively
3. **Team coordination**: Work with AI teammates
4. **Bomb management**: Time your bomb plants carefully
5. **Economy management**: Manage your ammo efficiently

## 🔧 Customization

The game can be easily customized by modifying the JavaScript code:

- **Map layout**: Change block positions in `generateMap()`
- **Weapon stats**: Modify damage, ammo, and reload times
- **AI behavior**: Adjust AI movement and shooting patterns
- **Game settings**: Change round time, bomb timer, etc.

## 🐛 Known Issues

- Mouse sensitivity may vary between browsers
- Some browsers may require HTTPS for pointer lock
- Performance may vary on older devices

## 📝 Future Enhancements

Potential features for future versions:
- Sound effects and music
- More detailed graphics and textures
- Multiple maps
- Multiplayer support
- More weapons and equipment
- Advanced AI behaviors
- Achievement system

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing Minecraft Counter-Strike!** 🎮💥
