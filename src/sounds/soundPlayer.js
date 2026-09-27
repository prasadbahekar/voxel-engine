import * as THREE from 'three';

export const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
export const soundBuffers = {};

export function initSounds(camera) {
    camera.add(listener);
    loadSounds('grassDig', '/voxel-engine/sounds/dig/grass', 4);
    loadSounds('grassMining', '/voxel-engine/sounds/mining/grass', 6);
    loadSounds('grassHit', '/voxel-engine/sounds/hit/grass', 6);

    loadSounds('gravelDig', '/voxel-engine/sounds/dig/gravel', 4);
    loadSounds('gravelMining', '/voxel-engine/sounds/mining/gravel', 4);
    loadSounds('gravelHit', '/voxel-engine/sounds/hit/gravel', 4);

    loadSounds('stoneDig', '/voxel-engine/sounds/dig/stone', 4);
    loadSounds('stoneMining', '/voxel-engine/sounds/mining/stone', 6);
    loadSounds('stoneHit', '/voxel-engine/sounds/hit/stone', 6);
}

function loadSounds(name, path, count) {
    for (let i = 0; i <= count; i++) {
        loadSound(`${name}${i}`, `${path}${i}.ogg`);
    }
}

function loadSound(name, path) {
    audioLoader.load(path, (buffer) => {
        soundBuffers[name] = buffer;
    });
}