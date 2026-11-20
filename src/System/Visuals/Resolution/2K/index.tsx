/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 2K DCI-aligned 16:9 viewport (2048x1152)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res2KResolution = {
  id: "RES_2K" as const,
  label: "2K" as const,
  width: 2048,
  height: 1152,
  aspectRatio: 16 / 9,
  scaleFactor: 6.4,
  mipLevel: 2,
  theoreticalPixels: 2359296n,
  theoreticalVramBytes: 9437184n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 2048 * 1152;
    if (total <= maxPhysicalPixels) {
      return { width: 2048, height: 1152, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(2048 * ratio)),
      height: Math.max(90, Math.floor(1152 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res2KResolution;
