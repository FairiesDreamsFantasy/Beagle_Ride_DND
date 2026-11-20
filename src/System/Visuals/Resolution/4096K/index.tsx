/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 4096K virtualized logical viewport (4194304x2359296)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res4096KResolution = {
  id: "RES_4096K" as const,
  label: "4096K" as const,
  width: 4194304,
  height: 2359296,
  aspectRatio: 16 / 9,
  scaleFactor: 13107.2,
  mipLevel: 13,
  theoreticalPixels: 9895604649984n,
  theoreticalVramBytes: 39582418599936n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 4194304 * 2359296;
    if (total <= maxPhysicalPixels) {
      return { width: 4194304, height: 2359296, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(4194304 * ratio)),
      height: Math.max(90, Math.floor(2359296 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res4096KResolution;
