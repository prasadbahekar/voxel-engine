import { keys, mouse } from "../core/input";

const selection = document.getElementById("hot-selection");
const expMask = document.getElementById("exp-mask");
let current_hotbar = 2;
let exp = 7;

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

    updateExpBar(exp);
}

function getTotalXP(level) {
  if (level <= 16) {
    return level * level + 6 * level;
  } else if (level <= 31) {
    return 2.5 * level * level - 40.5 * level + 360;
  } else {
    return 4.5 * level * level - 162.5 * level + 2220;
  }
}

export function getLevelFromXP(total) {
  if (total <= 352) {
    return Math.floor((Math.sqrt(total + 9) - 3));
  } 
  else if (total <= 1507) {
    return Math.floor(
      (81 / 10) + Math.sqrt((2 / 5) * (total - (7839 / 40)))
    );
  } 
  else {
    return Math.floor(
      (325 / 18) + Math.sqrt((2 / 9) * (total - (54215 / 72)))
    );
  }
}

export function updateExpBar(totalXP) {
  const level = getLevelFromXP(totalXP);
  const currentLevelXP = getTotalXP(level);
  const nextLevelXP = getTotalXP(level + 1);

  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;

  const progress = xpIntoLevel / xpNeeded;
    expMask.style.width = (progress * 100) + "%";
}

function setSlot(index) {
  const slotWidth = 34;
  const gap = 6;   
  const x = (index * (slotWidth + gap)) - 2;
  selection.style.left = x + "px";
}