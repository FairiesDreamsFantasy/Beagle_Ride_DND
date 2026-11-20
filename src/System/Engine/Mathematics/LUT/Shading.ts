/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Mathematical Pre-computed Look-Up Tables (LUTs) for zero-latency, zero-spike rendering.
// Shifting runtime arithmetic to pre-calculated typed arrays eliminates CPU spikes and frame hitching.

// 1. Shading R channel table (for backwards compatibility)
export const ShadingLUT = new Float32Array(256).map((_, i) => Math.floor(35 + (20 * (i / 255))));

// 2. Packed 32-bit Twilight Sky Color LUT (ABGR little-endian format)
export const ShadingColor32LUT = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  const factor = i / 255;
  const r = Math.floor(35 + (20 * factor));
  const g = Math.floor(25 + (15 * factor));
  const b = Math.floor(55 + (25 * factor));
  ShadingColor32LUT[i] = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

// 3. Reciprocal Distance LUT for scanline height perspective (1 / dy)
// Sized to 2160 entries (8.6 KB) to support arbitrary dynamic screen heights in O(1) without division.
export const RECIPROCAL_LUT_SIZE = 2160;
export const ReciprocalDyLUT = new Float32Array(RECIPROCAL_LUT_SIZE);
ReciprocalDyLUT[0] = 0;
for (let dy = 1; dy < RECIPROCAL_LUT_SIZE; dy++) {
  ReciprocalDyLUT[dy] = 1.0 / dy;
}

// 4. N64 RDP-Inspired Exponential Atmospheric Fog & Depth Attenuation LUT (256 entries)
// Maps normalized distance index [0..255] -> visibility factor [1.0..0.38] via Beer-Lambert exp(-k*d)
export const FOG_LUT_SIZE = 256;
export const FogVisibilityLUT = new Float32Array(FOG_LUT_SIZE);
for (let i = 0; i < FOG_LUT_SIZE; i++) {
  const normDist = i / (FOG_LUT_SIZE - 1);
  FogVisibilityLUT[i] = 0.38 + 0.62 * Math.exp(-2.2 * normDist * normDist);
}

/**
 * O(1) fixed-point integer color depth-attenuation blend (zero heap allocations).
 */
export function applyDepthFog32(color32: number, fogR: number, fogG: number, fogB: number, distIndex: number): number {
  const idx = distIndex < 0 ? 0 : (distIndex >= FOG_LUT_SIZE ? FOG_LUT_SIZE - 1 : distIndex | 0);
  const vis256 = (FogVisibilityLUT[idx] * 256) | 0;
  const inv256 = 256 - vis256;

  const r = (((color32 & 0xFF) * vis256 + fogR * inv256) >> 8) & 0xFF;
  const g = ((((color32 >> 8) & 0xFF) * vis256 + fogG * inv256) >> 8) & 0xFF;
  const b = ((((color32 >> 16) & 0xFF) * vis256 + fogB * inv256) >> 8) & 0xFF;
  return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}
