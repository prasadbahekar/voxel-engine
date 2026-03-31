import { isOnGround, isColliding } from './collision.js';
import * as THREE from 'three';
import { camera } from '../core/scene.js';
import { keys } from '../core/input.js';
import { controls } from '../core/controls.js';
import { delta } from '../core/delta.js';

const velocity = new THREE.Vector3();

const speed = 4.317;      // blocks per second
const gravity = -15;      // stronger gravity (feels better)
const jumpForce = 6;      // jump strength
const stepSize = 0.1;

export const player_offset = new THREE.Vector3(0, -1.6, 0);

export function updateMovement() {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  // remove vertical influence
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  // --- INPUT DIRECTION ---
  let moveX = 0;
  let moveZ = 0;

  if (keys["arrowup"]) {
    moveX += forward.x;
    moveZ += forward.z;
  }
  if (keys["arrowdown"]) {
    moveX -= forward.x;
    moveZ -= forward.z;
  }
  if (keys["arrowright"]) {
    moveX += right.x;
    moveZ += right.z;
  }
  if (keys["arrowleft"]) {
    moveX -= right.x;
    moveZ -= right.z;
  }

  // normalize movement (prevents diagonal speed boost)
  const len = Math.hypot(moveX, moveZ);
  if (len > 0) {
    moveX = (moveX / len) * speed;
    moveZ = (moveZ / len) * speed;
  }

  velocity.x = moveX;
  velocity.z = moveZ;

  // --- GRAVITY ---
  velocity.y += gravity * delta;

  // --- GROUND CHECK ---
  if (isOnGround()) {
    if (velocity.y < 0) velocity.y = 0;

    if (keys["space"]) {
      velocity.y = jumpForce;
    }
  }

  // --- APPLY DELTA (convert to per-frame movement) ---
  const frameVelocity = new THREE.Vector3(
    velocity.x * delta,
    velocity.y * delta,
    velocity.z * delta
  );

  move(frameVelocity);

  // debug UI
  document.getElementById("cords").textContent =
    `${camera.position.x.toFixed(2)} ${(camera.position.y + player_offset.y).toFixed(2)} ${camera.position.z.toFixed(2)}`;
}

function move(v) {
  const pos = controls.object.position;

  let dist = v.length();
  let steps = Math.max(1, Math.ceil(dist / stepSize));

  let dx = v.x / steps;
  let dy = v.y / steps;
  let dz = v.z / steps;

  for (let i = 0; i < steps; i++) {
    // Y
    pos.y += dy;
    if (isColliding()) {
      pos.y -= dy;
      velocity.y = 0;
    }

    // X
    pos.x += dx;
    if (isColliding()) {
      pos.x -= dx;
    }

    // Z
    pos.z += dz;
    if (isColliding()) {
      pos.z -= dz;
    }
  }
}