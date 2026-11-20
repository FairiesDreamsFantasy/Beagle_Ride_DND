/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * House/Foyer/index.tsx
 * Scientific Geometry, Glazed Ceramic Tile Shader, & Portal Thresholds for House/Foyer/.
 * Grounded in WorldRegistry (800x800x30ft, 40ft floor tiles, 80ft ceiling coffers).
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { WorldRegistry } from '../../System/Registry/Building_Blocks/World/index';
import { BlockTexturePalette } from '../../System/Building_Blocks/Animations/Color_Palette/Texture_Palette/index';
import { BlockPatternPalette } from '../../System/Building_Blocks/Animations/Color_Palette/Pattern_Palette/index';
import { FlooringBuildingBlocks } from '../../System/Building_Blocks/Flooring/index';
import { CeilingPhysics } from '../../System/Building_Blocks/Ceiling/index';
import { DoorPhysics } from '../../System/Building_Blocks/Door/index';
import { WallAndBarrierBuildingBlocks } from '../../System/Building_Blocks/Wall_and_Barrier/index';
import { FoyerAnimations } from './Animations/index';

const FOYER_SPECS = WorldRegistry.rooms.FOYER;
const GARDEN_SPECS = WorldRegistry.rooms.GARDEN;
const PORCH_SPECS = WorldRegistry.rooms.PORCH;

export const Foyer = {
  room: 'FOYER' as const,
  lighting: 'SOFT' as const,
  zone: 'INDOOR' as const,
  specs: FOYER_SPECS,
  flooring: FlooringBuildingBlocks.TileCeramic,
  ceiling: CeilingPhysics,
  animations: FoyerAnimations,
  fogColor: { r: 18, g: 22, b: 28 } as const,

  /**
   * Zero-allocation Foyer Mode-7 scanline pixel evaluator delegating to Building_Blocks.
   */
  evaluateScanlinePixel32(
    rx: number,
    ry: number,
    isFloor: boolean,
    isDoorGap: boolean,
    sy: number,
    horizon: number,
    gardenLintelDrop: number
  ): number {
    if (rx < 0 || rx > FOYER_SPECS.width || ry < 0 || ry > FOYER_SPECS.height) {
      if (ry < 0 && isDoorGap) {
        if (isFloor) {
          return BlockPatternPalette.isAlternateTile(rx, ry, GARDEN_SPECS.floorTileSize)
            ? BlockTexturePalette.GARDEN_GRASS_PRIMARY
            : BlockTexturePalette.GARDEN_GRASS_ALT;
        }
        return DoorPhysics.evaluateLintelColor32(sy, horizon, gardenLintelDrop, BlockTexturePalette.FOYER_NORTH_LINTEL);
      }
      if (ry > FOYER_SPECS.height && isDoorGap) {
        if (isFloor) {
          return BlockPatternPalette.isAlternatePlank(ry - FOYER_SPECS.height, PORCH_SPECS.floorTileSize)
            ? BlockTexturePalette.PORCH_PLANK_LIGHT
            : BlockTexturePalette.PORCH_PLANK_DARK;
        }
        return BlockTexturePalette.WALL_BASE_DARK;
      }
      return WallAndBarrierBuildingBlocks.evaluateFoyerBorderColor32(rx, ry);
    }

    if (isFloor) {
      const tileSize = FOYER_SPECS.floorTileSize;
      const isBlueTile = BlockPatternPalette.isAlternateTile(rx, ry, tileSize);
      const isSeam = BlockPatternPalette.isTileSeam(rx, ry, tileSize, 1.2);
      if (isBlueTile) {
        return isSeam ? BlockTexturePalette.FOYER_TILE_BLUE_BEVEL : BlockTexturePalette.FOYER_TILE_BLUE;
      }
      return isSeam ? BlockTexturePalette.FOYER_TILE_GREEN_BEVEL : BlockTexturePalette.FOYER_TILE_GREEN;
    }

    return CeilingPhysics.evaluateFoyerCeilingColor32(rx, ry, FOYER_SPECS.ceilingTileSize);
  }
};

export default Foyer;
