/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * High-Precision Trigonometric Look-Up Table (TrigLUT).
 * Pre-computes 3600 entries (0.1 degree resolution) for Sin and Cos.
 * Includes linear interpolation and minimax atan2 approximation to eliminate libm spikes.
 */

const PRECISION = 10; // 0.1 degree steps
const ENTRIES = 360 * PRECISION;

const SIN_LUT = new Float64Array(ENTRIES);
const COS_LUT = new Float64Array(ENTRIES);

for (let i = 0; i < ENTRIES; i++) {
  const rad = (i / PRECISION) * (Math.PI / 180);
  SIN_LUT[i] = Math.sin(rad);
  COS_LUT[i] = Math.cos(rad);
}

export const TrigLUT = {
  /**
   * O(1) Sine lookup from degree angle.
   */
  sin: (degrees: number): number => {
    const norm = ((degrees % 360) + 360) % 360;
    const index = Math.floor(norm * PRECISION) % ENTRIES;
    return SIN_LUT[index];
  },

  /**
   * O(1) Cosine lookup from degree angle.
   */
  cos: (degrees: number): number => {
    const norm = ((degrees % 360) + 360) % 360;
    const index = Math.floor(norm * PRECISION) % ENTRIES;
    return COS_LUT[index];
  },

  /**
   * Sub-degree linearly interpolated Sine lookup (~10^-7 precision without Math.sin).
   */
  sinInterpolated: (degrees: number): number => {
    const norm = ((degrees % 360) + 360) % 360;
    const scaled = norm * PRECISION;
    const idx0 = Math.floor(scaled) % ENTRIES;
    const idx1 = (idx0 + 1) % ENTRIES;
    const frac = scaled - Math.floor(scaled);
    return SIN_LUT[idx0] + (SIN_LUT[idx1] - SIN_LUT[idx0]) * frac;
  },

  /**
   * Sub-degree linearly interpolated Cosine lookup (~10^-7 precision without Math.cos).
   */
  cosInterpolated: (degrees: number): number => {
    const norm = ((degrees % 360) + 360) % 360;
    const scaled = norm * PRECISION;
    const idx0 = Math.floor(scaled) % ENTRIES;
    const idx1 = (idx0 + 1) % ENTRIES;
    const frac = scaled - Math.floor(scaled);
    return COS_LUT[idx0] + (COS_LUT[idx1] - COS_LUT[idx0]) * frac;
  },

  /**
   * Rational minimax atan2(y, x) approximation in radians (max error < 0.0028 rad).
   */
  atan2Approx: (y: number, x: number): number => {
    if (x === 0) return y > 0 ? Math.PI / 2 : (y < 0 ? -Math.PI / 2 : 0);
    const absY = y < 0 ? -y : y;
    const absX = x < 0 ? -x : x;
    const r = absX > absY ? absY / absX : absX / absY;
    const base = (Math.PI / 4) * r - r * (r - 1) * (0.2447 + 0.0663 * r);
    const octant = absX >= absY ? base : (Math.PI / 2) - base;
    if (x < 0) return y < 0 ? -Math.PI + octant : Math.PI - octant;
    return y < 0 ? -octant : octant;
  }
};
