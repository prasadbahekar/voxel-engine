import * as THREE from 'three';

export const timer = new THREE.Timer();
export let delta = timer.getDelta();

export function updateTimer() {
  timer.update()
  delta = timer.getDelta();
  delta = Math.min(delta, 0.05);
}