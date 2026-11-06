/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point2D {
  x: number;
  y: number;
}

/**
 * 2D Visual Animation & Interpolation Engine.
 * Mathematical splines, harmonic bobbing, and affine transforms.
 */
export const VisualAnimation2D = {
  scaling: 'LINEAR',
  interpolation: true,

  /**
   * Harmonic trot bobbing formula: y(t) = |sin(t * frequency)| * amplitude
   */
  calculateTrotBob(frame: number, frequency: number = 0.2, amplitude: number = 2.5): number {
    return Math.abs(Math.sin(frame * frequency)) * amplitude;
  },

  /**
   * Cubic Hermite smoothstep interpolation between edge0 and edge1.
   */
  smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  },

  /**
   * Linear interpolation between a and b by factor t [0, 1].
   */
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  },

  /**
   * 2D Affine Rotation about an anchor origin.
   */
  rotatePoint(p: Point2D, origin: Point2D, angleDeg: number): Point2D {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = p.x - origin.x;
    const dy = p.y - origin.y;
    return {
      x: origin.x + dx * cos - dy * sin,
      y: origin.y + dx * sin + dy * cos
    };
  }
};

export default VisualAnimation2D;
