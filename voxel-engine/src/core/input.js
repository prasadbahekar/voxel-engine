export const keys = {};
export const mouse = {
  left: false,
  leftJustPressed: false
};

export function setupInput() {
  window.addEventListener('keydown', e => keys[e.code.toLowerCase()] = true);
  window.addEventListener('keyup', e => keys[e.code.toLowerCase()] = false);

  window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      if (!mouse.left) {
        mouse.leftJustPressed = true; // 🔥 trigger once
      }
      mouse.left = true;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      mouse.left = false;
    }
  });
}