/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/Color_Palette/Monochrome/index.tsx
 * Monochrome & Duotone Tinting Utilities for Building Blocks.
 */

export * from './Grayscale/index';
import { BlockAnimationGrayscale } from './Grayscale/index';

export const BlockAnimationMonochrome = {
  Grayscale: BlockAnimationGrayscale,

  /**
   * Converts packed ABGR32 pixel into a monochrome-tinted 32-bit color using normalized tint RGB.
   */
  applyMonochromeTint32(color32: number, tintR: number, tintG: number, tintB: number): number {
    const luma = BlockAnimationGrayscale.computeLuma8(color32);
    const r = (luma * tintR) >> 8;
    const g = (luma * tintG) >> 8;
    const b = (luma * tintB) >> 8;
    const a = (color32 >>> 24) & 0xFF;
    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }
};

export default BlockAnimationMonochrome;
