import { camera } from '../core/scene.js';
import { Hitbox } from '../models/hitbox.js';
import { initVisualizationHitbox, updateMovement } from './movement.js';
import * as THREE from 'three';

export const player = {
  height: 1.8,
  width: 0.6,
};

export const playerHitbox = new Hitbox(new THREE.Vector3(0.6, 1.8, 0.6), new THREE.Vector3(1, 4, 1));
playerHitbox.generateHitbox();

export function updatePlayer() {
  updateMovement();
}