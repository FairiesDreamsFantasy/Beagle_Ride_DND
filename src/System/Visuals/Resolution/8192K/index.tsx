/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 8192K virtualized logical viewport (8388608x4718592)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const Res8192KResolution = {
  id: "RES_8192K" as const,
  label: "8192K" as const,
  width: 8388608,
  height: 4718592,
  aspectRatio: 16 / 9,
  scaleFactor: 26214.4,
  mipLevel: 14,
  theoreticalPixels: 39582418599936n,
  theoreticalVramBytes: 158329674399744n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 8388608 * 4718592;
    if (total <= maxPhysicalPixels) {
      return { width: 8388608, height: 4718592, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(8388608 * ratio)),
      height: Math.max(90, Math.floor(4718592 * ratio)),
      virtualScale: ratio
    };
  }
};

export default Res8192KResolution;
