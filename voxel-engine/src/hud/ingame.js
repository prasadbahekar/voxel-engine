import { keys, mouse } from "../core/input";

const selection = document.getElementById("hot-selection");
let current_hotbar = 2;

function setSlot(index) {
  const slotWidth = 34;
  const gap = 6;   
  const x = (index * (slotWidth + gap)) - 2;
  selection.style.left = x + "px";
}

export function updateHUD() {
    for (let i = 1; i <= 9; i++) {
        const key = "digit" + i;
        if (keys[key]) {
        current_hotbar = i - 1;
        }
    }
    setSlot(current_hotbar);
    if (mouse.wheelDirection == 1) {current_hotbar = (current_hotbar + 1) % 9;}
    if (mouse.wheelDirection == -1) {current_hotbar = (current_hotbar - 1 + 9) % 9;}
}