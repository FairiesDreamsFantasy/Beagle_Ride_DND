/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/Color_Palette/Monochrome/Grayscale/index.tsx
 * Gamma-calibrated 256-entry Grayscale LUT & packed 32-bit luminance quantization.
 */

// Precomputed Rec.709 integer grayscale palette in packed ABGR32 format
const GRAYSCALE_LUT_32 = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  GRAYSCALE_LUT_32[i] = (0xFF000000 | (i << 16) | (i << 8) | i) >>> 0;
}

export const BlockAnimationGrayscale = {
  standard: 'ITU_R_BT709' as const,
  lut32: GRAYSCALE_LUT_32,

  /**
   * Computes 8-bit integer Rec.709 perceptual luma from packed ABGR32.
   * Coefficients: 0.2126*256=54, 0.7152*256=183, 0.0722*256=19
   */
  computeLuma8(color32: number): number {
    const r = color32 & 0xFF;
    const g = (color32 >> 8) & 0xFF;
    const b = (color32 >> 16) & 0xFF;
    return (54 * r + 183 * g + 19 * b) >> 8;
  },

  /**
   * Converts packed ABGR32 to grayscale ABGR32 preserving alpha channel.
   */
  toGrayscale32(color32: number): number {
    const luma = this.computeLuma8(color32);
    const a = (color32 >>> 24) & 0xFF;
    return ((a << 24) | (luma << 16) | (luma << 8) | luma) >>> 0;
  },

  /**
   * Applies integer contrast scaling around midpoint 128 on grayscale luma.
   */
  evaluateContrastGray32(color32: number, contrast256: number = 256): number {
    const luma = this.computeLuma8(color32);
    const adj = 128 + (((luma - 128) * contrast256) >> 8);
    const clamped = adj < 0 ? 0 : (adj > 255 ? 255 : adj);
    return GRAYSCALE_LUT_32[clamped];
  }
};

export default BlockAnimationGrayscale;
