/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * House/Garden/index.tsx
 * Scientific Geometry, Botanical Material Shader, & Sky Row Evaluator for House/Garden/.
 * Grounded in WorldRegistry (800x800ft, 20ft tiles) & System/Building_Blocks.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { WorldRegistry } from '../../System/Registry/Building_Blocks/World/index';
import { GeometryModule } from '../../System/Engine/Mathematics/Geometry/index';
import { BlockTexturePalette } from '../../System/Building_Blocks/Animations/Color_Palette/Texture_Palette/index';
import { BlockPatternPalette } from '../../System/Building_Blocks/Animations/Color_Palette/Pattern_Palette/index';
import { WorldPhysics } from '../../System/Building_Blocks/World/index';
import { WallAndBarrierBuildingBlocks } from '../../System/Building_Blocks/Wall_and_Barrier/index';
import { PlantBuildingBlocks } from '../../System/Building_Blocks/Plant/index';
import { FlooringBuildingBlocks } from '../../System/Building_Blocks/Flooring/index';
import { GardenAnimations } from './Animations/index';

export interface GardenScanlineRunCache {
  lastTx: number;
  lastTy: number;
  lastFloorColor32: number;
}

const GARDEN_SPECS = WorldRegistry.rooms.GARDEN;
const FOYER_SPECS = WorldRegistry.rooms.FOYER;

export const Garden = {
  zone: 'OUTDOOR' as const,
  type: 'FLORAL' as const,
  specs: GARDEN_SPECS,
  flooring: FlooringBuildingBlocks.Ground,
  flora: {
    grass: PlantBuildingBlocks.Grass,
    flower: PlantBuildingBlocks.Flower,
    hedge: PlantBuildingBlocks.Hedge
  },
  animations: GardenAnimations,
  fogColor: { r: 153, g: 194, b: 242 } as const,

  /**
   * Precomputes the cerulean sky scanline color ONCE per scanline row sy (eliminating 480x per-pixel work).
   */
  computeSkyRowColor32(sy: number, safeHorizon: number): number {
    return WorldPhysics.evaluateDaylightSkyColor32(sy, safeHorizon);
  },

  /**
   * Zero-allocation Garden Mode-7 scanline pixel evaluator with per-row spatial hash run-cache.
   */
  evaluateScanlinePixel32(
    rx: number,
    ry: number,
    isFloor: boolean,
    isDoorGap: boolean,
    rowSkyColor32: number,
    runCache: GardenScanlineRunCache
  ): number {
    if (rx < 0 || rx > GARDEN_SPECS.width || ry < 0 || ry > GARDEN_SPECS.height) {
      if (ry > GARDEN_SPECS.height && isDoorGap) {
        if (isFloor) {
          return BlockPatternPalette.isAlternateTile(rx, ry, FOYER_SPECS.floorTileSize)
            ? BlockTexturePalette.FOYER_TILE_BLUE
            : BlockTexturePalette.FOYER_TILE_GREEN;
        }
        return BlockTexturePalette.WALL_BASE_DARK;
      }
      return WallAndBarrierBuildingBlocks.evaluateGardenHedgeColor32(rx, ry);
    }

    if (!isFloor) {
      return rowSkyColor32;
    }

    const tx = Math.floor(rx / GARDEN_SPECS.floorTileSize);
    const ty = Math.floor(ry / GARDEN_SPECS.floorTileSize);
    if (tx !== runCache.lastTx || ty !== runCache.lastTy) {
      runCache.lastTx = tx;
      runCache.lastTy = ty;
      const hashFrac = GeometryModule.spatialHash2D(tx, ty);
      if (hashFrac < 0.05) {
        runCache.lastFloorColor32 = hashFrac < 0.025
          ? BlockTexturePalette.GARDEN_FLOWER_MAGENTA
          : BlockTexturePalette.GARDEN_FLOWER_GOLD;
      } else {
        runCache.lastFloorColor32 = ((tx + ty) & 1) === 0
          ? BlockTexturePalette.GARDEN_GRASS_PRIMARY
          : BlockTexturePalette.GARDEN_GRASS_ALT;
      }
    }
    return runCache.lastFloorColor32;
  }
};

export default Garden;
