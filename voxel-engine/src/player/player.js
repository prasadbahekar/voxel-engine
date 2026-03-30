import { camera } from '../core/scene.js';
import { updateMovement } from './movement.js';

export const player = {
  height: 1.8,
  width: 0.6,
};

export function updatePlayer() {
  updateMovement();
}