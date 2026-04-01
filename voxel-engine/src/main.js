import { initScene, scene, camera, renderer } from './core/scene.js';
import { setupInput } from './core/input.js';
import { updatePlayer } from './player/player.js';
import { updateChunks } from './world/chunks.js';
import { initControls } from './core/controls.js';
import { updateTimer } from './core/delta.js';
import { initLights } from './world/lighting.js';
import { Hitbox } from './models/hitbox.js';
import * as THREE from 'three';
import Stats from 'stats.js';
import { initVisualizationHitbox, player_offset, updateVisualizationHitbox } from './player/movement.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

initScene();
initControls();
initLights();
setupInput();
initVisualizationHitbox();

const hitbox = new Hitbox(new THREE.Vector3(0.6, 1.8, 0.6), new THREE.Vector3(1, 4, 1));
hitbox.generateHitbox()

// const hitboxVisualizationOffset = new THREE.Vector3(0, 0, 0);
// const hitboxMeshes = [];
// const hitboxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// hitbox.hitboxOffset.forEach(offset => {
//     const geometry = new THREE.SphereGeometry(0.05, 8, 8);
//     const mesh = new THREE.Mesh(geometry, hitboxMaterial);
//     hitboxMeshes.push(mesh);
//     scene.add(mesh);
// });

function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  updateTimer();
  updatePlayer();
  updateChunks();
  updateVisualizationHitbox();
  // Update hitbox visualization positions
//  const basePosition = camera.position.clone().add(player_offset).add(hitboxVisualizationOffset);
//   hitboxMeshes.forEach((mesh, index) => {
//       mesh.position.copy(hitbox.hitboxOffset[index]).add(basePosition);
//   });

  stats.end();

  renderer.render(scene, camera);
}

animate();