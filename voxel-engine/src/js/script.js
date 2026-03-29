import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';
import Stats from 'stats.js';

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

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

      console.log(worldX, worldZ)

      const height = Math.floor(
        (noise2D(worldX * 0.05, worldZ * 0.05) + 2) * 5
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

function getChunkCoord(pos) {
  return Math.floor(pos / CHUNK_SIZE);
}

// INITIALIZE WORLD
for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
  for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
    createChunk(x, z);
  }
}

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
    renderer.render(scene, camera);
    stats.end();
}

animate();
