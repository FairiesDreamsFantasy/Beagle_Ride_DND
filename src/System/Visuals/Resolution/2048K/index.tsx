/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 2048K virtualized logical viewport (2097152x1179648)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res2048KResolution = {
  id: "RES_2048K" as const,
  label: "2048K" as const,
  width: 2097152,
  height: 1179648,
  aspectRatio: 16 / 9,
  scaleFactor: 6553.6,
  mipLevel: 12,
  theoreticalPixels: 2473901162496n,
  theoreticalVramBytes: 9895604649984n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 2097152 * 1179648;
    if (total <= maxPhysicalPixels) {
      return { width: 2097152, height: 1179648, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(2097152 * ratio)),
      height: Math.max(90, Math.floor(1179648 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res2048KResolution;
