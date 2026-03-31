import { getTerrainHeight } from "./terrain.js";
import { camera } from "../core/scene.js";
import { scene } from "../core/scene.js";
import * as THREE from 'three';

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 1;
export const chunks = {};
let blocksOnScreen = 0;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x55dd55 });

export function createChunk(chunkX, chunkZ) {
  const group = new THREE.Group();
  const key = `${chunkX},${chunkZ}`;
  if (chunks[key]) return;
  const blocks = new Map();

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {

      const worldX = chunkX * CHUNK_SIZE + x;
      const worldZ = chunkZ * CHUNK_SIZE + z;

      const height = getTerrainHeight(worldX, worldZ);

      if (x == 5 & z == 5) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(worldX, height + 2.5, worldZ);
        group.add(cube);
        blocksOnScreen += 1;

        const blockKey = `${worldX},${height+2},${worldZ}`;
        blocks.set(blockKey, { solid: true });
      }

      for (let y = 0; y < height; y++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(worldX, y + 0.5, worldZ);
        group.add(cube);
        blocksOnScreen += 1;

        const blockKey = `${worldX},${y},${worldZ}`;
        blocks.set(blockKey, { solid: true });
      }
    }
  }

  scene.add(group);
  chunks[key] = {
    group,
    blocks
  };
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
        createChunk(chunkX, chunkZ);
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

export function getPlayerChunk() {
  const pos = camera.position;

  return {
    x: getChunkCoord(pos.x),
    z: getChunkCoord(pos.z)
  };
}

export function getChunkCoord(pos) {
  return Math.floor(pos / CHUNK_SIZE);
}
