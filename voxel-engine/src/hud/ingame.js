import { keys, mouse } from "../core/input";
import { player_stats } from "../player/player";

// IMAGES
import heart_full from '../textures/hud/heart/full.png';
import heart_container from '../textures/hud/heart/container.png';
import heart_half from '../textures/hud/heart/half.png';

import hunger_full from '../textures/hud/food/full.png';
import hunger_container from '../textures/hud/food/container.png';
import hunger_half from '../textures/hud/food/half.png';

const selection = document.getElementById("hot-selection");
const expMask = document.getElementById("exp-mask");
let prevKeys = {};
let current_hotbar = 2;

const healthBar = document.getElementById("health-bar");
const hungerBar = document.getElementById("hunger-bar");

export function updateHUD() {
    for (let i = 1; i <= 9; i++) {
      const key = "digit" + i;
      if (keys[key] && !prevKeys[key]) current_hotbar = i - 1;
      prevKeys[key] = keys[key];
    }

    if (mouse.wheelDirection == 1) {current_hotbar = (current_hotbar + 1) % 9;}
    if (mouse.wheelDirection == -1) {current_hotbar = (current_hotbar - 1 + 9) % 9;}

    setSlot(current_hotbar);
    updateExpBar(Math.floor(player_stats.exp));
    updateHearts();
    updateHunger();
    player_stats.exp += 0.03;
}

function updateHearts() {
  if (healthBar.childElementCount != Math.ceil(player_stats.TOTAL_HP / 2)) {
    removeAllChildren(healthBar);
    for (let i = 0; i < Math.ceil(player_stats.TOTAL_HP / 2); i++) healthBar.appendChild(createHeart());
  }
  for (let i = 0; i < Math.ceil(player_stats.TOTAL_HP / 2); i++) {
    const item = healthBar.children[i].getElementsByClassName("overlay")[0];
    if (player_stats.hp >= (i + 1) * 2) {
      item.src = heart_full;
      item.classList.remove("hidden");
    } else if (player_stats.hp == ((i + 1) * 2) - 1) {
      item.src = heart_half;
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  }
}

function updateHunger() {
  if (hungerBar.childElementCount != Math.ceil(player_stats.TOTAL_HUNGER / 2)) {
    removeAllChildren(hungerBar);
    for (let i = 0; i < Math.ceil(player_stats.TOTAL_HUNGER / 2); i++) hungerBar.appendChild(createHunger());
  }
  for (let i = 0; i < Math.ceil(player_stats.TOTAL_HUNGER / 2); i++) {
    const item = hungerBar.children[i].getElementsByClassName("overlay")[0];
    if (player_stats.hunger >= (i + 1) * 2) {
      item.src = hunger_full;
      item.classList.remove("hidden");
    } else if (player_stats.hunger == ((i + 1) * 2) - 1) {
      item.src = hunger_half;
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  }
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

function removeAllChildren(element) {
    if (!(element instanceof HTMLElement)) {
        return;
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function createHeart() {
  const heartDiv = document.createElement("div");
  heartDiv.className = "heart";

  const img1 = document.createElement("img");
  img1.src = heart_container;

  const img2 = document.createElement("img");
  img2.src = heart_full;
  img2.classList.add("overlay");

  heartDiv.appendChild(img1);
  heartDiv.appendChild(img2);

  return heartDiv;
}

function createHunger() {
  const heartDiv = document.createElement("div");
  heartDiv.className = "hunger";

  const img1 = document.createElement("img");
  img1.src = hunger_container;

  const img2 = document.createElement("img");
  img2.src = hunger_full;
  img2.classList.add("overlay");

  heartDiv.appendChild(img1);
  heartDiv.appendChild(img2);

  return heartDiv;
}