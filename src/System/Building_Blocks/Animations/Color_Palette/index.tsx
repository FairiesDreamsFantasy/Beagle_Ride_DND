/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/Color_Palette/index.tsx
 * Unified Building Blocks Color Palette Engine (ABGR32, Monochrome, Grayscale, Texture_Palette, Pattern_Palette).
 */

export * from './Monochrome/index';
export * from './Texture_Palette/index';
export * from './Pattern_Palette/index';

import { BlockAnimationMonochrome } from './Monochrome/index';
import { BlockTexturePalette } from './Texture_Palette/index';
import { BlockPatternPalette } from './Pattern_Palette/index';

export const BlockAnimationColorPalette = {
  Monochrome: BlockAnimationMonochrome,
  Textures: BlockTexturePalette,
  Patterns: BlockPatternPalette,

  /**
   * Packs RGBA bytes [0..255] into native little-endian ABGR32 integer (0xAABBGGRR).
   */
  pack32(r: number, g: number, b: number, a: number = 255): number {
    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  },

  /**
   * Fixed-point linear blend between two packed ABGR32 colors with blend256 in [0..256].
   */
  lerp32Fixed(c1: number, c2: number, blend256: number): number {
    const t = blend256 < 0 ? 0 : (blend256 > 256 ? 256 : blend256 | 0);
    const inv = 256 - t;
    const r = (((c1 & 0xFF) * inv + (c2 & 0xFF) * t) >> 8) & 0xFF;
    const g = ((((c1 >> 8) & 0xFF) * inv + ((c2 >> 8) & 0xFF) * t) >> 8) & 0xFF;
    const b = ((((c1 >> 16) & 0xFF) * inv + ((c2 >> 16) & 0xFF) * t) >> 8) & 0xFF;
    return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
  }
};

export default BlockAnimationColorPalette;
