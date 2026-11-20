/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Building_Blocks/Plant/index.tsx
 * Botanical Building Blocks Module: Hedges, Flowers, Bushes, Grass, Trees, Shrubs, and Vines.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { GeometryModule } from '../../Engine/Mathematics/Geometry/index';

export interface PlantBlockSpecs {
  readonly id: string;
  readonly name: string;
  readonly category: 'HEDGE' | 'FLOWER' | 'BUSH' | 'GRASS' | 'TREE' | 'SHRUB' | 'VINE';
  readonly heightFeet: number;
  readonly collisionRadius: number;
  readonly baseColor32: number;
}

export const PlantBuildingBlocks = {
  Hedge: {
    id: 'HEDGE_STANDARD',
    name: 'Pruned Boxwood Hedge',
    category: 'HEDGE' as const,
    heightFeet: 6.0,
    collisionRadius: 2.0,
    baseColor32: 0xFF1B4E2B,
    evaluateDensity(tx: number, ty: number): number {
      return GeometryModule.spatialHash2D(tx, ty) > 0.2 ? 1.0 : 0.85;
    }
  },
  Flower: {
    id: 'FLOWER_GARDEN',
    name: 'Blooming Meadow Floral Cluster',
    category: 'FLOWER' as const,
    heightFeet: 1.5,
    collisionRadius: 0.5,
    baseColor32: 0xFFC286FF,
    evaluatePetalHarmonics(angleRad: number): number {
      return Math.sin(angleRad * 5.0) * 0.2 + 1.0;
    }
  },
  Bush: {
    id: 'BUSH_ROUND',
    name: 'Ornamental Greenery Bush',
    category: 'BUSH' as const,
    heightFeet: 3.5,
    collisionRadius: 1.5,
    baseColor32: 0xFF2D8A4E,
    evaluateVolume(x: number, y: number, r: number): boolean {
      return (x * x + y * y) <= (r * r);
    }
  },
  Grass: {
    id: 'GRASS_MEADOW',
    name: 'Lush Green Grass Turf',
    category: 'GRASS' as const,
    heightFeet: 0.4,
    collisionRadius: 0.1,
    baseColor32: 0xFF3CB063,
    evaluateShade(tx: number, ty: number): number {
      const hash = GeometryModule.spatialHash2D(tx, ty);
      return 0.9 + hash * 0.2;
    }
  },
  Tree: {
    id: 'TREE_OAK',
    name: 'Majestic Oak Canopy Tree',
    category: 'TREE' as const,
    heightFeet: 28.0,
    collisionRadius: 4.5,
    baseColor32: 0xFF143B20,
    evaluateCanopyRadius(height: number): number {
      return Math.max(0, 12.0 * (1.0 - height / 28.0));
    }
  },
  Shrub: {
    id: 'SHRUB_DWARF',
    name: 'Dwarf Garden Shrub',
    category: 'SHRUB' as const,
    heightFeet: 2.0,
    collisionRadius: 1.0,
    baseColor32: 0xFF246B3B,
    evaluateGrowthFactor(age: number): number {
      return Math.min(1.0, age / 365.0);
    }
  },
  Vine: {
    id: 'VINE_IVY',
    name: 'Climbing Stone Wall Ivy',
    category: 'VINE' as const,
    heightFeet: 12.0,
    collisionRadius: 0.3,
    baseColor32: 0xFF0E381A,
    evaluateTendrilCurve(t: number): { x: number; y: number } {
      return { x: Math.sin(t * 3.14) * 0.8, y: t * 12.0 };
    }
  }
};

export default PlantBuildingBlocks;
