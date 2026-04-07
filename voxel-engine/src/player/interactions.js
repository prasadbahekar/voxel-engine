import { delta } from "../core/delta";
import { mouse } from "../core/input";
import { selectedBlock } from "./states";
import { removeBlock } from "../world/chunks";


let breakCooldown = 0;
const BREAK_DELAY = 0.5;

export function updateInteractions() {
    if (mouse.left) {
        breakCooldown -= delta;
        if (breakCooldown <= 0) {
        removeBlock(selectedBlock.x, selectedBlock.y, selectedBlock.z);
        breakCooldown = BREAK_DELAY;
        }
    } else breakCooldown = BREAK_DELAY;
}