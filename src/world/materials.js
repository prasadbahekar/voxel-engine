import * as THREE from 'three';
import grass_top_t from '../textures/blocks/grass_top.png';
import grass_side_t from '../textures/blocks/grass_side.png';
import dirt_t from '../textures/blocks/dirt.png';
import stone_t from '../textures/blocks/stone.png';

const loader = new THREE.TextureLoader();

const grassTop = loader.load(grass_top_t);
const grassSide = loader.load(grass_side_t);
const dirt = loader.load(dirt_t);
const stone = loader.load(stone_t);

const textures = [grassTop, grassSide, dirt, stone];

textures.forEach(tex => {
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
});

export const materials = {
    dirtMaterial: new THREE.MeshStandardMaterial({ map: dirt }),
    grassSideMaterial: new THREE.MeshStandardMaterial({ map: grassSide }),
    grassTopMaterial: new THREE.MeshStandardMaterial({ map: grassTop }),
    stoneMaterial: new THREE.MeshStandardMaterial({ map: stone }),
}

export function getMaterial(blockType, normal) {
  if (blockType == "dirt") return materials.dirtMaterial;
  if (blockType == "stone") return materials.stoneMaterial;
  
  if (blockType == "grass") {
    if (normal == "top") return materials.grassTopMaterial;
    if (normal == "bottom") return materials.dirtMaterial;
    return materials.grassSideMaterial
  }
}