/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pixelation & Retro Raster Mathematics Engine.
 * Implements integer nearest-neighbor sampling, grid quantization, and dither matrices.
 */
export const VisualAnimationPixelations = {
  smoothing: false,

  /**
   * Derives optimal pixelation based on active resolution profile.
   */
  getPixelSize(scale: number): number {
    return Math.max(1, Math.floor(1 / scale));
  },

  /**
   * Quantizes continuous coordinates to a fixed pixel grid resolution.
   */
  snapToPixelGrid(coord: number, pixelSize: number = 4): number {
    return Math.floor(coord / pixelSize) * pixelSize;
  },

  /**
   * Standard 2x2 Bayer Dithering Matrix normalized to [0, 1].
   */
  bayerMatrix2x2: [
    [0.0, 0.5],
    [0.75, 0.25]
  ],

  /**
   * Evaluates dither threshold for a given pixel coordinate.
   */
  getDitherThreshold(x: number, y: number): number {
    return this.bayerMatrix2x2[y % 2][x % 2];
  },

  /**
   * Nearest-neighbor pixel coordinate lookup for scaling textures.
   */
  sampleNearest(u: number, v: number, texWidth: number, texHeight: number): { tx: number; ty: number } {
    const tx = Math.floor(Math.max(0, Math.min(1, u)) * (texWidth - 1));
    const ty = Math.floor(Math.max(0, Math.min(1, v)) * (texHeight - 1));
    return { tx, ty };
  }
};

export default VisualAnimationPixelations;
