import { initScene, scene, renderer, updateSky, camera } from './core/scene.js';
import { resetInput, setupInput } from './core/input.js';
import { initPlayer, updatePlayer } from './player/player.js';
import { processChunkQueue, updateChunks } from './world/chunks.js';
import { initControls } from './core/controls.js';
import { updateTimer } from './core/delta.js';
import { initSky } from './world/lighting.js';
import Stats from 'stats.js';
import { updateVisualizationHitbox } from './player/movement.js';
import { updateHUD } from './hud/ingame.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

initScene();
initSky();
setupInput();
initPlayer();
initControls();

function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  updateTimer();
  updateSky();
  updatePlayer();
  updateChunks();
  processChunkQueue();
  updateVisualizationHitbox();
  updateHUD();
  resetInput();
  stats.end();
  renderer.render(scene, camera);
}

animate();