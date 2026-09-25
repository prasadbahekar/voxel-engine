import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { camera } from './scene.js';
import { scene } from './scene.js';
import * as THREE from 'three';
import { player } from '../player/player.js';


export let controls;

export function initControls() {
  controls = new PointerLockControls(camera, document.body);

  document.addEventListener('click', () => {
    controls.lock();
  });
}