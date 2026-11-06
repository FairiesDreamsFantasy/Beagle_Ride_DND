/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * High-Performance Color Palette & 32-bit ARGB Matrix Engine.
 * Provides zero-allocation color packing, unpacking, and linear blending.
 */
export const VisualAnimationColorPalette = {
  bitDepth: 24,
  dynamicRange: 'HIGH',

  /**
   * Packs RGBA channels (0-255) into a native little-endian Uint32 format (0xAABBGGRR / 0xFFBBGGRR).
   */
  pack32(r: number, g: number, b: number, a: number = 255): number {
    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  },

  /**
   * Unpacks a 32-bit color integer into discrete RGBA channels.
   */
  unpack32(color32: number): RGBAColor {
    return {
      r: color32 & 0xFF,
      g: (color32 >> 8) & 0xFF,
      b: (color32 >> 16) & 0xFF,
      a: (color32 >>> 24) & 0xFF
    };
  },

  /**
   * Linearly blends two 32-bit colors by alpha factor t [0, 1].
   */
  blendColors32(c1: number, c2: number, t: number): number {
    const invT = 1 - t;
    const r1 = c1 & 0xFF, g1 = (c1 >> 8) & 0xFF, b1 = (c1 >> 16) & 0xFF, a1 = (c1 >>> 24) & 0xFF;
    const r2 = c2 & 0xFF, g2 = (c2 >> 8) & 0xFF, b2 = (c2 >> 16) & 0xFF, a2 = (c2 >>> 24) & 0xFF;

    const r = Math.floor(r1 * invT + r2 * t);
    const g = Math.floor(g1 * invT + g2 * t);
    const b = Math.floor(b1 * invT + b2 * t);
    const a = Math.floor(a1 * invT + a2 * t);

    return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  },

  /**
   * Distinctive coat colors for registered Beagles.
   */
  beaglePalette: {
    ELSA: { coat: '#FFEB3B', saddle: '#FF4081', ear: '#FF9800', collar: '#795548', eye: '#4B0082' },
    THELMA: { coat: '#D32F2F', saddle: '#FFFFFF', ear: '#5D4037', collar: '#9C27B0', eye: '#8BC34A' },
    TINA: { coat: '#B3E5FC', saddle: '#C2185B', ear: '#0D47A1', collar: '#4CAF50', eye: '#1B5E20' },
    JETTA: { coat: '#FFFFFF', saddle: '#FF5722', ear: '#FF5722', collar: '#1E40AF', eye: '#1E3A8A' }
  }
};

export default VisualAnimationColorPalette;
