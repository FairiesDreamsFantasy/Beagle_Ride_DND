/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 16K virtualized logical viewport (15360x8640)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res16KResolution = {
  id: "RES_16K" as const,
  label: "16K" as const,
  width: 15360,
  height: 8640,
  aspectRatio: 16 / 9,
  scaleFactor: 48,
  mipLevel: 5,
  theoreticalPixels: 132710400n,
  theoreticalVramBytes: 530841600n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 15360 * 8640;
    if (total <= maxPhysicalPixels) {
      return { width: 15360, height: 8640, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(15360 * ratio)),
      height: Math.max(90, Math.floor(8640 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res16KResolution;
