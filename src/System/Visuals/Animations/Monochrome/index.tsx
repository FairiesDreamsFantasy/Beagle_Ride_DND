/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './Grayscale/index';

/**
 * Monochrome Visual Engine (ITU-R BT.709 Integer Luma).
 */
export const VisualAnimationMonochrome = {
  filter: 'NONE',
  contrast: 1.0,

  /**
   * Converts packed little-endian RGBA32 pixel to perceptual grayscale using pure integer arithmetic.
   * Coefficients: 0.2126*256≈54, 0.7152*256≈183, 0.0722*256≈19
   */
  toGrayscale32(color32: number): number {
    const r = color32 & 0xFF;
    const g = (color32 >> 8) & 0xFF;
    const b = (color32 >> 16) & 0xFF;
    const a = (color32 >>> 24) & 0xFF;
    const luma = (54 * r + 183 * g + 19 * b) >> 8;
    return ((a << 24) | (luma << 16) | (luma << 8) | luma) >>> 0;
  }
};

export default VisualAnimationMonochrome;
