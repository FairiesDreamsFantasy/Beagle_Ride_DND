/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Levels/Temple_Of_Hayana/index.tsx
 * Scientific Geometry, Masonry/Slate Tile Shaders, & Portal Thresholds for Levels/Temple_Of_Hayana/.
 * Grounded in WorldRegistry (2000x2000x15ft, 20ft floor tiles, 40ft coffered ceiling tiles).
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { WorldRegistry } from '../../System/Registry/Building_Blocks/World/index';
import { BlockTexturePalette } from '../../System/Building_Blocks/Animations/Color_Palette/Texture_Palette/index';
import { BlockPatternPalette } from '../../System/Building_Blocks/Animations/Color_Palette/Pattern_Palette/index';
import { CeilingPhysics } from '../../System/Building_Blocks/Ceiling/index';
import { GeometryModule } from '../../System/Engine/Mathematics/Geometry/index';
import { isTempleWallAt, type TempleMazeData } from '../../System/UI/Play_Area/templeMaze';

const TEMPLE_SPECS = WorldRegistry.rooms.TEMPLE;

export interface TempleScanlineRunCache {
  lastStoneX: number;
  lastStoneY: number;
  lastWallColor32: number;
}

export const TempleOfHayana = {
  room: 'TEMPLE' as const,
  zone: 'INDOOR' as const,
  specs: TEMPLE_SPECS,
  fogColor: { r: 16, g: 19, b: 23 } as const,

  /**
   * Zero-allocation Temple of Hayana Mode-7 scanline pixel evaluator.
   * Uses a caller-provided per-scanline spatial hash run-cache to skip repeated hashing across contiguous masonry blocks.
   */
  evaluateScanlinePixel32(
    rx: number,
    ry: number,
    isFloor: boolean,
    maze: TempleMazeData,
    runCache: TempleScanlineRunCache
  ): number {
    if (isTempleWallAt(rx, ry, maze)) {
      if (BlockPatternPalette.isTileSeam(rx, ry, 15, 0.6)) {
        return BlockTexturePalette.TEMPLE_WALL_MORTAR;
      }
      const stoneX = Math.floor(rx / 15);
      const stoneY = Math.floor(ry / 15);
      if (stoneX !== runCache.lastStoneX || stoneY !== runCache.lastStoneY) {
        runCache.lastStoneX = stoneX;
        runCache.lastStoneY = stoneY;
        const seedFrac = GeometryModule.spatialHash2D(stoneX, stoneY);
        if (seedFrac < 0.15) {
          runCache.lastWallColor32 = BlockTexturePalette.TEMPLE_WALL_MOSS;
        } else if (seedFrac < 0.5) {
          runCache.lastWallColor32 = BlockTexturePalette.TEMPLE_WALL_SLATE;
        } else {
          runCache.lastWallColor32 = BlockTexturePalette.TEMPLE_WALL_GRANITE;
        }
      }
      return runCache.lastWallColor32;
    }

    if (isFloor) {
      if (BlockPatternPalette.isTileSeam(rx, ry, TEMPLE_SPECS.floorTileSize, 1.0)) {
        return BlockTexturePalette.TEMPLE_FLOOR_GROUT;
      }
      return BlockPatternPalette.isAlternateTile(rx, ry, TEMPLE_SPECS.floorTileSize)
        ? BlockTexturePalette.TEMPLE_FLOOR_LIGHT
        : BlockTexturePalette.TEMPLE_FLOOR_DARK;
    }

    return CeilingPhysics.evaluateTempleCeilingColor32(rx, ry, TEMPLE_SPECS.ceilingTileSize);
  }
};

export default TempleOfHayana;
