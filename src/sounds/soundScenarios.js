import { scene } from "../core/scene";
import { listener, soundBuffers } from "./soundPlayer";
import * as THREE from 'three';

export function blockSounds(type, category, position) {
    const sound = new THREE.PositionalAudio(listener);
    sound.setRefDistance(5);
    sound.setRolloffFactor(1);
    sound.setVolume(1);
    sound.position.copy(position);
    let buffer;

    if (type == "grass" && category == "dig") {
        buffer = soundBuffers[getRandom(soundList("grassDig", 4))];
    } else if (type == "grass" && category == "mining") {
        buffer = soundBuffers[getRandom(soundList("grassMining", 6))];
    } else if (type == "grass" && category == "place") {
        buffer = soundBuffers[getRandom(soundList("grassDig", 4))];
    }

    sound.setBuffer(buffer);
    scene.add(sound);
    sound.play();
    sound.onEnded = () => {
        scene.remove(sound);
        sound.disconnect();
    };
}

function getRandom(list) { return list[Math.floor(Math.random() * list.length)] }
function soundList(start, count) { return Array.from({ length: count }, (_, i) => `${start}${i + 1}`); }