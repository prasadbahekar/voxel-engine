import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { createNoise2D } from 'simplex-noise';
import Stats from 'stats.js';

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
  controls.lock();
});

// Keys Handler
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.code.toLowerCase()] = false;
});

// ! PLAYER START ! //
 
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const speed = 1.2;

function updateMovement() {
  direction.set(0, 0, 0);

  // Forward / Backward
  if (keys['arrowup']) direction.z += 1;
  if (keys['arrowdown']) direction.z -= 1;

  // Left / Right
  if (keys['arrowleft']) direction.x -= 1;
  if (keys['arrowright']) direction.x += 1;

  direction.normalize();

  if (keys['arrowup'] || keys['arrowdown']) controls.moveForward(direction.z * speed);
  if (keys['arrowleft'] || keys['arrowright']) controls.moveRight(direction.x * speed);
  if (keys['space']) controls.object.position.y += speed;
  if (keys['shiftright']) controls.object.position.y -= speed;
}

// ! PLAYER END ! //

// ! TERRAIN START ! //

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 1;

const chunks = {};

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x55aa55 });
const noise2D = createNoise2D();

function createChunk(chunkX, chunkZ) {
  const group = new THREE.Group();
  const key = `${chunkX},${chunkZ}`;
  if (chunks[key]) return;

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {

      const worldX = chunkX * CHUNK_SIZE + x;
      const worldZ = chunkZ * CHUNK_SIZE + z;

      const height = Math.floor(
        (noise2D(worldX * 0.03, worldZ * 0.03) + 2) * 5
      );

      for (let y = 0; y < height; y++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(worldX, y, worldZ);
        group.add(cube);
      }
    }
  }

  scene.add(group);
  return group;
}

function updateChunks() {
  const playerChunk = getPlayerChunk();
  const neededChunks = {};

  for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
    for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {

      const chunkX = playerChunk.x + x;
      const chunkZ = playerChunk.z + z;

      const key = `${chunkX},${chunkZ}`;
      neededChunks[key] = true;

      if (!chunks[key]) {
        const chunk = createChunk(chunkX, chunkZ);
        chunks[key] = chunk;
      }
    }
  }

  for (const key in chunks) {
    if (!neededChunks[key]) {
      scene.remove(chunks[key]);
      delete chunks[key];
    }
  }
}

function getPlayerChunk() {
  const pos = controls.object.position;

  return {
    x: getChunkCoord(pos.x),
    z: getChunkCoord(pos.z)
  };
}

function getChunkCoord(pos) {
  return Math.floor(pos / CHUNK_SIZE);
}

// INITIALIZE WORLD
// for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
//   for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
//     const key = `${x},${z}`;
//     chunks[key] = createChunk(x, z);
//   }
// }

// ! TERRAIN END ! //

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Soft ambient light
const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);



// Animation loop
function animate() {
    requestAnimationFrame(animate);
    stats.begin()
    controls.update()
    updateMovement()
    updateChunks()
    renderer.render(scene, camera);
    stats.end();
}

animate();
