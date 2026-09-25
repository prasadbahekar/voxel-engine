import * as THREE from 'three';

export class Hitbox {
    /**
     * @param {THREE.Vector3} size
     * @param {THREE.Vector3} details
     */
    constructor (size, details) {
        this.size = size
        this.details = details;
    }

    updateSize (newSize) {
        if (this.size != newSize) {
            this.size = newSize;
            this.generateHitbox();
        }
    }

    generateHitbox () {
        const halfLength = this.size.x / 2 / this.details.x;
        const halfHeight = this.size.y / this.details.y;
        const halfBreadth = this.size.z / 2 / this.details.z;
        
        this.hitboxOffset = [];
        for (let ix = -this.details.x; ix <= this.details.x; ix += 2) {
            for (let iy = 0; iy <= this.details.y; iy++) {
                for (let iz = -this.details.z; iz <= this.details.z; iz += 2) {
                    this.hitboxOffset.push(new THREE.Vector3(
                        ix * halfLength,
                        iy * halfHeight,
                        iz * halfBreadth
                    ));
                }
            }
        }
    }
}