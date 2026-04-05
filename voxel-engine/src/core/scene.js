import * as THREE from 'three';
import { ticks } from './delta';
import { updateSun } from '../world/lighting';

export const cameraNormalFOV = 75;
export let scene, camera, renderer;

const dayColor = new THREE.Color(0x78A7FF);
const nightColor = new THREE.Color(0x0c1119);
const skyTransitionDuration = 300;

export function initScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(cameraNormalFOV, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
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