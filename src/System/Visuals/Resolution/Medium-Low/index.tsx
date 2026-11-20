/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Medium-Low virtualized viewport (480x270)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const MediumLowResolution = {
  id: "MEDIUM_LOW" as const,
  label: "Medium-Low" as const,
  width: 480,
  height: 270,
  aspectRatio: 16 / 9,
  scaleFactor: 1.5,
  mipLevel: 0,
  theoreticalPixels: 129600n,
  theoreticalVramBytes: 518400n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 480 * 270;
    if (total <= maxPhysicalPixels) {
      return { width: 480, height: 270, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(480 * ratio)),
      height: Math.max(90, Math.floor(270 * ratio)),
      virtualScale: ratio
    };
  }
};

export default MediumLowResolution;
