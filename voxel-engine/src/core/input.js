export const keys = {};

export function setupInput() {
  window.addEventListener('keydown', e => keys[e.code.toLowerCase()] = true);
  window.addEventListener('keyup', e => keys[e.code.toLowerCase()] = false);
}