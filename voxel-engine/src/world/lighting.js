import * as THREE from 'three';
import { camera, scene } from '../core/scene.js';
import { ticks } from '../core/delta.js';
import { skinning } from 'three/src/nodes/accessors/SkinningNode.js';

let skyRig;
let sunMesh;
let moonMesh;

let sunlight;
let ambient;

export function initSky () {
  initLights();
  skyRig = new THREE.Group();
  scene.add(skyRig);

  const distance = 256;
  const size = 32;

  // SUN

  const sunGeo = new THREE.PlaneGeometry(size, size);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    side: THREE.DoubleSide
  });

  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.set(0, distance, 0); // start above
  skyRig.add(sunMesh);

  // MOON

  const moonGeo = new THREE.PlaneGeometry(size, size);
  const moonMat = new THREE.MeshBasicMaterial({
    color: 0xaaaaff,
    side: THREE.DoubleSide
  });

  moonMesh = new THREE.Mesh(moonGeo, moonMat);
  moonMesh.position.set(0, -distance, 0); // opposite of sun
  skyRig.add(moonMesh);

  sunMesh.lookAt(skyRig.position);
  moonMesh.lookAt(skyRig.position);
}

function initLights() {
  sunlight = new THREE.DirectionalLight(0xffffff, 0.15);
  scene.add(sunlight);

  ambient = new THREE.AmbientLight(0xffffff);
  scene.add(ambient);
}

export function updateSun() {
  const t = ticks / 24000;
  const angle = (t * Math.PI * 2) - Math.PI / 2;
  const radius = 10;

  // Sunlight
  const y = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  sunlight.position.set(0, Math.max(0, y), z);
  sunlight.intensity = y > 0 ? 0.15 : 0.08;

  // Ambient Lighting
  ambient.intensity = getAmbientFromTicks();

  // Sky
  skyRig.rotation.x = -angle;
  skyRig.position.copy(camera.position);
}

function getAmbientFromTicks() {
  const t = ticks % 24000; // ✅ FIX

  const dayValue = 13;
  const nightValue = 2;

  const normalize = v => v / 15;

  if (t < 12000) {
    return normalize(dayValue);
  }

  if (t < 14000) {
    const k = (t - 12000) / 2000;
    const value = dayValue + (nightValue - dayValue) * k;
    return normalize(value);
  }

  if (t < 22000) {
    return normalize(nightValue);
  }

  const k = (t - 22000) / 2000;
  const value = nightValue + (dayValue - dayValue) * 0 + (dayValue - nightValue) * k;
  return normalize(value);
}