/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 256K virtualized logical viewport (262144x147456)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res256KResolution = {
  id: "RES_256K" as const,
  label: "256K" as const,
  width: 262144,
  height: 147456,
  aspectRatio: 16 / 9,
  scaleFactor: 819.2,
  mipLevel: 9,
  theoreticalPixels: 38654705664n,
  theoreticalVramBytes: 154618822656n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 262144 * 147456;
    if (total <= maxPhysicalPixels) {
      return { width: 262144, height: 147456, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(262144 * ratio)),
      height: Math.max(90, Math.floor(147456 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res256KResolution;
