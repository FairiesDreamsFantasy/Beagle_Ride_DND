/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 512K virtualized logical viewport (524288x294912)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res512KResolution = {
  id: "RES_512K" as const,
  label: "512K" as const,
  width: 524288,
  height: 294912,
  aspectRatio: 16 / 9,
  scaleFactor: 1638.4,
  mipLevel: 10,
  theoreticalPixels: 154618822656n,
  theoreticalVramBytes: 618475290624n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 524288 * 294912;
    if (total <= maxPhysicalPixels) {
      return { width: 524288, height: 294912, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(524288 * ratio)),
      height: Math.max(90, Math.floor(294912 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res512KResolution;
