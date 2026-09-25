import * as THREE from 'three';
import { isBlockSolid } from "../player/collision.js";
import { getMaterial } from './materials.js';


const geometry = new THREE.PlaneGeometry(1, 1);

const directions = [
  { dir: [1, 0, 0],  normal: 'right' },
  { dir: [-1, 0, 0], normal: 'left' },
  { dir: [0, 1, 0],  normal: 'top' },
  { dir: [0, -1, 0], normal: 'bottom' },
  { dir: [0, 0, 1],  normal: 'front' },
  { dir: [0, 0, -1], normal: 'back' },
];

export function buildChunkMesh(chunk) {
  const faceMeshes = {};
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();

  for (const blockKey of chunk.surfaceBlocks) {
    const block = chunk.blocks.get(blockKey);
    if (!block) continue;
    const [x, y, z] = blockKey.split(',').map(Number); 

    directions.forEach(({ dir, normal }) => {
      const nx = x + dir[0];
      const ny = y + dir[1];
      const nz = z + dir[2];

      const material = getMaterial(block.type, normal)
      const meshKey = `${block.type}_${normal}`;

      if (!faceMeshes[meshKey]) {
        faceMeshes[meshKey] = new THREE.InstancedMesh(geometry, material, chunk.blocks.size);
        faceMeshes[meshKey].count = 0;
      }

      const mesh = faceMeshes[meshKey];

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