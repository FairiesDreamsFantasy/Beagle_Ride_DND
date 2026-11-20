/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Obstacle/index.tsx
 * Obstacles Building Blocks Module: Statues, Fountain Bases, Topiary Planters, Pedestals, and Barriers.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface ObstacleBlockSpecs {
  readonly id: string;
  readonly name: string;
  readonly radiusFeet: number;
  readonly heightFeet: number;
  readonly massKg: number;
  readonly restitution: number;
  readonly baseColor32: number;
}

export const ObstaclePhysics = {
  mass: 1.0,
  friction: 0.5,
  collisionOpacity: 1.0,
  getPhysicalProperties: () => ({ mass: 1.0, friction: 0.5, collisionOpacity: 1.0 }),

  evaluateCircleCollision(px: number, py: number, playerRadius: number, ox: number, oy: number, obsRadius: number): boolean {
    const dx = px - ox;
    const dy = py - oy;
    const minSep = playerRadius + obsRadius;
    return (dx * dx + dy * dy) < (minSep * minSep);
  },

  evaluateAABBCollision(px: number, py: number, playerRadius: number, minX: number, minY: number, maxX: number, maxY: number): boolean {
    const closestX = px < minX ? minX : (px > maxX ? maxX : px);
    const closestY = py < minY ? minY : (py > maxY ? maxY : py);
    const dx = px - closestX;
    const dy = py - closestY;
    return (dx * dx + dy * dy) < (playerRadius * playerRadius);
  }
};

export const ObstacleBuildingBlocks = {
  GardenStatue: {
    id: 'OBS_GARDEN_STATUE',
    name: 'Carved Marble Hound Statue',
    radiusFeet: 3.5,
    heightFeet: 7.0,
    massKg: 420.0,
    restitution: 0.15,
    baseColor32: 0xFFDCE6F0
  },
  FountainBasin: {
    id: 'OBS_FOUNTAIN_BASIN',
    name: 'Circular Courtyard Water Fountain',
    radiusFeet: 12.0,
    heightFeet: 4.5,
    massKg: 2400.0,
    restitution: 0.10,
    baseColor32: 0xFFB8D4E8
  },
  TopiaryPlanter: {
    id: 'OBS_TOPIARY_PLANTER',
    name: 'Geometric Boxwood Topiary Urn',
    radiusFeet: 2.5,
    heightFeet: 5.5,
    massKg: 145.0,
    restitution: 0.25,
    baseColor32: 0xFF1B4E2B
  },
  StonePedestal: {
    id: 'OBS_STONE_PEDESTAL',
    name: 'Chiseled Sanctuary Stone Pedestal',
    radiusFeet: 2.0,
    heightFeet: 4.0,
    massKg: 310.0,
    restitution: 0.12,
    baseColor32: 0xFF4A5567
  }
};

export default ObstacleBuildingBlocks;
