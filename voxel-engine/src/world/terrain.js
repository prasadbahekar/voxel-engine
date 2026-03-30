import { createNoise2D } from "simplex-noise";

const noise2D = createNoise2D();

const SCALE = 0.03;
const HEIGHT_MULTIPLIER = 5;
const HEIGHT_OFFSET = 2;

export function getTerrainHeight(x, z) {
  const noiseValue = noise2D(x * SCALE, z * SCALE);

  const height = Math.floor(
    (noiseValue + HEIGHT_OFFSET) * HEIGHT_MULTIPLIER
  );

  return height;
}