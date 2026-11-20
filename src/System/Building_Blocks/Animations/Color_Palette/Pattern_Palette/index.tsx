/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/Color_Palette/Pattern_Palette/index.tsx
 * Zero-Allocation Procedural Architectural Pattern Evaluators for Building Blocks.
 */

export const BlockPatternPalette = {
  /**
   * Evaluates 2D tile parity (0 or 1) using bitwise AND on floor grid indices.
   */
  isAlternateTile(rx: number, ry: number, tileSize: number): boolean {
    const tx = Math.floor(rx / tileSize);
    const ty = Math.floor(ry / tileSize);
    return ((tx + ty) & 1) === 0;
  },

  /**
   * Evaluates bevel/grout seam around a repeating square tile border.
   */
  isTileSeam(rx: number, ry: number, tileSize: number, seamWidth: number): boolean {
    const modX = rx % tileSize;
    const modY = ry % tileSize;
    return (modX < 0 ? -modX : modX) < seamWidth || (modY < 0 ? -modY : modY) < seamWidth;
  },

  /**
   * Evaluates horizontal plank strip parity for wooden porch decks & ceilings.
   */
  isAlternatePlank(ry: number, plankWidth: number): boolean {
    return (Math.floor(ry / plankWidth) & 1) === 0;
  },

  /**
   * Evaluates Doric column placement along periodic porch spans.
   */
  isPeriodicColumn(rx: number, spacing: number = 160, columnWidth: number = 12): boolean {
    const modX = rx % spacing;
    return (modX < 0 ? -modX : modX) < columnWidth;
  },

  /**
   * Evaluates periodic railing post alignment.
   */
  isRailingPost(rx: number, spacing: number = 15, postThickness: number = 1.2): boolean {
    const modX = rx % spacing;
    return (modX < 0 ? -modX : modX) < postThickness;
  },

  /**
   * Evaluates Front Porch overhead lantern emitter zone.
   */
  isPorchLanternEmitter(rx: number, ry: number, bayPitch: number = 120, centerY: number = 100, halfSpan: number = 10): boolean {
    if ((Math.floor(rx / bayPitch) & 1) !== 0) return false;
    const dy = ry - centerY;
    if ((dy < 0 ? -dy : dy) >= halfSpan) return false;
    const dx = (rx % bayPitch) - bayPitch * 0.5;
    return (dx < 0 ? -dx : dx) < halfSpan;
  }
};

export default BlockPatternPalette;
