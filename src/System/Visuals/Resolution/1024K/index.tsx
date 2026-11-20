/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 1024K virtualized logical viewport (1048576x589824)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res1024KResolution = {
  id: "RES_1024K" as const,
  label: "1024K" as const,
  width: 1048576,
  height: 589824,
  aspectRatio: 16 / 9,
  scaleFactor: 3276.8,
  mipLevel: 11,
  theoreticalPixels: 618475290624n,
  theoreticalVramBytes: 2473901162496n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 1048576 * 589824;
    if (total <= maxPhysicalPixels) {
      return { width: 1048576, height: 589824, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(1048576 * ratio)),
      height: Math.max(90, Math.floor(589824 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res1024KResolution;
