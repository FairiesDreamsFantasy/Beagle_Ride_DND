/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Ultra-High 900p viewport (1600x900)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const UltraHighResolution = {
  id: "ULTRA_HIGH" as const,
  label: "Ultra-High" as const,
  width: 1600,
  height: 900,
  aspectRatio: 16 / 9,
  scaleFactor: 5,
  mipLevel: 2,
  theoreticalPixels: 1440000n,
  theoreticalVramBytes: 5760000n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 1600 * 900;
    if (total <= maxPhysicalPixels) {
      return { width: 1600, height: 900, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(1600 * ratio)),
      height: Math.max(90, Math.floor(900 * ratio)),
      virtualScale: ratio
    };
  }
};

export default UltraHighResolution;
