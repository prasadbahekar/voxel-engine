import { initScene, scene, camera, renderer, currentCamera, updateSky } from './core/scene.js';
import { setupInput } from './core/input.js';
import { updatePlayer } from './player/player.js';
import { updateChunks } from './world/chunks.js';
import { initControls } from './core/controls.js';
import { updateTimer } from './core/delta.js';
import { initSky } from './world/lighting.js';
import { Hitbox } from './models/hitbox.js';
import * as THREE from 'three';
import Stats from 'stats.js';
import { initPlayer, updateCameras, updateVisualizationHitbox } from './player/movement.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

initScene();
initControls();
initSky();
setupInput();
initPlayer();


function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  updateTimer();
  updateSky();
  updatePlayer();
  updateCameras();
  updateChunks();
  updateVisualizationHitbox();
  stats.end();

  renderer.render(scene, currentCamera);
}

animate();