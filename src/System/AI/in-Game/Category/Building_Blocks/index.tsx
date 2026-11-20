/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/AI/in-Game/Category/Building_Blocks/index.tsx
 * Building Blocks AI Intelligence Engine.
 * Calibrated for exact [0, widthFeet] x [0, lengthFeet] WorldRegistry geometry,
 * 40ft SpatialHashIndexer bucket bounds, material friction/acoustics, and frustum LOD scoring.
 */

import { Position } from '@/src/types';
import { WorldRegistry } from '../../../../Registry/Building_Blocks/World/index';
import { FlooringBuildingBlocks } from '../../../../Building_Blocks/Flooring/index';

export interface SpatialBoundaryAnalysis {
  roomDimensions: { widthFeet: number; lengthFeet: number };
  distancesToWallsFeet: { north: number; east: number; south: number; west: number };
  nearestWallDistanceFeet: number;
  nearestWallDirection: string;
  isWithinSafeCenterZone: boolean;
  clearanceVector: { dx: number; dy: number };
}

export interface BuildingBlockAITelemetry extends SpatialBoundaryAnalysis {
  spatialBucketX: number;
  spatialBucketY: number;
  spatialBucketSizeFeet: number;
  activeFloorMaterialId: string;
  surfaceFriction: number;
  portalAlignmentOffsetFeet: number;
  recommendedLodTier: 0 | 1 | 2;
}

const SPATIAL_BUCKET_SIZE_FEET = 40; // Matches SpatialHashIndexer & Foyer floor tile geometry

/**
 * Building Blocks AI Intelligence Engine.
 * Calculates exact spatial geometry, 40ft spatial hash bucket coordinates,
 * and surface physical properties with zero-allocation *Into kernels.
 */
export const InGameAIBuildingBlocksCategoryEngine = {
  /**
   * Evaluates spatial geometry for the active room layout in [0, width] x [0, height].
   * Y = 0 corresponds to the North perimeter (Garden portal), Y = height to the South perimeter.
   */
  evaluateSpatialGeometry: (params: {
    position: Position;
    activeRoom: 'FOYER' | 'PORCH' | 'GARDEN' | 'TEMPLE';
  }): SpatialBoundaryAnalysis => {
    const out: SpatialBoundaryAnalysis = {
      roomDimensions: { widthFeet: 800, lengthFeet: 800 },
      distancesToWallsFeet: { north: 0, east: 0, south: 0, west: 0 },
      nearestWallDistanceFeet: 0,
      nearestWallDirection: 'North Wall',
      isWithinSafeCenterZone: false,
      clearanceVector: { dx: 0, dy: 0 }
    };
    return InGameAIBuildingBlocksCategoryEngine.evaluateSpatialGeometryInto(
      out,
      params.position.x,
      params.position.y,
      params.activeRoom
    );
  },

  /**
   * Zero-allocation spatial boundary solver writing directly into caller-owned buffer.
   */
  evaluateSpatialGeometryInto: (
    out: SpatialBoundaryAnalysis,
    posX: number,
    posY: number,
    activeRoom: 'FOYER' | 'PORCH' | 'GARDEN' | 'TEMPLE'
  ): SpatialBoundaryAnalysis => {
    const roomSpec = WorldRegistry.rooms[activeRoom] || WorldRegistry.rooms.FOYER;
    const widthFeet = roomSpec.width;
    const lengthFeet = roomSpec.height;

    const northDist = Math.max(0, posY);
    const southDist = Math.max(0, lengthFeet - posY);
    const westDist = Math.max(0, posX);
    const eastDist = Math.max(0, widthFeet - posX);

    let minDist = northDist;
    let minDir = 'North Wall';
    if (eastDist < minDist) { minDist = eastDist; minDir = 'East Wall'; }
    if (southDist < minDist) { minDist = southDist; minDir = 'South Wall'; }
    if (westDist < minDist) { minDist = westDist; minDir = 'West Wall'; }

    out.roomDimensions.widthFeet = widthFeet;
    out.roomDimensions.lengthFeet = lengthFeet;
    out.distancesToWallsFeet.north = Math.round(northDist * 100) / 100;
    out.distancesToWallsFeet.east = Math.round(eastDist * 100) / 100;
    out.distancesToWallsFeet.south = Math.round(southDist * 100) / 100;
    out.distancesToWallsFeet.west = Math.round(westDist * 100) / 100;
    out.nearestWallDistanceFeet = Math.round(minDist * 100) / 100;
    out.nearestWallDirection = minDir;
    out.isWithinSafeCenterZone = minDist > 100;
    out.clearanceVector.dx = Math.round((eastDist - westDist) * 100) / 100;
    out.clearanceVector.dy = Math.round((southDist - northDist) * 100) / 100;
    return out;
  },

  /**
   * Zero-allocation calibrated Building Blocks AI telemetry solver combining:
   * - Exact world-coordinate wall clearances
   * - 40ft spatial hash bucket quantization (O(1) SpatialHashIndexer compatibility)
   * - Active FlooringBuildingBlocks friction & LOD tier
   */
  evaluateRoomBuildingBlockTelemetryInto: (
    out: BuildingBlockAITelemetry,
    posX: number,
    posY: number,
    activeRoom: 'FOYER' | 'PORCH' | 'GARDEN' | 'TEMPLE'
  ): BuildingBlockAITelemetry => {
    InGameAIBuildingBlocksCategoryEngine.evaluateSpatialGeometryInto(out, posX, posY, activeRoom);

    const roomSpec = WorldRegistry.rooms[activeRoom] || WorldRegistry.rooms.FOYER;
    out.spatialBucketSizeFeet = SPATIAL_BUCKET_SIZE_FEET;
    out.spatialBucketX = Math.floor(posX / SPATIAL_BUCKET_SIZE_FEET);
    out.spatialBucketY = Math.floor(posY / SPATIAL_BUCKET_SIZE_FEET);
    out.portalAlignmentOffsetFeet = Math.round((posX - roomSpec.doorCenterX) * 100) / 100;

    if (activeRoom === 'GARDEN') {
      out.activeFloorMaterialId = FlooringBuildingBlocks.Ground.id;
      out.surfaceFriction = FlooringBuildingBlocks.Ground.friction;
    } else if (activeRoom === 'PORCH') {
      out.activeFloorMaterialId = FlooringBuildingBlocks.Wooden.id;
      out.surfaceFriction = FlooringBuildingBlocks.Wooden.friction;
    } else if (activeRoom === 'TEMPLE') {
      out.activeFloorMaterialId = FlooringBuildingBlocks.Stone.id;
      out.surfaceFriction = FlooringBuildingBlocks.Stone.friction;
    } else {
      out.activeFloorMaterialId = FlooringBuildingBlocks.TileCeramic.id;
      out.surfaceFriction = FlooringBuildingBlocks.TileCeramic.friction;
    }

    // Distance-calibrated Level-of-Detail tier for architectural shading
    if (out.nearestWallDistanceFeet < 60) {
      out.recommendedLodTier = 0; // High detail
    } else if (out.nearestWallDistanceFeet < 180) {
      out.recommendedLodTier = 1; // Medium detail
    } else {
      out.recommendedLodTier = 2; // Horizon batch detail
    }

    return out;
  }
};

export default InGameAIBuildingBlocksCategoryEngine;
