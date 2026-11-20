/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/Pixelations/Dot_Matrix/index.tsx
 * Dot-Matrix Aperture Masking & Retro Subpixel Grid Evaluator for Building Blocks.
 */

export const BlockAnimationDotMatrix = {
  defaultSpacing: 4,
  defaultRadius: 1.6,

  /**
   * Evaluates whether sample coordinate (x, y) falls inside a circular dot aperture.
   */
  isInsideDotAperture(x: number, y: number, spacing: number = 4, radius: number = 1.6): boolean {
    const half = spacing * 0.5;
    const localX = (((x % spacing) + spacing) % spacing) - half;
    const localY = (((y % spacing) + spacing) % spacing) - half;
    return localX * localX + localY * localY <= radius * radius;
  },

  /**
   * Modulates packed 32-bit ABGR pixel brightness for dot-matrix LCD matrix borders.
   */
  applyDotMatrixMask32(color32: number, sx: number, sy: number, spacing: number = 4): number {
    if (this.isInsideDotAperture(sx, sy, spacing, spacing * 0.42)) {
      return color32;
    }
    const r = ((color32 & 0xFF) * 205) >> 8;
    const g = (((color32 >> 8) & 0xFF) * 205) >> 8;
    const b = (((color32 >> 16) & 0xFF) * 205) >> 8;
    const a = (color32 >>> 24) & 0xFF;
    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }
};

export default BlockAnimationDotMatrix;
