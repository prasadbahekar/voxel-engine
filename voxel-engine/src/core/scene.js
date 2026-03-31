import * as THREE from 'three';

export let scene, camera, renderer;
export let cameraNormalFOV = 75;

export function initScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(cameraNormalFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 40, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

export function updateCameraFOV(newFOV) {
  if (newFOV != camera.fov) {
    camera.fov = newFOV;
    camera.updateProjectionMatrix();
  }
}