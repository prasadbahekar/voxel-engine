import * as THREE from 'three';
import { delta } from "../core/delta";
import { mouse } from "../core/input";
import { getPlaceBlock, selectedBlock } from "./states";
import { addBlock, removeBlock } from "../world/blocks";
import { isColliding } from "./collision";
import { blockSounds } from '../sounds/soundScenarios';


const BREAK_DELAY = 0.8;
let breakCooldown = 0;

const HIT_SOUND_DELAY = 0.24;
let hitSoundCooldown = 0;

const PLACE_DELAY = 0.2;
let placeCooldown = 0;

let prevSelBlock = null;

export function updateInteractions() {

    placeCooldown -= delta;
    breakCooldown -= delta;
    hitSoundCooldown -= delta;
    
    if (mouse.left) {

        if (!isSameBlock(prevSelBlock, selectedBlock)) {
            breakCooldown = BREAK_DELAY;
        } 

        if (hitSoundCooldown <= 0) {
            blockSounds("grass", "mining", new THREE.Vector3(selectedBlock.x, selectedBlock.y, selectedBlock.z))
            hitSoundCooldown = HIT_SOUND_DELAY;
        }

        if (breakCooldown <= 0) {
            if (selectedBlock) removeBlock(selectedBlock.x, selectedBlock.y, selectedBlock.z);
            breakCooldown = BREAK_DELAY;
        }
    } else {
        breakCooldown = BREAK_DELAY
        hitSoundCooldown = 0;
    };

    if (mouse.right && placeCooldown <= 0) {
        const placeBlock = getPlaceBlock();
        if (placeBlock) {
            addBlock(placeBlock.x, placeBlock.y, placeBlock.z);
            if (isColliding()) removeBlock(placeBlock.x, placeBlock.y, placeBlock.z);
            else {blockSounds("grass", "place", new THREE.Vector3(selectedBlock.x, selectedBlock.y, selectedBlock.z))}
            placeCooldown = PLACE_DELAY;
        }
    }

    prevSelBlock = selectedBlock ? selectedBlock.clone() : null;
}

function isSameBlock(a, b) {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.z === b.z;
}