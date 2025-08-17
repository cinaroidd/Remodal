import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;
const objects = [];
let blocker, crosshair;

init();
animate();

function init() {
  blocker = document.getElementById('blocker');
  crosshair = document.getElementById('crosshair');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x88ccee);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(-300, 400, -300);
  scene.add(dirLight);

  // Ground (voxel style)
  const gridSize = 20;
  const cubeSize = 50;
  const half = (gridSize * cubeSize) / 2;
  const groundGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x55aa55 });

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cube = new THREE.Mesh(groundGeo, groundMat);
      cube.position.set(i * cubeSize - half + cubeSize / 2, -cubeSize / 2, j * cubeSize - half + cubeSize / 2);
      scene.add(cube);
      objects.push(cube);
    }
  }

  // Enemy cubes
  const enemyMat = new THREE.MeshLambertMaterial({ color: 0xaa3333 });
  for (let n = 0; n < 10; n++) {
    const enemy = new THREE.Mesh(groundGeo, enemyMat);
    enemy.position.set((Math.random() - 0.5) * gridSize * cubeSize, cubeSize / 2, (Math.random() - 0.5) * gridSize * cubeSize);
    scene.add(enemy);
    objects.push(enemy);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, document.body);
  controls.getObject().position.set(0, cubeSize, 0);
  scene.add(controls.getObject());

  blocker.addEventListener('click', () => controls.lock());
  controls.addEventListener('lock', () => {
    blocker.style.display = 'none';
    crosshair.style.display = 'block';
  });
  controls.addEventListener('unlock', () => {
    blocker.style.display = 'flex';
    crosshair.style.display = 'none';
  });

  // Movement
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const moveState = { forward: false, back: false, left: false, right: false };
  const speed = 400.0; // units per second
  const clock = new THREE.Clock();

  function onKeyDown(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': moveState.forward = true; break;
      case 'ArrowLeft':
      case 'KeyA': moveState.left = true; break;
      case 'ArrowDown':
      case 'KeyS': moveState.back = true; break;
      case 'ArrowRight':
      case 'KeyD': moveState.right = true; break;
    }
  }
  function onKeyUp(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': moveState.forward = false; break;
      case 'ArrowLeft':
      case 'KeyA': moveState.left = false; break;
      case 'ArrowDown':
      case 'KeyS': moveState.back = false; break;
      case 'ArrowRight':
      case 'KeyD': moveState.right = false; break;
    }
  }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // Shooting
  document.addEventListener('mousedown', () => {
    if (!controls.isLocked) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(), camera);
    const intersects = raycaster.intersectObjects(objects, false);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      scene.remove(obj);
      const idx = objects.indexOf(obj);
      if (idx !== -1) objects.splice(idx, 1);
    }
  });

  // Animation loop with movement
  function animateLoop() {
    requestAnimationFrame(animateLoop);

    const delta = clock.getDelta();

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveState.forward) - Number(moveState.back);
    direction.x = Number(moveState.right) - Number(moveState.left);
    direction.normalize();

    if (moveState.forward || moveState.back) velocity.z -= direction.z * speed * delta;
    if (moveState.left || moveState.right) velocity.x -= direction.x * speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    renderer.render(scene, camera);
  }

  animateLoop();

  window.addEventListener('resize', onWindowResize);
}

function animate() {
  // kept for backward compatibility; actual loop inside init.
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}