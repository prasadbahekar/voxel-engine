import { isOnGround, isColliding } from './collision.js';
import * as THREE from 'three';
import { camera, cameraNormalFOV, scene} from '../core/scene.js';
import { keys } from '../core/input.js';
import { controls } from '../core/controls.js';
import { delta, ticks } from '../core/delta.js';
import { player, playerHitbox } from './player.js';
import { updateState, state, speed } from './states.js';

const velocity = new THREE.Vector3();

const ACCELERATION = 20;
const FRICTION = 10;

const gravity = -18;      
const jumpForce = 6.5;      
const stepSize = 0.1;

const hitboxVisualizationOffset = new THREE.Vector3(0, 0, 0);
const hitboxMeshes = [];
const hitboxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

export let player_offset = new THREE.Vector3(0, -1.6, 0);

export function initVisualizationHitbox () {
  playerHitbox.hitboxOffset.forEach(offset => {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const mesh = new THREE.Mesh(geometry, hitboxMaterial);
      hitboxMeshes.push(mesh);
      scene.add(mesh);
  });
}

export function updateVisualizationHitbox () {
  const basePosition = player.position.clone().add(hitboxVisualizationOffset);
  hitboxMeshes.forEach((mesh, index) => {
    mesh.position.copy(playerHitbox.hitboxOffset[index]).add(basePosition);
  });
}

export function updateMovement() {
  updateState(velocity);
  updateVisualizationHitbox();

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

  // velocity.x += moveX;
  // velocity.z += moveZ;

  let targetVelX = moveX;
  let targetVelZ = moveZ;

  if (len > 0) {
    velocity.x += (targetVelX - velocity.x) * ACCELERATION * delta;
    velocity.z += (targetVelZ - velocity.z) * ACCELERATION * delta;
  } else {
    velocity.x += (0 - velocity.x) * FRICTION * delta;
    velocity.z += (0 - velocity.z) * FRICTION * delta;
  }

  if (Math.abs(velocity.x) < 0.01) velocity.x = 0;
  if (Math.abs(velocity.z) < 0.01) velocity.z = 0;

  velocity.y += gravity * delta;

  if (isOnGround()) {
    if (velocity.y < 0) velocity.y = 0;

    if (keys["space"] && velocity.y == 0) {
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
    `${player.position.x.toFixed(2)} ${player.position.y.toFixed(2)} ${player.position.z.toFixed(2)}`;
}

function move(v) {
  const pos = player.position;

  let dist = v.length();
  let steps = Math.max(1, Math.ceil(dist / stepSize));

  let dx = v.x / steps;
  let dy = v.y / steps;
  let dz = v.z / steps;

  for (let i = 0; i < steps; i++) {
    const isGround = isOnGround();

    // Y
    pos.y += dy;
    if (isColliding()) {
      pos.y -= dy;
      if (velocity.y < 0) {
        pos.y = Math.round(pos.y * 100) / 100;
      }
      velocity.y = 0;
    }

    // X
    pos.x += dx;
    if (isColliding()) pos.x -= dx;
    if (state == "crouch" && isGround && !isOnGround()) pos.x -= dx;

    // Z
    pos.z += dz;
    if (isColliding()) pos.z -= dz;
    if (state == "crouch" && isGround && !isOnGround()) pos.z -= dz;
    
  }
}