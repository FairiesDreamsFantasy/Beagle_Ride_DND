/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Ultra-Low virtualized viewport (160x90)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const UltraLowResolution = {
  id: "ULTRA_LOW" as const,
  label: "Ultra-Low" as const,
  width: 160,
  height: 90,
  aspectRatio: 16 / 9,
  scaleFactor: 0.5,
  mipLevel: 0,
  theoreticalPixels: 14400n,
  theoreticalVramBytes: 57600n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 160 * 90;
    if (total <= maxPhysicalPixels) {
      return { width: 160, height: 90, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(160 * ratio)),
      height: Math.max(90, Math.floor(90 * ratio)),
      virtualScale: ratio
    };
  }
};

export default UltraLowResolution;
