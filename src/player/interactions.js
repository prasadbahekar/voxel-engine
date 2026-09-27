import * as THREE from 'three';
import { delta } from "../core/delta";
import { mouse } from "../core/input";
import { getPlaceBlock, selectedBlock } from "./states";
import { addBlock, removeBlock } from "../world/blocks";
import { getWorldBlock, isColliding } from "./collision";
import { blockSounds } from '../sounds/soundScenarios';
import { chunks, getChunkCoord } from '../world/chunks';


const BREAK_DELAY = 0.9;
let breakCooldown = 0;

const HIT_SOUND_DELAY = 0.21;
let hitSoundCooldown = 0;

const PLACE_DELAY = 0.2;
let placeCooldown = 0;

let selectedBlockData;
let prevSelBlock = null;

export function updateInteractions() {

    placeCooldown -= delta;
    breakCooldown -= delta;
    hitSoundCooldown -= delta;

    if (selectedBlock) {
        selectedBlockData = getWorldBlock(selectedBlock.x, selectedBlock.y, selectedBlock.z);
    } else { selectedBlockData = null; }
    
    if (mouse.left) {

        if (!isSameBlock(prevSelBlock, selectedBlock)) {
            breakCooldown = BREAK_DELAY;
        } 

        if (hitSoundCooldown <= 0 && breakCooldown > 0.2) {
            if (selectedBlockData) blockSounds(selectedBlockData.type, "mining", new THREE.Vector3(selectedBlock.x, selectedBlock.y, selectedBlock.z))
            hitSoundCooldown = HIT_SOUND_DELAY;
        }

        if (breakCooldown <= 0) {
            if (selectedBlock) removeBlock(selectedBlock.x, selectedBlock.y, selectedBlock.z);
            breakCooldown = BREAK_DELAY;
        }
    } else {
        breakCooldown = BREAK_DELAY
        hitSoundCooldown = HIT_SOUND_DELAY;
    };

    if (mouse.right && placeCooldown <= 0) {
        const placeBlock = getPlaceBlock();
        if (placeBlock) {
            addBlock(placeBlock.x, placeBlock.y, placeBlock.z);
            if (isColliding()) removeBlock(placeBlock.x, placeBlock.y, placeBlock.z);
            else {
                blockSounds(selectedBlockData.type, "place", new THREE.Vector3(selectedBlock.x, selectedBlock.y, selectedBlock.z))
            }
            placeCooldown = PLACE_DELAY;
        }
    }

    prevSelBlock = selectedBlock ? selectedBlock.clone() : null;
}

function isSameBlock(a, b) {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.z === b.z;
}