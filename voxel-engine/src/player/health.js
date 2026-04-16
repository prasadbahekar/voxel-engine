import { delta } from "../core/delta";
import { player, player_stats } from "./player";

export function updatePlayerHealth() {
    // Damage Checker
    if (player.position.y < 0) {
        player_stats.hp -= delta * 2;
    }

    // Death Checker
    if (player_stats.hp <= 0) {
        player_stats.dead = true;
        player_stats.hp = 0;
    }
}