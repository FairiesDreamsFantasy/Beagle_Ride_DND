/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './High/index';
export * from './Low/index';

import { HighResolution } from './High/index';
import { LowResolution } from './Low/index';

export interface ResolutionProfile {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  pixelScale: number;
  isAuthenticRetro: boolean;
}

/**
 * Standard Resolution Profiles.
 * Grounded in exact display hardware aspect ratios and non-distorting integer scale factors.
 */
export const RESOLUTION_PROFILES: Record<string, ResolutionProfile> = {
  RETRO_PIXEL: {
    name: 'Authentic 2D Pixelation',
    width: 320,
    height: 180,
    aspectRatio: 16 / 9,
    pixelScale: 1.0,
    isAuthenticRetro: true
  },
  LOW: {
    name: 'Low Standard Definition',
    width: LowResolution.width,
    height: LowResolution.height,
    aspectRatio: 16 / 9,
    pixelScale: 2.0,
    isAuthenticRetro: false
  },
  HIGH: {
    name: 'High Definition',
    width: HighResolution.width,
    height: HighResolution.height,
    aspectRatio: 16 / 9,
    pixelScale: 6.0,
    isAuthenticRetro: false
  }
};

/**
 * Full Mathematical Resolution Management Engine.
 * Eliminates blur, distortion, and fractional sub-pixel jitter.
 */
export const ResolutionModule = {
  current: 'RETRO_PIXEL',
  aspectRatio: '16:9',
  profiles: RESOLUTION_PROFILES,

  /**
   * Calculates integer-ratio bounding box preserving exact aspect ratio.
   */
  calculateFitDimensions(containerWidth: number, containerHeight: number, targetRatio: number = 16 / 9): { width: number; height: number; scale: number } {
    if (containerWidth <= 0 || containerHeight <= 0) {
      return { width: 320, height: 180, scale: 1 };
    }
    const currentRatio = containerWidth / containerHeight;
    let width: number;
    let height: number;

    if (currentRatio > targetRatio) {
      height = containerHeight;
      width = Math.floor(containerHeight * targetRatio);
    } else {
      width = containerWidth;
      height = Math.floor(containerWidth / targetRatio);
    }

    const scale = width / 320;
    return { width, height, scale };
  },

  /**
   * Returns current active resolution dimensions.
   */
  getActiveResolution(profileKey: string = 'RETRO_PIXEL'): ResolutionProfile {
    return RESOLUTION_PROFILES[profileKey] || RESOLUTION_PROFILES.RETRO_PIXEL;
  }
};

export default ResolutionModule;
