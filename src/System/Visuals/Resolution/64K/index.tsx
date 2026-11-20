/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 64K virtualized logical viewport (65536x36864)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res64KResolution = {
  id: "RES_64K" as const,
  label: "64K" as const,
  width: 65536,
  height: 36864,
  aspectRatio: 16 / 9,
  scaleFactor: 204.8,
  mipLevel: 7,
  theoreticalPixels: 2415919104n,
  theoreticalVramBytes: 9663676416n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 65536 * 36864;
    if (total <= maxPhysicalPixels) {
      return { width: 65536, height: 36864, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(65536 * ratio)),
      height: Math.max(90, Math.floor(36864 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res64KResolution;
