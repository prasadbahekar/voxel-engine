export const keys = {};
export const mouse = {
  left: false,
  leftJustPressed: false,
  right: false,
  rightJustPressed: false,
  wheel: 0,
  wheelDirection: 0,
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

  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey) e.preventDefault();

    mouse.wheel += e.deltaY;

    if (e.deltaY > 0) { mouse.wheelDirection = 1; } 
    else if (e.deltaY < 0) { mouse.wheelDirection = -1; }

  }, { passive: false });
}

export function resetInput() {
  mouse.leftJustPressed = false;
  mouse.rightJustPressed = false;

  mouse.wheel = 0;
  mouse.wheelDirection = 0;
}