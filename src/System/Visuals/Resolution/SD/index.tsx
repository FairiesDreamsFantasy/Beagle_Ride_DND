/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Standard Definition 16:9 viewport (640x360)
 * Decouples logical coordinate precision from physical VRAM allocation using mip-level clamping.
 */
export const SDResolution = {
  id: "SD" as const,
  label: "SD" as const,
  width: 640,
  height: 360,
  aspectRatio: 16 / 9,
  scaleFactor: 2,
  mipLevel: 0,
  theoreticalPixels: 230400n,
  theoreticalVramBytes: 921600n,

  /**
   * Projects logical tier dimensions safely onto a bounded physical pixel budget.
   */
  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 640 * 360;
    if (total <= maxPhysicalPixels) {
      return { width: 640, height: 360, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(640 * ratio)),
      height: Math.max(90, Math.floor(360 * ratio)),
      virtualScale: ratio
    };
  }
};

export default SDResolution;
