import { scene } from "../core/scene";
import { listener, soundBuffers } from "./soundPlayer";
import * as THREE from 'three';

export function blockSounds(type, category, position, volume = 1) {
    const sound = new THREE.Audio(listener);
    sound.setVolume(volume);

    let buffer;

    if (type == "grass" && category == "dig") {
        console.log(position)
        buffer = soundBuffers[getRandom(soundList("grassDig", 4))];
    } else if (type == "grass" && category == "mining") {
        buffer = soundBuffers[getRandom(soundList("grassMining", 6))];
    } else if (type == "grass" && category == "place") {
        buffer = soundBuffers[getRandom(soundList("grassDig", 4))];
    } else if (type == "grass" && category == "hit") {
        buffer = soundBuffers[getRandom(soundList("grassHit", 4))];
    } else 
        
    if (type == "dirt" && category == "dig") {
        buffer = soundBuffers[getRandom(soundList("gravelDig", 4))];
    } else if (type == "dirt" && category == "mining") {
        buffer = soundBuffers[getRandom(soundList("gravelMining", 4))];
    } else if (type == "dirt" && category == "place") {
        buffer = soundBuffers[getRandom(soundList("gravelDig", 4))];
    } else if (type == "dirt" && category == "hit") {
        buffer = soundBuffers[getRandom(soundList("gravelHit", 4))];
    } else 
    
    if (type == "stone" && category == "dig") {
        buffer = soundBuffers[getRandom(soundList("stoneDig", 4))];
    } else if (type == "stone" && category == "mining") {
        buffer = soundBuffers[getRandom(soundList("stoneMining", 6))];
    } else if (type == "stone" && category == "place") {
        buffer = soundBuffers[getRandom(soundList("stoneDig", 4))];
    } else if (type == "stone" && category == "hit") {
        buffer = soundBuffers[getRandom(soundList("stoneHit", 6))];
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