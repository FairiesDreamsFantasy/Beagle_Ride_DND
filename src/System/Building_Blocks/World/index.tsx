/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/World/index.tsx
 * World Environment Building Blocks Entry Point (including Sky/ submodule).
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './Sky/index';
import { BlockAnimationColorPalette } from '../Animations/Color_Palette/index';

export const WorldPhysics = {
  mass: 1.0,
  friction: 0.5,
  collisionOpacity: 1.0,
  gravityFtPerSecSq: 32.174,
  getPhysicalProperties: () => ({ mass: 1.0, friction: 0.5, collisionOpacity: 1.0 }),

  /**
   * Evaluates daytime Garden cerulean sky scanline gradient color (constant per scanline row sy).
   */
  evaluateDaylightSkyColor32(sy: number, safeHorizon: number): number {
    const rawFactor = sy / safeHorizon;
    const skyFactor = rawFactor < 0 ? 0 : (rawFactor > 1 ? 1 : rawFactor);
    const r = (100 + 140 * skyFactor) | 0;
    const g = (140 + 90 * skyFactor) | 0;
    const b = (220 + 35 * skyFactor) | 0;
    return BlockAnimationColorPalette.pack32(r, g, b, 255);
  }
};

export default WorldPhysics;
