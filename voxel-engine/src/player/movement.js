import { isOnGround, isColliding } from './collision.js';
import * as THREE from 'three';
import { camera } from '../core/scene.js';
import { keys } from '../core/input.js';
import { controls } from '../core/controls.js';
import { delta } from '../core/delta.js';
import { cos } from 'three/src/nodes/math/MathNode.js';

const velocity = new THREE.Vector3();
const speed = 5;
const gravity = -0.5;
const stepSize = 0.1;
export const player_offset = new THREE.Vector3(0, -1.6, 0);

export function updateMovement() {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  velocity.y += gravity * delta;
  console.log(delta);

  forward.y = 0;
  forward.normalize();
  forward.multiplyScalar(speed)

  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  right.multiplyScalar(speed)

  if (isOnGround()) {
    velocity.y = 0;
    if (keys["space"]) velocity.y = 0.16;
  }

  velocity.x = 0;
  velocity.z = 0;

  if (keys["arrowup"]) {
    velocity.x += forward.x;
    velocity.z += forward.z;
  }

  if (keys["arrowdown"]) {
    velocity.x -= forward.x;
    velocity.z -= forward.z;
  }

  if (keys["arrowright"]) {
    velocity.x += right.x;
    velocity.z += right.z;
  }

  if (keys["arrowleft"]) {
    velocity.x -= right.x;
    velocity.z -= right.z;
  }

  const len = Math.hypot(velocity.x, velocity.z);
  if (len > 0) {
    velocity.x = (velocity.x / len) * speed;
    velocity.z = (velocity.z / len) * speed;
  }

  velocity.x *= delta
  velocity.z *= delta

  move()

  const pos = controls.object.position;
//   camera.position.copy(pos).add(player_offset);
  document.getElementById("cords").textContent = `${camera.position.x.toFixed(2)} ${camera.position.y.toFixed(2)} ${camera.position.z.toFixed(2)}`;
  document.getElementById("colliding").textContent = `${isColliding(camera.position.x, camera.position.y, camera.position.z) ? "true" : "false"}`;
  document.getElementById("fr").textContent = `${forward.x.toFixed(2)} ${right.x.toFixed(2)}`;
}

function move() {
  const pos = controls.object.position;

  let dist = velocity.length();
  let steps = Math.max(1, Math.ceil(dist / stepSize));

  let dx = velocity.x / steps;
  let dy = velocity.y / steps;
  let dz = velocity.z / steps;

  for (let i = 0; i < steps; i++) {
    console.log(velocity.y)
    // Y
    pos.y += dy;
    if (isColliding()) {
      pos.y -= dy;
      velocity.y = 0;
    }

    // X
    pos.x += dx;
    if (isColliding()) pos.x -= dx;

    // Z
    pos.z += dz;
    if (isColliding()) pos.z -= dz;
  }
}