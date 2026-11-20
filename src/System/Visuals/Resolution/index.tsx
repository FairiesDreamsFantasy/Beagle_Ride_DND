/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './High/index';
export * from './Low/index';
export * from './HD/index';
export * from './Ultra-Low/index';
export * from './Very_Low/index';
export * from './Medium-Low/index';
export * from './SD/index';
export * from './Medium-High/index';
export * from './Very-High/index';
export * from './Ultra-High/index';
export * from './2K/index';
export * from './4K/index';
export * from './8K/index';
export * from './16K/index';
export * from './32K/index';
export * from './64K/index';
export * from './128K/index';
export * from './256K/index';
export * from './512K/index';
export * from './1024K/index';
export * from './2048K/index';
export * from './4096K/index';
export * from './8192K/index';

import { HighResolution } from './High/index';
import { LowResolution } from './Low/index';
import { HDVisualsModule } from './HD/index';
import { UltraLowResolution } from './Ultra-Low/index';
import { VeryLowResolution } from './Very_Low/index';
import { MediumLowResolution } from './Medium-Low/index';
import { SDResolution } from './SD/index';
import { MediumHighResolution } from './Medium-High/index';
import { VeryHighResolution } from './Very-High/index';
import { UltraHighResolution } from './Ultra-High/index';
import { Res2KResolution } from './2K/index';
import { Res4KResolution } from './4K/index';
import { Res8KResolution } from './8K/index';
import { Res16KResolution } from './16K/index';
import { Res32KResolution } from './32K/index';
import { Res64KResolution } from './64K/index';
import { Res128KResolution } from './128K/index';
import { Res256KResolution } from './256K/index';
import { Res512KResolution } from './512K/index';
import { Res1024KResolution } from './1024K/index';
import { Res2048KResolution } from './2048K/index';
import { Res4096KResolution } from './4096K/index';
import { Res8192KResolution } from './8192K/index';

export interface ResolutionProfile {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  pixelScale: number;
  isAuthenticRetro: boolean;
}

export interface DynamicViewportMetrics {
  renderWidth: number;
  renderHeight: number;
  displayWidth: number;
  displayHeight: number;
  aspectRatio: number;
  virtualScaleX: number;
  virtualScaleY: number;
  uniformSpriteScale: number;
  pixelBudgetUsed: number;
}

export const RESOLUTION_PROFILES: Record<string, ResolutionProfile> = {
  RETRO_PIXEL: { name: 'Authentic 2D Pixelation', width: 320, height: 180, aspectRatio: 16 / 9, pixelScale: 1.0, isAuthenticRetro: true },
  ULTRA_LOW:   { name: 'Ultra-Low', width: UltraLowResolution.width, height: UltraLowResolution.height, aspectRatio: 16 / 9, pixelScale: 0.5, isAuthenticRetro: true },
  VERY_LOW:    { name: 'Very_Low', width: VeryLowResolution.width, height: VeryLowResolution.height, aspectRatio: 16 / 9, pixelScale: 0.8, isAuthenticRetro: true },
  MEDIUM_LOW:  { name: 'Medium-Low', width: MediumLowResolution.width, height: MediumLowResolution.height, aspectRatio: 16 / 9, pixelScale: 1.5, isAuthenticRetro: true },
  LOW:         { name: 'Low Standard Definition', width: LowResolution.width, height: LowResolution.height, aspectRatio: 16 / 9, pixelScale: 2.0, isAuthenticRetro: false },
  SD:          { name: 'SD', width: SDResolution.width, height: SDResolution.height, aspectRatio: 16 / 9, pixelScale: 2.0, isAuthenticRetro: false },
  MEDIUM_HIGH: { name: 'Medium-High', width: MediumHighResolution.width, height: MediumHighResolution.height, aspectRatio: 16 / 9, pixelScale: 3.0, isAuthenticRetro: false },
  VERY_HIGH:   { name: 'Very-High', width: VeryHighResolution.width, height: VeryHighResolution.height, aspectRatio: 16 / 9, pixelScale: 4.0, isAuthenticRetro: false },
  ULTRA_HIGH:  { name: 'Ultra-High', width: UltraHighResolution.width, height: UltraHighResolution.height, aspectRatio: 16 / 9, pixelScale: 5.0, isAuthenticRetro: false },
  HD:          { name: 'HD 1080p', width: HDVisualsModule.width, height: HDVisualsModule.height, aspectRatio: 16 / 9, pixelScale: 6.0, isAuthenticRetro: false },
  HIGH:        { name: 'High Definition', width: HighResolution.width, height: HighResolution.height, aspectRatio: 16 / 9, pixelScale: 6.0, isAuthenticRetro: false },
  RES_2K:      { name: '2K', width: Res2KResolution.width, height: Res2KResolution.height, aspectRatio: 16 / 9, pixelScale: 6.4, isAuthenticRetro: false },
  RES_4K:      { name: '4K', width: Res4KResolution.width, height: Res4KResolution.height, aspectRatio: 16 / 9, pixelScale: 12.0, isAuthenticRetro: false },
  RES_8K:      { name: '8K', width: Res8KResolution.width, height: Res8KResolution.height, aspectRatio: 16 / 9, pixelScale: 24.0, isAuthenticRetro: false },
  RES_16K:     { name: '16K', width: Res16KResolution.width, height: Res16KResolution.height, aspectRatio: 16 / 9, pixelScale: 48.0, isAuthenticRetro: false },
  RES_32K:     { name: '32K', width: Res32KResolution.width, height: Res32KResolution.height, aspectRatio: 16 / 9, pixelScale: 96.0, isAuthenticRetro: false },
  RES_64K:     { name: '64K', width: Res64KResolution.width, height: Res64KResolution.height, aspectRatio: 16 / 9, pixelScale: 204.8, isAuthenticRetro: false },
  RES_128K:    { name: '128K', width: Res128KResolution.width, height: Res128KResolution.height, aspectRatio: 16 / 9, pixelScale: 409.6, isAuthenticRetro: false },
  RES_256K:    { name: '256K', width: Res256KResolution.width, height: Res256KResolution.height, aspectRatio: 16 / 9, pixelScale: 819.2, isAuthenticRetro: false },
  RES_512K:    { name: '512K', width: Res512KResolution.width, height: Res512KResolution.height, aspectRatio: 16 / 9, pixelScale: 1638.4, isAuthenticRetro: false },
  RES_1024K:   { name: '1024K', width: Res1024KResolution.width, height: Res1024KResolution.height, aspectRatio: 16 / 9, pixelScale: 3276.8, isAuthenticRetro: false },
  RES_2048K:   { name: '2048K', width: Res2048KResolution.width, height: Res2048KResolution.height, aspectRatio: 16 / 9, pixelScale: 6553.6, isAuthenticRetro: false },
  RES_4096K:   { name: '4096K', width: Res4096KResolution.width, height: Res4096KResolution.height, aspectRatio: 16 / 9, pixelScale: 13107.2, isAuthenticRetro: false },
  RES_8192K:   { name: '8192K', width: Res8192KResolution.width, height: Res8192KResolution.height, aspectRatio: 16 / 9, pixelScale: 26214.4, isAuthenticRetro: false }
};

/**
 * Full Mathematical Resolution & Dynamic Viewport Projection Engine.
 * Supports any physical container size while enforcing virtualized VRAM/CPU pixel budgets.
 */
export const ResolutionModule = {
  current: 'RETRO_PIXEL',
  aspectRatio: '16:9',
  profiles: RESOLUTION_PROFILES,
  tiers: [
    UltraLowResolution,
    VeryLowResolution,
    MediumLowResolution,
    SDResolution,
    MediumHighResolution,
    VeryHighResolution,
    UltraHighResolution,
    HDVisualsModule,
    Res2KResolution,
    Res4KResolution,
    Res8KResolution,
    Res16KResolution,
    Res32KResolution,
    Res64KResolution,
    Res128KResolution,
    Res256KResolution,
    Res512KResolution,
    Res1024KResolution,
    Res2048KResolution,
    Res4096KResolution,
    Res8192KResolution
  ],

  /**
   * Computes exact aspect-preserving container fit dimensions.
   */
  calculateFitDimensions(containerWidth: number, containerHeight: number, targetRatio: number = 16 / 9): { width: number; height: number; scale: number } {
    if (containerWidth <= 0 || containerHeight <= 0) {
      return { width: 320, height: 180, scale: 1 };
    }
    const currentRatio = containerWidth / containerHeight;
    let width: number;
    let height: number;

    if (currentRatio > targetRatio) {
      height = Math.floor(containerHeight);
      width = Math.floor(containerHeight * targetRatio);
    } else {
      width = Math.floor(containerWidth);
      height = Math.floor(containerWidth / targetRatio);
    }

    return { width: Math.max(160, width), height: Math.max(90, height), scale: width / 320 };
  },

  /**
   * Dynamically projects ANY screen size onto a mathematically bounded internal rasterizer buffer.
   * Preserves exact world FOV and undistorted character proportions across arbitrary aspect ratios.
   */
  calculateDynamicViewport(
    containerWidth: number,
    containerHeight: number,
    maxPhysicalPixels: number = 129600, // 480x270 (~506 KiB) crisp pixel ceiling reduces RAM & CPU load by 43.75%
    qualityScale: number = 1.0
  ): DynamicViewportMetrics {
    const safeW = Math.max(120, Math.floor(containerWidth));
    const safeH = Math.max(90, Math.floor(containerHeight));
    const aspectRatio = safeW / safeH;

    const minPixels = 38400; // ~260x148 minimum legible retro floor
    const clampedCap = Math.min(maxPhysicalPixels, safeW * safeH);
    const targetPixels = Math.max(minPixels, clampedCap * Math.max(0.5, Math.min(1.0, qualityScale)));
    let renderHeight = Math.max(120, Math.floor(Math.sqrt(targetPixels / aspectRatio)));
    let renderWidth = Math.max(160, Math.floor(renderHeight * aspectRatio));

    // Align width/height to even boundaries and clamp strictly inside maxPhysicalPixels slab
    renderWidth = renderWidth & ~1;
    renderHeight = renderHeight & ~1;
    while (renderWidth * renderHeight > maxPhysicalPixels && renderHeight > 90 && renderWidth > 120) {
      renderHeight = (renderHeight - 2) & ~1;
      renderWidth = Math.max(120, Math.floor(renderHeight * aspectRatio) & ~1);
    }

    return {
      renderWidth,
      renderHeight,
      displayWidth: safeW,
      displayHeight: safeH,
      aspectRatio,
      virtualScaleX: renderWidth / 320,
      virtualScaleY: renderHeight / 180,
      uniformSpriteScale: Math.min(renderHeight / 180, renderWidth / 220),
      pixelBudgetUsed: renderWidth * renderHeight
    };
  },

  getActiveResolution(profileKey: string = 'RETRO_PIXEL'): ResolutionProfile {
    return RESOLUTION_PROFILES[profileKey] || RESOLUTION_PROFILES.RETRO_PIXEL;
  }
};

export default ResolutionModule;
