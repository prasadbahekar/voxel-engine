import * as THREE from 'three';

export const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
export const soundBuffers = {};

export function initSounds(camera) {
    camera.add(listener);
    loadSound('grassDig1', '/voxel-engine/sounds/dig/grass1.ogg');
    loadSound('grassDig2', '/voxel-engine/sounds/dig/grass2.ogg');
    loadSound('grassDig3', '/voxel-engine/sounds/dig/grass3.ogg');
    loadSound('grassDig4', '/voxel-engine/sounds/dig/grass4.ogg');
    loadSound('grassMining1', '/voxel-engine/sounds/mining/grass1.ogg');
    loadSound('grassMining2', '/voxel-engine/sounds/mining/grass2.ogg');
    loadSound('grassMining3', '/voxel-engine/sounds/mining/grass3.ogg');
    loadSound('grassMining4', '/voxel-engine/sounds/mining/grass4.ogg');
    loadSound('grassMining5', '/voxel-engine/sounds/mining/grass5.ogg');
    loadSound('grassMining6', '/voxel-engine/sounds/mining/grass6.ogg');
}

function loadSound(name, path) {
    audioLoader.load(path, (buffer) => {
        soundBuffers[name] = buffer;
    });
}