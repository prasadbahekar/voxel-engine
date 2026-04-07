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

  const currentBlock = new THREE.Vector3(
    Math.round(origin.x),
    Math.floor(origin.y),
    Math.round(origin.z)
  );

  if (isBlockSolid(currentBlock.x, currentBlock.y, currentBlock.z)) {
    const gridPos = new THREE.Vector3(
      currentBlock.x,
      currentBlock.y + 0.5,
      currentBlock.z
    );

    outlineCube.position.copy(gridPos);
    outlineCube.visible = true;
    selectedBlock = gridPos;

    normal = direction.clone().multiplyScalar(-1);
    point = origin.clone();

    return;
  }

  origin.addScaledVector(direction, 0.1);

  raycaster.set(origin, direction);
  raycaster.near = 0;
  raycaster.far = 5;
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    let hit;

    if (intersects[0].object != outlineCube) {hit = intersects[0];}
    else if (intersects.length > 1) {hit = intersects[1];}
    else {
      outlineCube.visible = false;
      selectedBlock = null;
      return;
    }

    point = hit.point.clone();
    normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);

    point.addScaledVector(normal, -0.01);

    const gridPos = new THREE.Vector3(
      Math.floor(point.x + 0.5),
      Math.floor(point.y) + 0.5,
      Math.floor(point.z + 0.5)
    );

    if (keys["keyc"]) {
      console.log(isBlockSolid(gridPos.x, gridPos.y, gridPos.z) ? gridPos : "");
    }

    if (isBlockSolid(gridPos.x, gridPos.y, gridPos.z)) {
      outlineCube.position.copy(gridPos);
      outlineCube.visible = true;
      selectedBlock = gridPos;
    } 
    else {
      outlineCube.visible = false;
      selectedBlock = null;
    }
  } else {
    outlineCube.visible = false;
    selectedBlock = null;
  }
}

export function getPlaceBlock () {
  if (!selectedBlock || !point || !normal) return null;

  const newPoint = point.clone().addScaledVector(normal, 0.01);

  const gridPos = new THREE.Vector3(
    Math.floor(newPoint.x + 0.5),
    Math.floor(newPoint.y) + 0.5,
    Math.floor(newPoint.z + 0.5)
  );

  return gridPos;
}