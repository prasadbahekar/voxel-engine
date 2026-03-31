import * as THREE from 'three';
import { scene } from '../core/scene.js';

export function initLights() {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

//   const light2 = new THREE.DirectionalLight(0xffffff, 1);
//   light2.position.set(-5, -5, -5);
//   scene.add(light2);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);
}