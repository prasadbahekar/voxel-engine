import * as THREE from 'three';

const geometry = new THREE.PlaneGeometry(1, 1);
const loader = new THREE.TextureLoader();
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

const directions = [
  { dir: [1, 0, 0],  normal: 'right' },
  { dir: [-1, 0, 0], normal: 'left' },
  { dir: [0, 1, 0],  normal: 'top' },
  { dir: [0, -1, 0], normal: 'bottom' },
  { dir: [0, 0, 1],  normal: 'front' },
  { dir: [0, 0, -1], normal: 'back' },
];

const materials = [
  new THREE.MeshStandardMaterial({ map: grassSide }),
  new THREE.MeshStandardMaterial({ map: grassSide }),
  new THREE.MeshStandardMaterial({ map: grassTop }),
  new THREE.MeshStandardMaterial({ map: dirt }),
  new THREE.MeshStandardMaterial({ map: grassSide }),
  new THREE.MeshStandardMaterial({ map: grassSide })
];

export function buildChunkMesh(chunk) {
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

  for (const blockKey of chunk.surfaceBlocks) {

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