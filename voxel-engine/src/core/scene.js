import * as THREE from 'three';

export let scene, camera, tpvCamera, renderer, crouchCamera;
export let cameraNormalFOV = 75;
export let currentCamera;

export function initScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(cameraNormalFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 0);

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
  currentCamera = newCam;
}

export function updateCameraFOV(newFOV) {
  if (newFOV != camera.fov) {
    camera.fov = newFOV;
    camera.updateProjectionMatrix();
  }
}