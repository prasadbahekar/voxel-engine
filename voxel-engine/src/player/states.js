import * as THREE from 'three';
import { player_head, playerHitbox, raycaster } from './player';
import { isBlockSolid, isColliding } from './collision';
import { keys, mouse } from '../core/input';
import { camera, cameraNormalFOV, scene } from '../core/scene';
import { delta } from '../core/delta';
import { addBlock, removeBlock } from '../world/chunks';
export let state = "walk";

let point, normal;

let targetHeight = 1.6;
const STAND_HEIGHT = 1.6;
const CROUCH_HEIGHT = 1.3;
let crouchLerpY = 0;
export let currentHeight = STAND_HEIGHT;

const WALK_SPEED = 4.317;
const CROUCH_SPEED = 1.3;
const SPRINT_SPEED = 5.612;
export let speed = WALK_SPEED;

let outlineCube;
export let selectedBlock = new THREE.Vector3(0, 0, 0); 

// ! ~ Inits ~ ! //
export function initSelector() {
  const outlineGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    opacity: 0.5,
    transparent: true,
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
  if (keys["shiftright"] || keys["shiftleft"]) state = "crouch";
  else if ((keys["controlright"]  || keys["capslock"]) && canUnCrouch()) state = "sprint";

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

export function updateRays() {
  const direction = new THREE.Vector3();
  const origin = new THREE.Vector3();

  camera.getWorldDirection(direction);
  camera.getWorldPosition(origin);
  origin.addScaledVector(direction, 0.0001);

  const result = raycastVoxel(origin, direction, 5);

  if (result) {
    const block = result.block;
    const hitNormal = result.normal;
    const hitPoint = result.hitPoint;

    selectedBlock = block.clone();
    normal = hitNormal.clone();
    point = hitPoint.clone();

    outlineCube.position.set(
      block.x + 0.5,
      block.y + 0.5,
      block.z + 0.5
    );

    outlineCube.visible = true;
    selectedBlock = block.clone();

    point = hitPoint.clone();
    window.normal = normal.clone();
  } else {
    outlineCube.visible = false;
    selectedBlock = null;
  }
}

function raycastVoxel(origin, direction, maxDistance) {
  const pos = origin.clone();

  let x = Math.floor(pos.x);
  let y = Math.floor(pos.y);
  let z = Math.floor(pos.z);

  const stepX = Math.sign(direction.x);
  const stepY = Math.sign(direction.y);
  const stepZ = Math.sign(direction.z);

  const tDeltaX = Math.abs(1 / direction.x);
  const tDeltaY = Math.abs(1 / direction.y);
  const tDeltaZ = Math.abs(1 / direction.z);

  const distToBoundary = (pos, step) =>
    step > 0 ? Math.ceil(pos) - pos : pos - Math.floor(pos);

  let tMaxX = tDeltaX * distToBoundary(pos.x, stepX);
  let tMaxY = tDeltaY * distToBoundary(pos.y, stepY);
  let tMaxZ = tDeltaZ * distToBoundary(pos.z, stepZ);

  let normal = new THREE.Vector3();
  let dist = 0;

  while (dist <= maxDistance) {

    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX;
      dist = tMaxX;
      tMaxX += tDeltaX;
      normal.set(-stepX, 0, 0);
    } 
    else if (tMaxY < tMaxZ) {
      y += stepY;
      dist = tMaxY;
      tMaxY += tDeltaY;
      normal.set(0, -stepY, 0);
    } 
    else {
      z += stepZ;
      dist = tMaxZ;
      tMaxZ += tDeltaZ;
      normal.set(0, 0, -stepZ);
    }

    pos.copy(origin).addScaledVector(direction, dist);

    if (isBlockSolid(x, y, z)) {
      return {
        block: new THREE.Vector3(x, y, z),
        normal: normal.clone(),
        hitPoint: pos.clone()
      };
    }
  }

  return null;
}
export function getPlaceBlock() {
  if (!selectedBlock || !normal) return null;

  return new THREE.Vector3(
    selectedBlock.x + normal.x,
    selectedBlock.y + normal.y,
    selectedBlock.z + normal.z
  );
}