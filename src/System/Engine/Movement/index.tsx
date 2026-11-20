/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorldRegistry } from '../../Registry/Building_Blocks/World/index';
import { TempleMazeData, isTempleWallAt } from '../../UI/Play_Area/templeMaze';
import { TrigLUT } from '../Mathematics/LUT/Trig';
import { GeometryModule } from '../Mathematics/Geometry/index';

export * from './General/index';
export * from './Collision/index';

export interface MovementAttemptParams {
  currentX: number;
  currentY: number;
  nextX: number;
  nextY: number;
  room: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE';
  templeMaze: TempleMazeData;
}

export interface MovementAttemptResult {
  allowed: boolean;
  transition: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE' | null;
  rx: number;
  ry: number;
}

/**
 * High-Precision Deterministic Movement & Spatial Collision Engine.
 * Built with Continuous Collision Detection (CCD) ray-marching driven directly by WorldRegistry constants.
 * Room dimensions handled with absolute mathematical precision:
 * - Foyer: 800 x 800
 * - Garden: 800 x 800
 * - Porch: 800 x 200
 * - Temple: 2000 x 2000
 */
export const MovementEngine = {
  calculateForward: (x: number, y: number, angleDeg: number, distance: number) => {
    return {
      x: x + TrigLUT.cos(angleDeg) * distance,
      y: y + TrigLUT.sin(angleDeg) * distance
    };
  },

  /**
   * Evaluates spatial room transitions, boundary limits, and CCD obstacle physics.
   */
  tryMove: (params: MovementAttemptParams): MovementAttemptResult => {
    const { currentX, currentY, nextX, nextY, room, templeMaze } = params;
    const currentRoomData = WorldRegistry.rooms[room];
    const currentSizeX = currentRoomData.width;
    const currentSizeY = currentRoomData.height;
    const doorMinX = currentRoomData.doorCenterX - currentRoomData.doorHalfWidth;
    const doorMaxX = currentRoomData.doorCenterX + currentRoomData.doorHalfWidth;
    const wallMargin = 12;

    if (room === 'TEMPLE') {
      // Continuous Collision Detection (CCD) ray-marching across stone masonry walls
      const distSq = GeometryModule.distanceSq2D(currentX, currentY, nextX, nextY);
      const steps = distSq > 0 ? Math.max(1, Math.ceil(Math.sqrt(distSq) / 0.35)) : 1;
      const invSteps = 1.0 / steps;
      const deltaX = nextX - currentX;
      const deltaY = nextY - currentY;

      for (let s = 1; s <= steps; s++) {
        const t = s * invSteps;
        if (isTempleWallAt(currentX + deltaX * t, currentY + deltaY * t, templeMaze)) {
          return { allowed: false, transition: null, rx: nextX, ry: nextY };
        }
      }

      // Temple exit gate centered on North end (doorCenterX ± doorHalfWidth, Y < 12)
      if (nextY < wallMargin && nextX >= doorMinX && nextX <= doorMaxX) {
        return {
          allowed: true,
          transition: 'PORCH',
          rx: WorldRegistry.rooms.PORCH.doorCenterX,
          ry: WorldRegistry.rooms.PORCH.height - 15
        };
      }

      // Boundary check for Temple of Hayana (12ft safety margin)
      if (nextX >= wallMargin && nextX <= currentSizeX - wallMargin && nextY >= wallMargin && nextY <= currentSizeY - wallMargin) {
        return { allowed: true, transition: null, rx: nextX, ry: nextY };
      }
      return { allowed: false, transition: null, rx: nextX, ry: nextY };
    }

    // Normal bounds within the active room
    if (nextX >= wallMargin && nextX <= currentSizeX - wallMargin && nextY >= wallMargin && nextY <= currentSizeY - wallMargin) {
      return { allowed: true, transition: null, rx: nextX, ry: nextY };
    }

    // Centered north/south doors (doorCenterX ± doorHalfWidth from WorldRegistry)
    if (nextX >= doorMinX && nextX <= doorMaxX) {
      // FOYER Transitions
      if (room === 'FOYER') {
        if (nextY < wallMargin) {
          return { allowed: true, transition: 'GARDEN', rx: nextX, ry: WorldRegistry.rooms.GARDEN.height - 15 };
        }
        if (nextY > currentSizeY - wallMargin) {
          return { allowed: true, transition: 'PORCH', rx: nextX, ry: 15 };
        }
      }
      // GARDEN Transitions (Garden is North of Foyer, south gate goes to Foyer north)
      if (room === 'GARDEN' && nextY > currentSizeY - wallMargin) {
        return { allowed: true, transition: 'FOYER', rx: nextX, ry: 15 };
      }
      // PORCH Transitions (Porch is South of Foyer, north gate goes to Foyer south, south gate goes to Temple)
      if (room === 'PORCH') {
        if (nextY < wallMargin) {
          return { allowed: true, transition: 'FOYER', rx: nextX, ry: WorldRegistry.rooms.FOYER.height - 15 };
        }
        if (nextY > currentSizeY - wallMargin) {
          return { allowed: true, transition: 'TEMPLE', rx: WorldRegistry.rooms.TEMPLE.doorCenterX, ry: 15 };
        }
      }
    }

    return { allowed: false, transition: null, rx: nextX, ry: nextY };
  }
};

export default MovementEngine;
