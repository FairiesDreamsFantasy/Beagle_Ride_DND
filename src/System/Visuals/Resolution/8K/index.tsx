/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 8K UHD virtualized viewport (7680x4320)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res8KResolution = {
  id: "RES_8K" as const,
  label: "8K" as const,
  width: 7680,
  height: 4320,
  aspectRatio: 16 / 9,
  scaleFactor: 24,
  mipLevel: 4,
  theoreticalPixels: 33177600n,
  theoreticalVramBytes: 132710400n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 7680 * 4320;
    if (total <= maxPhysicalPixels) {
      return { width: 7680, height: 4320, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(7680 * ratio)),
      height: Math.max(90, Math.floor(4320 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res8KResolution;
