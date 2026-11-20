/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 4K UHD virtualized viewport (3840x2160)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res4KResolution = {
  id: "RES_4K" as const,
  label: "4K" as const,
  width: 3840,
  height: 2160,
  aspectRatio: 16 / 9,
  scaleFactor: 12,
  mipLevel: 3,
  theoreticalPixels: 8294400n,
  theoreticalVramBytes: 33177600n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 3840 * 2160;
    if (total <= maxPhysicalPixels) {
      return { width: 3840, height: 2160, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(3840 * ratio)),
      height: Math.max(90, Math.floor(2160 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res4KResolution;
