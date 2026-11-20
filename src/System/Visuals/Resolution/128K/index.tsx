/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 128K virtualized logical viewport (131072x73728)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res128KResolution = {
  id: "RES_128K" as const,
  label: "128K" as const,
  width: 131072,
  height: 73728,
  aspectRatio: 16 / 9,
  scaleFactor: 409.6,
  mipLevel: 8,
  theoreticalPixels: 9663676416n,
  theoreticalVramBytes: 38654705664n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 131072 * 73728;
    if (total <= maxPhysicalPixels) {
      return { width: 131072, height: 73728, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(131072 * ratio)),
      height: Math.max(90, Math.floor(73728 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res128KResolution;
