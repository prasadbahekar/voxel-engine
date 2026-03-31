import { isOnGround, isColliding } from './collision.js';
import * as THREE from 'three';
import { camera, updateCameraFOV, cameraNormalFOV } from '../core/scene.js';
import { keys } from '../core/input.js';
import { controls } from '../core/controls.js';
import { delta } from '../core/delta.js';
import { playerHitbox } from './player.js';

const velocity = new THREE.Vector3();

let speed = 4.317;
let state = "walk";
const WALK_SPEED = 4.317;
const CROUCH_SPEED = 1.3;
const SPRINT_SPEED = 5.612;
const gravity = -15;      
const jumpForce = 6;      
const stepSize = 0.1;

export const player_offset = new THREE.Vector3(0, -1.6, 0);

export function updateMovement() {
  updateState();

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

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

  // normalize
  const len = Math.hypot(moveX, moveZ);
  if (len > 0) {
    moveX = (moveX / len) * speed;
    moveZ = (moveZ / len) * speed;
  }

  velocity.x = moveX;
  velocity.z = moveZ;

  velocity.y += gravity * delta;

  if (isOnGround()) {
    if (velocity.y < 0) velocity.y = 0;

    if (keys["space"]) {
      velocity.y = jumpForce;
    }
  }

  const frameVelocity = new THREE.Vector3(
    velocity.x * delta,
    velocity.y * delta,
    velocity.z * delta
  );

  move(frameVelocity);

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

function updateState() {
  // Detect State
  state = "walk";
  if (keys["shiftright"]) {
    state = "crouch";
  } else if (keys["controlright"]) {
    state = "sprint";
  }

  // Update Values
  if (state == "walk") {
    speed = WALK_SPEED;
    updateCameraFOV(cameraNormalFOV)
    playerHitbox.updateSize(new THREE.Vector3(0.6, 1.8, 0.6))
  } else if (state == "crouch") {
    speed = CROUCH_SPEED;
    updateCameraFOV(cameraNormalFOV)
    playerHitbox.updateSize(new THREE.Vector3(0.6, 1.5, 0.6))
  } else if (state == "sprint") {
    speed = SPRINT_SPEED;
    updateCameraFOV(cameraNormalFOV + cameraNormalFOV * 0.15);
    playerHitbox.updateSize(new THREE.Vector3(0.6, 1.8, 0.6))
  }
}