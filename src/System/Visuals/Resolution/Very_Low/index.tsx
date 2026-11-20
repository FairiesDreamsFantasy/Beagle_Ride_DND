/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Very-Low 144p virtualized viewport (256x144)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const VeryLowResolution = {
  id: "VERY_LOW" as const,
  label: "Very_Low" as const,
  width: 256,
  height: 144,
  aspectRatio: 16 / 9,
  scaleFactor: 0.8,
  mipLevel: 0,
  theoreticalPixels: 36864n,
  theoreticalVramBytes: 147456n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 256 * 144;
    if (total <= maxPhysicalPixels) {
      return { width: 256, height: 144, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(256 * ratio)),
      height: Math.max(90, Math.floor(144 * ratio)),
      virtualScale: ratio
    };
  }
};

export default VeryLowResolution;
