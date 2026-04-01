import { isOnGround, isColliding } from './collision.js';
import * as THREE from 'three';
import { camera, updateCameraFOV, cameraNormalFOV, scene, currentCamera, crouchCamera, setCurrentCamera } from '../core/scene.js';
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

const hitboxVisualizationOffset = new THREE.Vector3(0, 0, 0);
const hitboxMeshes = [];
const hitboxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

export let player_offset = new THREE.Vector3(0, -1.6, 0);

export function initPlayer() {
  initVisualizationHitbox();
}

function initVisualizationHitbox () {
  playerHitbox.hitboxOffset.forEach(offset => {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const mesh = new THREE.Mesh(geometry, hitboxMaterial);
      hitboxMeshes.push(mesh);
      scene.add(mesh);
  });
}

export function updateVisualizationHitbox () {
  const basePosition = camera.position.clone().add(player_offset).add(hitboxVisualizationOffset);
  hitboxMeshes.forEach((mesh, index) => {
    mesh.position.copy(playerHitbox.hitboxOffset[index]).add(basePosition);
  });
}

export function updateCameras () {
  if (state == "crouch") {
    crouchCamera.position.copy(camera.position);
    crouchCamera.rotation.copy(camera.rotation);
    crouchCamera.position.y -= 0.3;
    setCurrentCamera(crouchCamera);
  }
}

export function updateMovement() {
  updateState();
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
  playerHitbox.updateSize(new THREE.Vector3(0.6, 1.8, 0.6));
  updateCameraFOV(cameraNormalFOV);

  if (state == "walk") {
    speed = WALK_SPEED;
    setCurrentCamera(camera);
  } else if (state == "crouch") {
    speed = CROUCH_SPEED;
    playerHitbox.updateSize(new THREE.Vector3(0.6, 1.5, 0.6));
  } else if (state == "sprint") {
    speed = SPRINT_SPEED;
    updateCameraFOV(cameraNormalFOV + cameraNormalFOV * 0.15);
    setCurrentCamera(camera);
  }
}