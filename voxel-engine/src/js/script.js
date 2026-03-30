import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { createNoise2D } from 'simplex-noise';
import Stats from 'stats.js';
import { floor } from 'three/src/nodes/math/MathNode.js';

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
camera.position.y = 15;

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


let onGround = false;
let player = {
  id: "PiGuy141",
  height: 1.8,
  width: 0.6,
  position: new THREE.Vector3(),
  direction: camera.rotation,
}

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const speed = 0.1;
const gravity = -0.01;
const stepSize = 0.1;
const player_offset = new THREE.Vector3(0, -1.6, 0);

function updateMovement() {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  velocity.y += gravity;

  forward.y = 0;
  forward.normalize();
  forward.multiplyScalar(speed)

  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  right.multiplyScalar(speed)

  if (isOnGround()) {
    velocity.y = 0;
    if (keys["space"]) velocity.y += 0.15;
  }

  velocity.x = 0;
  velocity.z = 0;

  if (keys["arrowup"]) {
    velocity.x += forward.x;
    velocity.z += forward.z;
  }

  if (keys["arrowdown"]) {
    velocity.x -= forward.x;
    velocity.z -= forward.z;
  }

  if (keys["arrowright"]) {
    velocity.x += right.x;
    velocity.z += right.z;
  }

  if (keys["arrowleft"]) {
    velocity.x -= right.x;
    velocity.z -= right.z;
  }

  const len = Math.hypot(velocity.x, velocity.z);
  if (len > 0) {
    velocity.x = (velocity.x / len) * speed;
    velocity.z = (velocity.z / len) * speed;
  }

  move()

  // if (keys["space"]) camera.position.y += speed;
  // if (keys["shiftright"]) camera.position.y -= speed;

  const pos = controls.object.position;
  player.position.copy(pos).add(player_offset);
  document.getElementById("cords").textContent = `${player.position.x.toFixed(2)} ${player.position.y.toFixed(2)} ${player.position.z.toFixed(2)}`;
  document.getElementById("colliding").textContent = `${isColliding(player.position.x, player.position.y, player.position.z) ? "true" : "false"}`;
  document.getElementById("fr").textContent = `${forward.x.toFixed(2)} ${right.x.toFixed(2)}`;
}

function move() {
  let dist = Math.sqrt(
    velocity.x * velocity.x +
    velocity.y * velocity.y +
    velocity.z * velocity.z
  );

  let steps = Math.max(1, Math.ceil(dist / stepSize));
  let dx = velocity.x / steps;
  let dy = velocity.y / steps;
  let dz = velocity.z / steps;

  for (let i = 0; i < steps; i++) {
      // Y movement
      camera.position.y += dy;
      if (isColliding()) {
        camera.position.y -= dy;
        velocity.y = 0;
      }

      // X movement
      camera.position.x += dx;
      if (isColliding()) camera.position.x -= dx;

      // Z movement
      camera.position.z += dz;
      if (isColliding()) camera.position.z -= dz;
  }

} 

function isColliding () {
  const x = camera.position.x
  const y = camera.position.y + player_offset.y
  const z = camera.position.z
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  

  if (
    isBlockSolid(x - halfWidth, y + halfHeight, z - halfWidth) ||
    isBlockSolid(x + halfWidth, y + halfHeight, z - halfWidth) ||
    isBlockSolid(x - halfWidth, y + halfHeight, z + halfWidth) ||
    isBlockSolid(x + halfWidth, y + halfHeight, z + halfWidth) ||
    isBlockSolid(x - halfWidth, y + halfHeight * 2, z - halfWidth) ||
    isBlockSolid(x + halfWidth, y + halfHeight * 2, z - halfWidth) ||
    isBlockSolid(x - halfWidth, y + halfHeight * 2, z + halfWidth) ||
    isBlockSolid(x + halfWidth, y + halfHeight * 2, z + halfWidth)
  ) return true;

  return false;
}
  
function isOnGround() {
  const x = camera.position.x
  const y = camera.position.y + player_offset.y
  const z = camera.position.z
  const half = player.width / 2;

  if (
    isBlockSolid(x - half, y, z - half) ||
    isBlockSolid(x + half, y, z - half) ||
    isBlockSolid(x - half, y, z + half) ||
    isBlockSolid(x + half, y, z + half)
  ) return true;

  return false;
}

// ! PLAYER END ! //

// ! TERRAIN START ! //

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 1;
const chunks = {};
let blocksOnScreen = 0;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x55aa55 });
const noise2D = createNoise2D();

function createChunk(chunkX, chunkZ) {
  const group = new THREE.Group();
  const key = `${chunkX},${chunkZ}`;
  if (chunks[key]) return;
  const blocks = new Map();

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {

      const worldX = chunkX * CHUNK_SIZE + x;
      const worldZ = chunkZ * CHUNK_SIZE + z;

      const height = Math.floor(
        (noise2D(worldX * 0.03, worldZ * 0.03) + 2) * 5
      );

      if (x == 5 & z == 5) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(worldX, height + 2.5, worldZ);
        group.add(cube);
        blocksOnScreen += 1;

        const blockKey = `${worldX},${height+2},${worldZ}`;
        blocks.set(blockKey, { solid: true });
      }

      for (let y = 0; y < height; y++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(worldX, y + 0.5, worldZ);
        group.add(cube);
        blocksOnScreen += 1;

        const blockKey = `${worldX},${y},${worldZ}`;
        blocks.set(blockKey, { solid: true });
      }
    }
  }

  scene.add(group);
  chunks[key] = {
    group,
    blocks
  };
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
        createChunk(chunkX, chunkZ);
      }
    }
  }

  for (const key in chunks) {
    if (!neededChunks[key]) {
      scene.remove(chunks[key]["group"]);
      blocksOnScreen -= chunks[key]["blocks"].size;
      delete chunks[key];
    }
  }

  document.getElementById("blocks").textContent = blocksOnScreen;
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

function isBlockSolid(x, y, z) {
  const EPS = 0.0001;

  const bx = Math.round(x + EPS);
  const by = Math.floor(y + EPS);
  const bz = Math.round(z + EPS);

  const chunkX = getChunkCoord(bx);
  const chunkZ = getChunkCoord(bz);

  const chunkKey = `${chunkX},${chunkZ}`;
  const chunk = chunks[chunkKey];

  if (!chunk) return false;

  const blockKey = `${bx},${by},${bz}`;
  return chunk.blocks.has(blockKey);
}

// ! TERRAIN END ! //

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Light
const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
light2.position.set(-5, -5, -5);
scene.add(light2);

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
