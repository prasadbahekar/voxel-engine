import * as THREE from 'three';
import { player_head, playerHitbox, raycaster } from './player';
import { isBlockSolid, isColliding } from './collision';
import { keys } from '../core/input';
import { camera, cameraNormalFOV, scene } from '../core/scene';
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

export let outlineCube;

// ! ~ Inits ~ ! //
export function initSelector() {
  const outlineGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
  });

  outlineCube = new THREE.Mesh(outlineGeometry, outlineMaterial);
  outlineCube.visible = false;

  scene.add(outlineCube);
}


// ! ~ States ~ ! //

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
  player_head.position.y += (targetY - player_head.position.y) * lerpSpeed * delta;

  if (state == "walk") {
    speed = WALK_SPEED;
  } else if (state == "crouch") {
    speed = CROUCH_SPEED;
    playerHitbox.updateSize(new THREE.Vector3(0.6, 1.5, 0.6));
  } else if (state == "sprint") {
    speed = SPRINT_SPEED;
  }

    updateFOV(velocity);
    updateRays();
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



// ! ~ Raycasting ~ ! //

function updateRays() {
  const direction = new THREE.Vector3();
  const origin = new THREE.Vector3();

  camera.getWorldDirection(direction);
  camera.getWorldPosition(origin);

  raycaster.set(origin, direction);
  raycaster.far = 5;

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const hit = intersects[0].object != outlineCube ? intersects[0] : intersects[1];
    const point = hit.point.clone();
    const normal = hit.face.normal;

    // Push slightly INSIDE the block
    point.addScaledVector(normal, -0.015);

    const gridPos = new THREE.Vector3(
      Math.floor(point.x + 0.5),
      Math.floor(point.y) + 0.5,
      Math.floor(point.z + 0.5)
    );

    if (isBlockSolid(point.x, point.y, point.z)) {
      outlineCube.position.copy(gridPos);
      outlineCube.visible = true;
      document.getElementById("fr").textContent = `${point.x.toFixed(2)}, ${point.z.toFixed(2)}`;
    } else outlineCube.visible = false;
  } else {
    outlineCube.visible = false;
  }
}