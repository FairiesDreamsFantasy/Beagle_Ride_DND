/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Mathematical Pre-computed Look-Up Tables (LUTs) for zero-latency, zero-spike rendering.
// Shifting runtime arithmetic to pre-calculated typed arrays eliminates CPU spikes and frame hitching.

// 1. Shading R channel table (for backwards compatibility)
export const ShadingLUT = new Float32Array(256).map((_, i) => Math.floor(35 + (20 * (i / 255))));

// 2. Packed 32-bit Twilight Sky Color LUT (AR-GB format)
// Eliminates Math.floor, multiplication, and bit-shift overhead inside the per-pixel scanning loop
export const ShadingColor32LUT = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  const factor = i / 255;
  const r = Math.floor(35 + (20 * factor));
  const g = Math.floor(25 + (15 * factor));
  const b = Math.floor(55 + (25 * factor));
  ShadingColor32LUT[i] = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

// 3. Reciprocal Distance LUT for scanline height perspective (1 / dy)
// Eliminates floating point division inside vertical scanline passes
export const ReciprocalDyLUT = new Float32Array(360);
ReciprocalDyLUT[0] = 0;
for (let dy = 1; dy < 360; dy++) {
  ReciprocalDyLUT[dy] = 1.0 / dy;
}
