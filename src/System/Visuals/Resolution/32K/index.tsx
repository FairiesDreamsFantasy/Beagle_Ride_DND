/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 32K virtualized logical viewport (30720x17280)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res32KResolution = {
  id: "RES_32K" as const,
  label: "32K" as const,
  width: 30720,
  height: 17280,
  aspectRatio: 16 / 9,
  scaleFactor: 96,
  mipLevel: 6,
  theoreticalPixels: 530841600n,
  theoreticalVramBytes: 2123366400n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 30720 * 17280;
    if (total <= maxPhysicalPixels) {
      return { width: 30720, height: 17280, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(30720 * ratio)),
      height: Math.max(90, Math.floor(17280 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res32KResolution;
