/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Trigonometric Lookup Tables (LUT) for ultra-fast 3D raycasting and scientific animations
// Eliminates Math.sin / Math.cos CPU cycles on low-spec 4-GB machines.

const LUT_PRECISION = 360;
export const SinLUT = new Float64Array(LUT_PRECISION);
export const CosLUT = new Float64Array(LUT_PRECISION);

for (let i = 0; i < LUT_PRECISION; i++) {
  const rad = (i * Math.PI) / 180;
  SinLUT[i] = Math.sin(rad);
  CosLUT[i] = Math.cos(rad);
}

export const FastMath = {
  sin(deg: number): number {
    const norm = Math.floor(((deg % 360) + 360) % 360);
    return SinLUT[norm] ?? Math.sin((deg * Math.PI) / 180);
  },
  cos(deg: number): number {
    const norm = Math.floor(((deg % 360) + 360) % 360);
    return CosLUT[norm] ?? Math.cos((deg * Math.PI) / 180);
  }
};

export default FastMath;
