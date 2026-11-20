/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/Pixelations/index.tsx
 * Raster Quantization, Bayer Ordered Dithering (2x2 & 4x4), and Integer Snapping for Building Blocks.
 */

export * from './Dot_Matrix/index';

// Precomputed Bayer 4x4 threshold matrix normalized to [0..15] / 16
const BAYER_4X4_LUT = new Float32Array([
   0 / 16,  8 / 16,  2 / 16, 10 / 16,
  12 / 16,  4 / 16, 14 / 16,  6 / 16,
   3 / 16, 11 / 16,  1 / 16,  9 / 16,
  15 / 16,  7 / 16, 13 / 16,  5 / 16
]);

export const BlockAnimationPixelations = {
  bayerMatrix4x4: BAYER_4X4_LUT,

  /**
   * Snaps world coordinate to discrete integer texel grid.
   */
  snapWorldToTexel(coord: number, texelPitch: number): number {
    return Math.floor(coord / texelPitch) * texelPitch;
  },

  /**
   * O(1) bitmask Bayer 4x4 ordered dither threshold lookup in [0, 1).
   */
  getBayerThreshold4x4(sx: number, sy: number): number {
    return BAYER_4X4_LUT[((sy & 3) << 2) | (sx & 3)];
  },

  /**
   * Quantizes a packed 32-bit ABGR color to RGB555 (N64/SNES 15-bit style) using ordered dithering.
   */
  quantizeColor32Dithered(color32: number, sx: number, sy: number): number {
    const threshold = (BAYER_4X4_LUT[((sy & 3) << 2) | (sx & 3)] - 0.5) * 8;
    const r = Math.max(0, Math.min(255, ((color32 & 0xFF) + threshold) | 0)) & 0xF8;
    const g = Math.max(0, Math.min(255, (((color32 >> 8) & 0xFF) + threshold) | 0)) & 0xF8;
    const b = Math.max(0, Math.min(255, (((color32 >> 16) & 0xFF) + threshold) | 0)) & 0xF8;
    const a = (color32 >>> 24) & 0xFF;
    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }
};

export default BlockAnimationPixelations;
