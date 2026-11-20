/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Very-High 720p viewport (1280x720)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const VeryHighResolution = {
  id: "VERY_HIGH" as const,
  label: "Very-High" as const,
  width: 1280,
  height: 720,
  aspectRatio: 16 / 9,
  scaleFactor: 4,
  mipLevel: 1,
  theoreticalPixels: 921600n,
  theoreticalVramBytes: 3686400n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 1280 * 720;
    if (total <= maxPhysicalPixels) {
      return { width: 1280, height: 720, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(1280 * ratio)),
      height: Math.max(90, Math.floor(720 * ratio)),
      virtualScale: ratio
    };
  }
};

export default VeryHighResolution;
