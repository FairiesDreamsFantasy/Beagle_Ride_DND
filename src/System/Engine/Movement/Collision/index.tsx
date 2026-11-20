/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
import { WorldRegistry } from '../../../Registry/Building_Blocks/World/index';

export const CollisionEngine = {
  checkBounds: (
    x: number,
    y: number,
    minX = 0,
    maxX = WorldRegistry.rooms.FOYER.width,
    minY = 0,
    maxY = WorldRegistry.rooms.FOYER.height
  ) => {
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }
};
