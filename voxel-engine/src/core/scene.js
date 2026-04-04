import * as THREE from 'three';
import { ticks } from './delta';
import { updateSun } from '../world/lighting';

export const cameraNormalFOV = 75;
export let scene, camera, tpvCamera, renderer, crouchCamera;
export let currentFOV = cameraNormalFOV;
export let currentCamera;

const dayColor = new THREE.Color(0x78A7FF);
const nightColor = new THREE.Color(0x0c1119);
const skyTransitionDuration = 300;

export function initScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(cameraNormalFOV, window.innerWidth / window.innerHeight, 0.1, 1000);

  crouchCamera = new THREE.PerspectiveCamera(cameraNormalFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
  crouchCamera.position.set(0, 15, 0);

  tpvCamera = new THREE.PerspectiveCamera(cameraNormalFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
  tpvCamera.position.set(0, 15, 0);

  currentCamera = camera;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
}

export function setCurrentCamera (newCam) {
  newCam.fov = currentFOV;
  newCam.updateProjectionMatrix();
  currentCamera = newCam;
}

export function setCameraFOV (fov) {
  currentFOV = fov;
}

export function updateCameraFOV() {
  // currentCamera.fov = currentFOV;
  // currentCamera.updateProjectionMatrix();
}

export function updateSky () {
  let color = new THREE.Color();

  if (ticks >= skyTransitionDuration && ticks <= 12000) {
    color.copy(dayColor);
  } else if (ticks > 12000 && ticks < 12000 + skyTransitionDuration) {
    const t = (ticks - 12000) / skyTransitionDuration;
    color.lerpColors(dayColor, nightColor, t);
  } else if (ticks >= 12000 + skyTransitionDuration && ticks <= 24000) {
    color.copy(nightColor);
  } else if (ticks < skyTransitionDuration) {
    const t = ticks / skyTransitionDuration;
    color.lerpColors(nightColor, dayColor, t);
  } 

  updateSun();

  scene.background = color;
}