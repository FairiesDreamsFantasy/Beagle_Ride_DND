/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Door/index.tsx
 * Singular Door & Portal Threshold Building Block Module.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { BlockTexturePalette } from '../Animations/Color_Palette/Texture_Palette/index';

export const DoorPhysics = {
  mass: 1.0,
  friction: 0.5,
  collisionOpacity: 1.0,
  getPhysicalProperties: () => ({ mass: 1.0, friction: 0.5, collisionOpacity: 1.0 }),

  isWithinDoorwaySpan(rx: number, doorCenterX: number, doorHalfWidth: number): boolean {
    return rx >= doorCenterX - doorHalfWidth && rx <= doorCenterX + doorHalfWidth;
  },

  evaluateLintelColor32(sy: number, horizon: number, lintelDropPx: number, lintelColor32: number): number {
    return sy > horizon - lintelDropPx ? lintelColor32 : BlockTexturePalette.WALL_BASE_DARK;
  }
};

export default DoorPhysics;
