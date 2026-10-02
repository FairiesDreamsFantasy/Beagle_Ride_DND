/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorldRegistry } from '../../Registry/Building_Blocks/World/index';
import { TempleMazeData, isTempleWallAt } from '../../UI/Play_Area/templeMaze';

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
 * Built with Continuous Collision Detection (CCD) ray-marching to prevent quantum tunneling.
 * Room dimensions handled with absolute mathematical precision:
 * - Foyer: 800 x 800
 * - Garden: 800 x 800
 * - Porch: 800 x 200
 * - Temple: 2000 x 2000
 */
export const MovementEngine = {
  calculateForward: (x: number, y: number, angleRad: number, distance: number) => {
    return {
      x: x + Math.cos(angleRad) * distance,
      y: y + Math.sin(angleRad) * distance
    };
  },

  /**
   * Evaluates spatial room transitions, boundary limits, and CCD obstacle physics.
   */
  tryMove: (params: MovementAttemptParams): MovementAttemptResult => {
    const { currentX, currentY, nextX, nextY, room, templeMaze } = params;
    const currentRoomData = (WorldRegistry.rooms as any)[room];
    const currentSizeX = currentRoomData.width;
    const currentSizeY = currentRoomData.height;

    if (room === 'TEMPLE') {
      // Continuous Collision Detection (CCD) ray-marching across stone masonry walls
      const dist = Math.hypot(nextX - currentX, nextY - currentY);
      const steps = Math.max(1, Math.ceil(dist / 0.35));
      for (let s = 1; s <= steps; s++) {
        const tx = currentX + (nextX - currentX) * (s / steps);
        const ty = currentY + (nextY - currentY) * (s / steps);
        if (isTempleWallAt(tx, ty, templeMaze)) {
          return { allowed: false, transition: null, rx: nextX, ry: nextY };
        }
      }
      // Temple exit gate centered on North end (X: [995, 1005], Y < 12)
      if (nextY < 12 && nextX >= 995 && nextX <= 1005) {
        return { allowed: true, transition: 'PORCH', rx: 400, ry: 185 };
      }
      // Boundary check for Temple of Hayana (12ft safety margin)
      if (nextX >= 12 && nextX <= currentSizeX - 12 && nextY >= 12 && nextY <= currentSizeY - 12) {
        return { allowed: true, transition: null, rx: nextX, ry: nextY };
      }
      return { allowed: false, transition: null, rx: nextX, ry: nextY };
    }

    // Normal bounds within the active room
    if (nextX >= 12 && nextX <= currentSizeX - 12 && nextY >= 12 && nextY <= currentSizeY - 12) {
      return { allowed: true, transition: null, rx: nextX, ry: nextY };
    }

    // Centered north/south doors (10 feet wide, between X: 395 and 405)
    if (nextX >= 395 && nextX <= 405) {
      // FOYER Transitions
      if (room === 'FOYER') {
        if (nextY < 12) { // Transition North to Garden
          return { allowed: true, transition: 'GARDEN', rx: nextX, ry: 785 };
        }
        if (nextY > 788) { // Transition South to Porch
          return { allowed: true, transition: 'PORCH', rx: nextX, ry: 15 };
        }
      }
      // GARDEN Transitions (Garden is North of Foyer, so its south gate goes to Foyer north)
      if (room === 'GARDEN' && nextY > currentSizeY - 12) {
        return { allowed: true, transition: 'FOYER', rx: nextX, ry: 15 };
      }
      // PORCH Transitions (Porch is South of Foyer, so its north gate goes to Foyer south)
      if (room === 'PORCH') {
        if (nextY < 12) {
          return { allowed: true, transition: 'FOYER', rx: nextX, ry: 785 };
        }
        if (nextY > currentSizeY - 12) { // South gate centered leads to Temple of Hayana!
          return { allowed: true, transition: 'TEMPLE', rx: 1000, ry: 15 };
        }
      }
    }

    return { allowed: false, transition: null, rx: nextX, ry: nextY };
  }
};

export default MovementEngine;
