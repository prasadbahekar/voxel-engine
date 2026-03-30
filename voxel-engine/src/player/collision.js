import { camera } from '../core/scene.js';
import { player_offset } from './movement.js';
import { player } from './player.js';
import { chunks, getChunkCoord } from '../world/chunks.js';

export function isColliding () {
  const x = camera.position.x
  const y = camera.position.y + player_offset.y
  const z = camera.position.z
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  

  if (
    isBlockSolid(x - halfWidth, y + halfHeight, z - halfWidth) ||
    isBlockSolid(x + halfWidth, y + halfHeight, z - halfWidth) ||
    isBlockSolid(x - halfWidth, y + halfHeight, z + halfWidth) ||
    isBlockSolid(x + halfWidth, y + halfHeight, z + halfWidth) ||
    isBlockSolid(x - halfWidth, y + halfHeight * 2, z - halfWidth) ||
    isBlockSolid(x + halfWidth, y + halfHeight * 2, z - halfWidth) ||
    isBlockSolid(x - halfWidth, y + halfHeight * 2, z + halfWidth) ||
    isBlockSolid(x + halfWidth, y + halfHeight * 2, z + halfWidth)
  ) return true;

  return false;
}
  
export function isOnGround() {
  const x = camera.position.x
  const y = camera.position.y + player_offset.y
  const z = camera.position.z
  const half = player.width / 2;

  if (
    isBlockSolid(x - half, y, z - half) ||
    isBlockSolid(x + half, y, z - half) ||
    isBlockSolid(x - half, y, z + half) ||
    isBlockSolid(x + half, y, z + half)
  ) return true;

  return false;
}

export function isBlockSolid(x, y, z) {
  const EPS = 0.0001;

  const bx = Math.round(x + EPS);
  const by = Math.floor(y + EPS);
  const bz = Math.round(z + EPS);

  const chunkX = getChunkCoord(bx);
  const chunkZ = getChunkCoord(bz);

  const chunkKey = `${chunkX},${chunkZ}`;
  const chunk = chunks[chunkKey];

  if (!chunk) return false;

  const blockKey = `${bx},${by},${bz}`;
  return chunk.blocks.has(blockKey);
}