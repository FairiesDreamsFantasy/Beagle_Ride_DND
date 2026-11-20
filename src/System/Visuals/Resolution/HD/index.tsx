/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './UHD/index';

/**
 * High-Definition (HD) Visuals Module (1920x1080).
 * Moved into Resolution/ for unified projective viewport virtualization.
 */
export const HDVisualsModule = {
  id: 'HD' as const,
  resolution: '1080P',
  clarity: 'ULTRA',
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9,
  scaleFactor: 6.0,
  mipLevel: 2,

  virtualizeForBudget(maxPhysicalPixels: number = 230400): { width: number; height: number; virtualScale: number } {
    const total = 1920 * 1080;
    if (total <= maxPhysicalPixels) {
      return { width: 1920, height: 1080, virtualScale: 1.0 };
    }
    const ratio = Math.sqrt(maxPhysicalPixels / total);
    return {
      width: Math.max(160, Math.floor(1920 * ratio)),
      height: Math.max(90, Math.floor(1080 * ratio)),
      virtualScale: ratio
    };
  }
};

export default HDVisualsModule;
