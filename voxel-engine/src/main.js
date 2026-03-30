import { initScene, scene, camera, renderer } from './core/scene.js';
import { setupInput } from './core/input.js';
import { updatePlayer } from './player/player.js';
import { updateChunks } from './world/chunks.js';
import { initControls } from './core/controls.js';
import { updateTimer } from './core/delta.js';
import { initLights } from './world/lighting.js';

initScene();
initControls();
initLights();
setupInput();

function animate() {
  requestAnimationFrame(animate);

  updateTimer();
  updatePlayer();
  updateChunks();

  renderer.render(scene, camera);
}

animate();