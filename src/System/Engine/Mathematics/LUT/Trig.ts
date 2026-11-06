/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * High-Precision Trigonometric Look-Up Table (TrigLUT).
 * Pre-computes 3600 entries (0.1 degree resolution) for Sin and Cos.
 * Eliminates real-time Math.sin/cos calls to prevent CPU spikes during heavy rendering.
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
  }
};
