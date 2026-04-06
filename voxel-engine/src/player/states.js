import * as THREE from 'three';
import { playerHitbox } from './player';
import { isColliding } from './collision';
import { keys } from '../core/input';
import { camera, cameraNormalFOV } from '../core/scene';
import { delta } from '../core/delta';
export let state = "walk";

let targetHeight = 1.6;
const STAND_HEIGHT = 1.6;
const CROUCH_HEIGHT = 1.3;
let crouchLerpY = 0;
export let currentHeight = STAND_HEIGHT;

const WALK_SPEED = 4.317;
const CROUCH_SPEED = 1.3;
const SPRINT_SPEED = 5.612;
export let speed = WALK_SPEED;

export function updateState(velocity) {
  // Detect State
  state = "crouch";
  if (canUnCrouch()) state = "walk";
  if (keys["shiftright"]) state = "crouch";
  else if (keys["controlright"] && canUnCrouch()) state = "sprint";

  // Update Values
  playerHitbox.updateSize(new THREE.Vector3(0.6, 1.8, 0.6));
  const targetY = state === "crouch" ? CROUCH_HEIGHT : STAND_HEIGHT;
  const lerpSpeed = 8;
  camera.position.y += (targetY - camera.position.y) * lerpSpeed * delta;

  if (state == "walk") {
    speed = WALK_SPEED;
  } else if (state == "crouch") {
    speed = CROUCH_SPEED;
    playerHitbox.updateSize(new THREE.Vector3(0.6, 1.5, 0.6));
  } else if (state == "sprint") {
    speed = SPRINT_SPEED;
  }

    updateFOV(velocity);
}

function updateFOV(velocity) {
  const MIN_FOV = cameraNormalFOV;
  const MAX_FOV = cameraNormalFOV * 1.15;
  const MIN_SPEED = WALK_SPEED;
  const MAX_SPEED = SPRINT_SPEED;
  const horizontalSpeed = Math.hypot(velocity.x, velocity.z);

  let t = (horizontalSpeed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
  t = Math.max(0, Math.min(t, 1));
  t = t * t;

  const targetFOV = MIN_FOV + (MAX_FOV - MIN_FOV) * t;

  const lerpSpeed = 0.4;
  camera.fov += (targetFOV - camera.fov) * lerpSpeed
  camera.updateProjectionMatrix();
}

function canUnCrouch() {
  playerHitbox.updateSize(new THREE.Vector3(0.6, 1.8, 0.6));
  const canCrouch = isColliding();
  playerHitbox.updateSize(new THREE.Vector3(0.6, 1.5, 0.6));
  return !canCrouch;
}