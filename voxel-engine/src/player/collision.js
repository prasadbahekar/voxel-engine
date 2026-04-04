import { camera, scene } from '../core/scene.js';
import { player_offset } from './movement.js';
import { player, player_size, playerHitbox } from './player.js';
import { chunks, getChunkCoord } from '../world/chunks.js';

export function isColliding () {
  const x = player.position.x
  const y = player.position.y + player_offset.y
  const z = player.position.z

  for (const offset of playerHitbox.hitboxOffset) {
    if (isBlockSolid(x + offset.x, y + offset.y, z + offset.z)) {
      return true;
    }
  }

  return false;
}
  
export function isOnGround() {
  const EPSILON = 0.01;
  const x = player.position.x
  const y = player.position.y + player_offset.y - EPSILON
  const z = player.position.z
  const half = player_size.width / 2;

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