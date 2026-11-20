/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Dot Matrix Visual & Spatial Masking Engine.
 */
export const VisualAnimationDotMatrix = {
  dotRadius: 2,
  spacing: 5,
  style: 'CIRCULAR' as const,

  /**
   * Evaluates whether pixel (x, y) falls inside a circular dot-matrix cell.
   */
  evaluateDotCell(x: number, y: number, spacing: number = 5, radius: number = 2): boolean {
    const cx = Math.floor(x / spacing) * spacing + spacing * 0.5;
    const cy = Math.floor(y / spacing) * spacing + spacing * 0.5;
    const dx = x - cx;
    const dy = y - cy;
    return (dx * dx + dy * dy) <= (radius * radius);
  }
};

export default VisualAnimationDotMatrix;
