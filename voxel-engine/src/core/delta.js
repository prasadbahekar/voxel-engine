import * as THREE from 'three';

let accumulator = 0;
export const timer = new THREE.Timer();
export let delta = timer.getDelta();
export let ticks = 18040;
export let time = 0;


export function updateTimer() {
  timer.update()
  delta = timer.getDelta();
  delta = Math.min(delta, 0.05);
  accumulator += delta;

  while (accumulator >= 0.05) {
    ticks++;
    time = ticks % 24000;
    accumulator -= 0.05;
  }
}