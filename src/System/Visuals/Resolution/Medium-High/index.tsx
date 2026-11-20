/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Medium-High qHD viewport (960x540)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const MediumHighResolution = {
  id: "MEDIUM_HIGH" as const,
  label: "Medium-High" as const,
  width: 960,
  height: 540,
  aspectRatio: 16 / 9,
  scaleFactor: 3,
  mipLevel: 1,
  theoreticalPixels: 518400n,
  theoreticalVramBytes: 2073600n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 960 * 540;
    if (total <= maxPhysicalPixels) {
      return { width: 960, height: 540, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(960 * ratio)),
      height: Math.max(90, Math.floor(540 * ratio)),
      virtualScale: ratio
    };
  }
};

export default MediumHighResolution;
