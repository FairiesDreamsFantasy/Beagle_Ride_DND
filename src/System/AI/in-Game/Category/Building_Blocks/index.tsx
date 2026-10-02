/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Position } from '@/src/types';

export interface SpatialBoundaryAnalysis {
  roomDimensions: { widthFeet: number; lengthFeet: number };
  distancesToWallsFeet: { north: number; east: number; south: number; west: number };
  nearestWallDistanceFeet: number;
  nearestWallDirection: string;
  isWithinSafeCenterZone: boolean;
  clearanceVector: { dx: number; dy: number };
}

/**
 * Building Blocks AI Intelligence Engine.
 * Calculates exact spatial geometry and boundary proximities with mathematical precision.
 */
export const InGameAIBuildingBlocksCategoryEngine = {
  /**
   * Evaluates spatial geometry for the active room layout.
   */
  evaluateSpatialGeometry: (params: {
    position: Position;
    activeRoom: 'FOYER' | 'PORCH' | 'GARDEN' | 'TEMPLE';
  }): SpatialBoundaryAnalysis => {
    const { position, activeRoom } = params;

    // Room dimension constants grounded in mathematical world specifications
    const roomSpecsMap = {
      FOYER: { widthFeet: 800, lengthFeet: 800 },
      PORCH: { widthFeet: 800, lengthFeet: 200 },
      GARDEN: { widthFeet: 800, lengthFeet: 800 },
      TEMPLE: { widthFeet: 2000, lengthFeet: 2000 }
    };

    const specs = roomSpecsMap[activeRoom] || roomSpecsMap.FOYER;
    const halfW = specs.widthFeet / 2;
    const halfL = specs.lengthFeet / 2;

    const northDist = Math.max(0, halfL - position.y);
    const southDist = Math.max(0, halfL + position.y);
    const eastDist = Math.max(0, halfW - position.x);
    const westDist = Math.max(0, halfW + position.x);

    const wallMap = [
      { name: 'North Wall', dist: northDist },
      { name: 'South Wall', dist: southDist },
      { name: 'East Wall', dist: eastDist },
      { name: 'West Wall', dist: westDist }
    ];

    wallMap.sort((a, b) => a.dist - b.dist);

    const nearestWall = wallMap[0];
    const isWithinSafeCenterZone = nearestWall.dist > 100;

    return {
      roomDimensions: specs,
      distancesToWallsFeet: {
        north: parseFloat(northDist.toFixed(2)),
        east: parseFloat(eastDist.toFixed(2)),
        south: parseFloat(southDist.toFixed(2)),
        west: parseFloat(westDist.toFixed(2))
      },
      nearestWallDistanceFeet: parseFloat(nearestWall.dist.toFixed(2)),
      nearestWallDirection: nearestWall.name,
      isWithinSafeCenterZone,
      clearanceVector: {
        dx: parseFloat((specs.widthFeet - Math.abs(position.x * 2)).toFixed(2)),
        dy: parseFloat((specs.lengthFeet - Math.abs(position.y * 2)).toFixed(2))
      }
    };
  }
};

export default InGameAIBuildingBlocksCategoryEngine;
