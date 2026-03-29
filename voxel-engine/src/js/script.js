import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ! TERRAIN START ! //

// Plane
const planeGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);

// Vertices (Blocks)
const noise2D = createNoise2D();
const vertices = planeGeometry.attributes.position;

for (let i = 0; i < vertices.count; i++) {
  const x = vertices.getX(i);
  const y = vertices.getY(i);

  const height = noise2D(x * 0.08, y * 0.08) * 2;
  const blockHeight = Math.floor(height * 4) / 4;

  vertices.setZ(i, blockHeight);
}

vertices.needsUpdate = true;
planeGeometry.computeVertexNormals();

// Colouring
const colors = [];

for (let i = 0; i < vertices.count; i++) {
  const z = vertices.getZ(i);

  if (z < -0.5) {
    colors.push(0, 0, 1); // water (blue)
  } else if (z < 0.4) {
    colors.push(0, 1, 0); // grass
  } else {
    colors.push(0.5, 0.25, 0); // mountain
  }
}

planeGeometry.setAttribute(
  'color',
  new THREE.Float32BufferAttribute(colors, 3)
);

const planeMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  flatShading: true
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);


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

    controls.update()

    renderer.render(scene, camera);
}

animate();