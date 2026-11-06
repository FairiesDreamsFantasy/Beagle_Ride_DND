/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

export const CollisionEngine = {
  checkBounds: (x: number, y: number, minX = 40, maxX = 760, minY = 40, maxY = 560) => {
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }
};
