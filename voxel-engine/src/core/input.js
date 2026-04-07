export const keys = {};
export const mouse = {
  left: false,
  leftJustPressed: false,
  right: false,
  rightJustPressed: false
};

export function setupInput() {
  window.addEventListener('keydown', e => keys[e.code.toLowerCase()] = true);
  window.addEventListener('keyup', e => keys[e.code.toLowerCase()] = false);

  window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      if (!mouse.left) mouse.leftJustPressed = true;
      mouse.left = true;
    }
    
    if (e.button === 2) {
      if (!mouse.right) mouse.rightJustPressed = true;
      mouse.right = true;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.left = false;
    if (e.button === 2) mouse.right = false;
    
  });
}