import { isBlockSolid } from "../player/collision";
import { updateRays } from "../player/states";
import { chunks, getChunkCoord, rebuildAffectedChunks } from "./chunks";
import { rebuildChunk } from "./chunks";

function updateSurfaceAt(worldX, worldY, worldZ) {
  const y = Math.floor(worldY);

  const chunkX = getChunkCoord(worldX);
  const chunkZ = getChunkCoord(worldZ);
  const key = `${chunkX},${chunkZ}`;

  const chunk = chunks[key];
  if (!chunk) return;

  const blockKey = `${worldX},${y},${worldZ}`;

  if (!chunk.blocks.has(blockKey)) return;

  const directions = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1],
  ];

  let exposed = false;

  for (const [dx, dy, dz] of directions) {
    if (!isBlockSolid(worldX + dx, y + dy, worldZ + dz)) {
      exposed = true;
      break;
    }
  }

  if (exposed) {
    chunk.surfaceBlocks.add(blockKey);
  } else {
    chunk.surfaceBlocks.delete(blockKey);
  }
}

export function addBlock(worldX, worldY, worldZ) {
  const chunkX = getChunkCoord(worldX);
  const chunkZ = getChunkCoord(worldZ);
  const key = `${chunkX},${chunkZ}`;

  const chunk = chunks[key];
  if (!chunk) return;

  const blockKey = `${worldX},${Math.floor(worldY)},${worldZ}`;
  chunk.blocks.set(blockKey, { solid: true });
  chunk.surfaceBlocks.add(blockKey);
  const affectedChunks = updateNeighbors(worldX, worldY, worldZ);

  rebuildAffectedChunks(affectedChunks);
}

export function removeBlock(worldX, worldY, worldZ) {
  const chunkX = getChunkCoord(worldX);
  const chunkZ = getChunkCoord(worldZ);
  const key = `${chunkX},${chunkZ}`;

  const chunk = chunks[key];
  if (!chunk) return;

  const blockKey = `${worldX},${Math.floor(worldY)},${worldZ}`;

  chunk.blocks.delete(blockKey);
  chunk.surfaceBlocks.delete(blockKey);

  const affectedChunks = updateNeighbors(worldX, worldY, worldZ);

  rebuildAffectedChunks(affectedChunks);
  updateRays();
}

function updateNeighbors(worldX, worldY, worldZ) {
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