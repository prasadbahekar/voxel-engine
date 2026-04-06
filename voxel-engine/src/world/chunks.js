import { getTerrainHeight } from "./terrain.js";
import { scene } from "../core/scene.js";
import * as THREE from 'three';
import { player } from "../player/player.js";
import { updateRays } from "../player/states.js";

const loader = new THREE.TextureLoader();

loader.load('src/textures/blocks/dirt.png', tex => {
  console.log("grass top loaded", tex);
}, undefined, err => {
  console.error("FAILED to load grass_top", err);
});

const grassTop = loader.load('src/textures/blocks/grass_top.png');
const grassSide = loader.load('src/textures/blocks/grass_side.png');
const dirt = loader.load('src/textures/blocks/dirt.png');

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

const CHUNK_SIZE = 8;
const RENDER_DISTANCE = 1;
export const chunks = {};
let blocksOnScreen = 0;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = materials;

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

export function rebuildChunk(chunkX, chunkZ) {
  const key = `${chunkX},${chunkZ}`;
  const chunk = chunks[key];
  if (!chunk) return;

  scene.remove(chunk.group);

  const newGroup = new THREE.Group();

  for (const [blockKey, block] of chunk.blocks) {
    if (!block.solid) continue;

    const [x, y, z] = blockKey.split(',').map(Number);

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y + 0.5, z);

    newGroup.add(cube);
  }

  scene.add(newGroup);

  chunk.group = newGroup;
}

export function removeBlock(worldX, worldY, worldZ) {
  const chunkX = getChunkCoord(worldX);
  const chunkZ = getChunkCoord(worldZ);
  const key = `${chunkX},${chunkZ}`;

  const chunk = chunks[key];
  if (!chunk) return;

  const blockKey = `${worldX},${worldY-0.5},${worldZ}`;

  console.log(chunk.blocks);
  console.log(blockKey);
  chunk.blocks.delete(blockKey);
  console.log("Hi Daddy");
  console.log(chunk.blocks.get(blockKey));
  rebuildChunk(chunkX, chunkZ);
  updateRays();
}

export function addBlock(worldX, worldY, worldZ) {
  const chunkX = getChunkCoord(worldX);
  const chunkZ = getChunkCoord(worldZ);
  const key = `${chunkX},${chunkZ}`;

  const chunk = chunks[key];
  if (!chunk) return;

  const blockKey = `${worldX},${worldY-0.5},${worldZ}`;

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
