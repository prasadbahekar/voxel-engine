import { delta } from "../core/delta";
import { mouse } from "../core/input";
import { getPlaceBlock, selectedBlock } from "./states";
import { addBlock, removeBlock } from "../world/chunks";
import { isColliding } from "./collision";


const BREAK_DELAY = 0.5;
let breakCooldown = 0;

const PLACE_DELAY = 0.1;
let placeCooldown = 0;

export function updateInteractions() {

    if (placeCooldown >= 0) placeCooldown -= delta;

    if (mouse.left) {
        breakCooldown -= delta;
        if (breakCooldown <= 0) {
        if (selectedBlock) removeBlock(selectedBlock.x, selectedBlock.y, selectedBlock.z);
        breakCooldown = BREAK_DELAY;
        }
    } else breakCooldown = BREAK_DELAY;

    if (mouse.right && placeCooldown <= 0) {
        const placeBlock = getPlaceBlock();
        if (placeBlock) {
            addBlock(placeBlock.x, placeBlock.y, placeBlock.z);
            if (isColliding()) removeBlock(placeBlock.x, placeBlock.y, placeBlock.z);
            placeCooldown = PLACE_DELAY;
        }
    }


}