import { camera } from '../core/scene.js';
import { Hitbox } from '../models/hitbox.js';
import { updateMovement } from './movement.js';
import * as THREE from 'three';
import { initSelector, updateRays } from './states.js';
import { mouse } from '../core/input.js';
import { updateInteractions } from './interactions.js';

export let player;
export let player_head;
export let raycaster;
export let player_size = {
  height: 1.8,
  width: 0.6,
};


export let player_stats = {
  TOTAL_HP: 20,
  hp: 18,
  TOTAL_HUNGER: 20,
  hunger: 15,
  exp: 0
};

export function initPlayer() {
  player = new THREE.Group();
  player_head = new THREE.Group();

  player_head.add(camera);
  player_head.position.set(0, 1.6, 0);
  raycaster = new THREE.Raycaster();

  player.add(player_head);
  player.position.set(0, 100, 0);
  initSelector();
}

export const playerHitbox = new Hitbox(new THREE.Vector3(0.6, 1.8, 0.6), new THREE.Vector3(1, 4, 1));
playerHitbox.generateHitbox();

export function updatePlayer() {
  updateMovement();
  updateRays();
  updateInteractions();
}