import { getTerrainHeight } from "./terrain.js";
import { player } from "../player/player.js";
import { buildChunkMesh } from "./meshes.js";
import { scene } from "../core/scene.js";


const SURFACE_DEPTH = 4;
const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 4;
let blocksOnScreen = 0;

export const chunks = {};
export const worldData = {};

const chunkQueue = [];
const MAX_CHUNKS_PER_FRAME = 1;

export function createChunk(chunkX, chunkZ) {
  const key = `${chunkX},${chunkZ}`;
  if (chunks[key]) return;

  let chunkData = worldData[key];

  if (!chunkData) {
    const blocks = new Map();
    const surfaceBlocks = new Set();

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {

        const worldX = chunkX * CHUNK_SIZE + x;
        const worldZ = chunkZ * CHUNK_SIZE + z;
        const height = getTerrainHeight(worldX, worldZ);

        for (let y = 0; y < height; y++) {
          const blockKey = `${worldX},${y},${worldZ}`;
          blocks.set(blockKey, { solid: true });
        }

        for (let y = height - SURFACE_DEPTH; y < height; y++) {
          if (y < 0) continue;

          const blockKey = `${worldX},${y},${worldZ}`;
          surfaceBlocks.add(blockKey);
        }
      }
    }

    worldData[key] = { blocks, surfaceBlocks };
    chunkData = worldData[key];
  }

  const group = buildChunkMesh(chunkData);

  scene.add(group);

  chunks[key] = {
    group,
    blocks: chunkData.blocks,
    surfaceBlocks: chunkData.surfaceBlocks
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

function enqueueChunk(chunkX, chunkZ) {
  const key = `${chunkX},${chunkZ}`;

  if (chunks[key]) return;
  if (chunkQueue.find(c => c.key === key)) return;

  const playerChunk = getPlayerChunk();

  const dx = chunkX - playerChunk.x;
  const dz = chunkZ - playerChunk.z;

  const distSq = dx * dx + dz * dz;

  chunkQueue.push({ chunkX, chunkZ, key, distSq });

  chunkQueue.sort((a, b) => a.distSq - b.distSq);
}

export function processChunkQueue() {
  let count = 0;

  while (chunkQueue.length > 0 && count < MAX_CHUNKS_PER_FRAME) {
    const { chunkX, chunkZ } = chunkQueue.shift();
    createChunk(chunkX, chunkZ);
    count++;
  }
}

export function updateNeighbors(worldX, worldY, worldZ) {
  const dirs = [
    [0, 0, 0],
    [0, -1, 0],
    [0, 1, 0],
    [1, 0, 0],
    [-1, 0, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];

  const affectedChunks = new Set();

  for (const [dx, dy, dz] of dirs) {
    const nx = worldX + dx;
    const ny = Math.floor(worldY) + dy;
    const nz = worldZ + dz;

    updateSurfaceAt(nx, ny, nz);

    const cX = getChunkCoord(nx);
    const cZ = getChunkCoord(nz);
    affectedChunks.add(`${cX},${cZ}`);
  }

  return affectedChunks;
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

export function rebuildAffectedChunks(affectedChunks) {
  for (const key of affectedChunks) {
    const [cX, cZ] = key.split(',').map(Number);
    rebuildChunk(cX, cZ);
  }
}