import { camera } from '../core/scene.js';
import { Hitbox } from '../models/hitbox.js';
import { initVisualizationHitbox, updateMovement } from './movement.js';
import * as THREE from 'three';
import { initSelector, selectedBlock, updateRays } from './states.js';
import { mouse } from '../core/input.js';
import { removeBlock } from '../world/chunks.js';
import { delta } from '../core/delta.js';

export let player;
export let player_head;
export let raycaster;
export let player_size = {
  height: 1.8,
  width: 0.6,
};

let breakCooldown = 0;
const BREAK_DELAY = 0.5;

export function initPlayer() {
  player = new THREE.Group();
  player_head = new THREE.Group();

  player_head.add(camera);
  player_head.position.set(0, 1.6, 0);
  raycaster = new THREE.Raycaster();

  player.add(player_head);
  player.position.set(0, 20, 0);
  initSelector();
  // initVisualizationHitbox();
}

export const playerHitbox = new Hitbox(new THREE.Vector3(0.6, 1.8, 0.6), new THREE.Vector3(1, 4, 1));
playerHitbox.generateHitbox();

export function updatePlayer() {
  updateMovement();
  updateRays();

  if (mouse.left) {
    breakCooldown -= delta;
    if (breakCooldown <= 0) {
      removeBlock(selectedBlock.x, selectedBlock.y, selectedBlock.z);
      breakCooldown = BREAK_DELAY;
    }
  } else breakCooldown = BREAK_DELAY;

  mouse.leftJustPressed = false;
}