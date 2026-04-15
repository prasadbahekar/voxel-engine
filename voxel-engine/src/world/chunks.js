import { getTerrainHeight } from "./terrain.js";
import { scene } from "../core/scene.js";
import * as THREE from 'three';
import { player } from "../player/player.js";
import { updateRays } from "../player/states.js";

const loader = new THREE.TextureLoader();
export const chunks = {};
export const worldData = {};

const chunkQueue = [];
const MAX_CHUNKS_PER_FRAME = 1;

loader.load('src/textures/blocks/dirt.png');

import grass_top_t from '../textures/blocks/grass_top.png';
import grass_side_t from '../textures/blocks/grass_side.png';
import dirt_t from '../textures/blocks/dirt.png';
import { isBlockSolid } from "../player/collision.js";

const grassTop = loader.load(grass_top_t);
const grassSide = loader.load(grass_side_t);
const dirt = loader.load(dirt_t);

[grassTop, grassSide, dirt].forEach(tex => {
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
});

const materials = [
  new THREE.MeshStandardMaterial({ map: grassSide }), // right
  new THREE.MeshStandardMaterial({ map: grassSide }), // left
  new THREE.MeshStandardMaterial({ map: grassTop }),  // top
  new THREE.MeshStandardMaterial({ map: dirt }),      // bottom
  new THREE.MeshStandardMaterial({ map: grassSide }), // front
  new THREE.MeshStandardMaterial({ map: grassSide })  // back
];

const directions = [
  { dir: [1, 0, 0],  normal: 'right' },
  { dir: [-1, 0, 0], normal: 'left' },
  { dir: [0, 1, 0],  normal: 'top' },
  { dir: [0, -1, 0], normal: 'bottom' },
  { dir: [0, 0, 1],  normal: 'front' },
  { dir: [0, 0, -1], normal: 'back' },
];

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 2;
let blocksOnScreen = 0;

const geometry = new THREE.PlaneGeometry(1, 1);


export function createChunk(chunkX, chunkZ) {
  const key = `${chunkX},${chunkZ}`;
  if (chunks[key]) return;

  let chunkData = worldData[key];

  if (!chunkData) {
    const blocks = new Map();

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = chunkX * CHUNK_SIZE + x;
        const worldZ = chunkZ * CHUNK_SIZE + z;
        const height = getTerrainHeight(worldX, worldZ);

        for (let y = 0; y < height; y++) {
          const blockKey = `${worldX},${y},${worldZ}`;
          blocks.set(blockKey, { solid: true });
        }
      }
    }

    worldData[key] = { blocks };
    chunkData = worldData[key];
  }

  const group = buildChunkMesh(chunkData);

  scene.add(group);

  chunks[key] = {
    group,
    blocks: chunkData.blocks
  };
}


function buildChunkMesh(chunk) {
  const faceMeshes = {};
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();

  directions.forEach(({ normal }) => {
    faceMeshes[normal] = new THREE.InstancedMesh(
      geometry,
      materials[getMaterialIndex(normal)],
      chunk.blocks.size
    );
    faceMeshes[normal].count = 0;
  });

  for (const [blockKey, block] of chunk.blocks) {
    if (!block.solid) continue;

    const [x, y, z] = blockKey.split(',').map(Number);

    directions.forEach(({ dir, normal }) => {
      const nx = x + dir[0];
      const ny = y + dir[1];
      const nz = z + dir[2];

      if (isBlockSolid(nx, ny, nz)) return;

      const mesh = faceMeshes[normal];
      position.set(
        x + 0.5 + dir[0] * 0.5,
        y + 0.5 + dir[1] * 0.5,
        z + 0.5 + dir[2] * 0.5
      );

      quaternion.setFromEuler(getFaceRotation(normal));

      matrix.compose(position, quaternion, new THREE.Vector3(1, 1, 1));

      mesh.setMatrixAt(mesh.count++, matrix);
    });
  }

  const group = new THREE.Group();

  for (const key in faceMeshes) {
    const mesh = faceMeshes[key];

    if (mesh.count > 0) {
      mesh.instanceMatrix.needsUpdate = true;
      group.add(mesh);
    }
  }

  return group;
}

function getFaceRotation(normal) {
  switch (normal) {
    case 'top': return new THREE.Euler(-Math.PI / 2, 0, 0);
    case 'bottom': return new THREE.Euler(Math.PI / 2, 0, 0);

    case 'front': return new THREE.Euler(0, 0, 0);
    case 'back': return new THREE.Euler(0, Math.PI, 0);

    case 'right': return new THREE.Euler(0, Math.PI / 2, 0);
    case 'left': return new THREE.Euler(0, -Math.PI / 2, 0);

  }
}

function getMaterialIndex(normal) {
  switch (normal) {
    case 'top': return 2;
    case 'bottom': return 3;
    default: return 0;
  }
}

export function updateChunks() {
  const playerChunk = getPlayerChunk();
  const neededChunks = {};

  for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
    for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {

      const chunkX = playerChunk.x + x;
      const chunkZ = playerChunk.z + z;

      const key = `${chunkX},${chunkZ}`;
      neededChunks[key] = true;

      if (!chunks[key]) {
        enqueueChunk(chunkX, chunkZ);
      }
    }
  }

  for (const key in chunks) {
    if (!neededChunks[key]) {
      scene.remove(chunks[key]["group"]);
      blocksOnScreen -= chunks[key]["blocks"].size;
      delete chunks[key];
    }
  }

  document.getElementById("blocks").textContent = blocksOnScreen;
}

export function rebuildChunk(chunkX, chunkZ) {
  const key = `${chunkX},${chunkZ}`;
  const chunk = chunks[key];
  if (!chunk) return;

  scene.remove(chunk.group);

  const newGroup = buildChunkMesh(chunk);

  scene.add(newGroup);
  chunk.group = newGroup;
}

export function removeBlock(worldX, worldY, worldZ) {
  const chunkX = getChunkCoord(worldX);
  const chunkZ = getChunkCoord(worldZ);
  const key = `${chunkX},${chunkZ}`;

  const chunk = chunks[key];
  if (!chunk) return;

  const blockKey = `${worldX},${Math.floor(worldY)},${worldZ}`;
  chunk.blocks.delete(blockKey);
  rebuildChunk(chunkX, chunkZ);
  updateRays();
}

export function addBlock(worldX, worldY, worldZ) {
  const chunkX = getChunkCoord(worldX);
  const chunkZ = getChunkCoord(worldZ);
  const key = `${chunkX},${chunkZ}`;

  const chunk = chunks[key];
  if (!chunk) return;

  const blockKey = `${worldX},${Math.floor(worldY)},${worldZ}`;

  chunk.blocks.set(blockKey, { solid: true });

  rebuildChunk(chunkX, chunkZ);
}

export function getPlayerChunk() {
  const pos = player.position;
  
  return {
    x: getChunkCoord(pos.x),
    z: getChunkCoord(pos.z)
  };
}

export function getChunkCoord(pos) {
  return Math.floor(pos / CHUNK_SIZE);
}


function enqueueChunk(chunkX, chunkZ) {
  const key = `${chunkX},${chunkZ}`;

  if (chunks[key]) return;
  if (chunkQueue.find(c => c.key === key)) return;

  chunkQueue.push({ chunkX, chunkZ, key });
}

export function processChunkQueue() {
  let count = 0;

  while (chunkQueue.length > 0 && count < MAX_CHUNKS_PER_FRAME) {
    const { chunkX, chunkZ } = chunkQueue.shift();
    createChunk(chunkX, chunkZ);
    count++;
  }
}