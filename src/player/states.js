import * as THREE from 'three';
import { player_head, playerHitbox, raycaster } from './player';
import { isBlockSolid, isColliding } from './collision';
import { keys, mouse } from '../core/input';
import { camera, cameraNormalFOV, scene } from '../core/scene';
import { delta } from '../core/delta';
import { textureLevel } from 'three/tsl';
export let state = "walk";

import destroyStage1 from '../textures/blocks/destroy_stage_1.png';
import destroyStage0 from '../textures/blocks/destroy_stage_0.png';
import destroyStage2 from '../textures/blocks/destroy_stage_2.png';
import destroyStage3 from '../textures/blocks/destroy_stage_3.png';
import destroyStage4 from '../textures/blocks/destroy_stage_4.png';
import destroyStage5 from '../textures/blocks/destroy_stage_5.png';
import destroyStage6 from '../textures/blocks/destroy_stage_6.png';
import destroyStage7 from '../textures/blocks/destroy_stage_7.png';
import destroyStage8 from '../textures/blocks/destroy_stage_8.png';
import destroyStage9 from '../textures/blocks/destroy_stage_9.png';

const destroyStages = [
    destroyStage0,
    destroyStage1,
    destroyStage2,
    destroyStage3,
    destroyStage4,
    destroyStage5,
    destroyStage6,
    destroyStage7,
    destroyStage8,
    destroyStage9,
];

let normal;
let point;

const STAND_HEIGHT = 1.6;
const CROUCH_HEIGHT = 1.3;
export let currentHeight = STAND_HEIGHT;

const WALK_SPEED = 4.317;
const CROUCH_SPEED = 1.3;
const SPRINT_SPEED = 5.612;
export let speed = WALK_SPEED;

let outlineCube;
export let selectedBlock = new THREE.Vector3(0, 0, 0); 

let breakingCube;
let breakingMaterials = [];
let breakingTextures = [];

// ! ~ Inits ~ ! //
export function initSelector() {
  const outlineGeometry = new THREE.EdgesGeometry( new THREE.BoxGeometry(1.01, 1.01, 1.01) );
  const outlineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 0.8,
    transparent: true,
    depthTest: true,
  });

  outlineCube = new THREE.LineSegments(outlineGeometry, outlineMaterial);
  outlineCube.visible = false;

  scene.add(outlineCube);
}

export function initBreakingSelector() {
    const loader = new THREE.TextureLoader();
    destroyStages.forEach((path, i) => {
        loader.load(path, (texture) => {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            breakingTextures[i] = texture;
          }
        );
    });

    breakingMaterials = Array.from({ length: 6 }, () => {
        return new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
          depthTest: true,
          side: THREE.DoubleSide,
          alphaTest: 0,
          blending: THREE.NormalBlending,
          toneMapped: false
        });
    });

    const geometry = new THREE.BoxGeometry(1.002, 1.002, 1.002);

    breakingCube = new THREE.Mesh(geometry, breakingMaterials);
    breakingCube.visible = false;
    scene.add(breakingCube);
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

export function updateBreakingSelector(progress) {

    if (!breakingCube || !selectedBlock || progress <= 0) {
        if (breakingCube) breakingCube.visible = false;
        return;
    }

    const stage = Math.min(9, Math.floor(progress * 10));
    const texture = breakingTextures[stage];

    for (const material of breakingMaterials) {
        material.map = texture;
        material.needsUpdate = true;
    }

    breakingCube.position.set(selectedBlock.x + 0.5, selectedBlock.y + 0.5, selectedBlock.z + 0.5);
    breakingCube.visible = true;
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