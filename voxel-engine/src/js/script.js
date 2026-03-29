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

const blockSize = 1;
const worldSize = 20;

const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
const material = new THREE.MeshStandardMaterial({ color: 0x55aa55 });

const noise2D = createNoise2D();

for (let x = -worldSize / 2; x < worldSize / 2; x++) {
  for (let z = -worldSize / 2; z < worldSize / 2; z++) {

    const height = Math.floor(
      (noise2D(x * 0.05, z * 0.05) + 2) * 5
    );

    for (let y = 0; y < height; y++) {
        let color;
        if (y < height - (Math.round(Math.random()) + 4))
        { color = 0x757575; } else
        if (y < height - 1) 
        { color = 0x8B4513; } else 
        { color = 0x10dd00; }

        const material = new THREE.MeshStandardMaterial({ color });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        scene.add(cube);
    }
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
