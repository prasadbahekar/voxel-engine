import { initScene, scene, camera, renderer } from './core/scene.js';
import { setupInput } from './core/input.js';
import { updatePlayer } from './player/player.js';
import { updateChunks } from './world/chunks.js';
import { initControls } from './core/controls.js';
import { updateTimer } from './core/delta.js';
import { initLights } from './world/lighting.js';
import Stats from 'stats.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

initScene();
initControls();
initLights();
setupInput();

function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  updateTimer();
  updatePlayer();
  updateChunks();
  stats.end();

  renderer.render(scene, camera);
}

animate();