/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * House/Front_Porch/index.tsx
 * Scientific Geometry, Hardwood Plank Shader, Colonnade & Temple Gate Threshold for House/Front_Porch/.
 * Canonical module path: House/Front_Porch/ (Porch is not used as a standalone folder).
 * Grounded in WorldRegistry.rooms.PORCH (800x200x9ft, 10ft floor planks, 15ft ceiling planks).
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { WorldRegistry } from '../../System/Registry/Building_Blocks/World/index';
import { BlockTexturePalette } from '../../System/Building_Blocks/Animations/Color_Palette/Texture_Palette/index';
import { BlockPatternPalette } from '../../System/Building_Blocks/Animations/Color_Palette/Pattern_Palette/index';
import { FlooringBuildingBlocks } from '../../System/Building_Blocks/Flooring/index';
import { PillarBuildingBlocks } from '../../System/Building_Blocks/Pillar/index';
import { CeilingPhysics } from '../../System/Building_Blocks/Ceiling/index';
import { DoorPhysics } from '../../System/Building_Blocks/Door/index';
import { WallAndBarrierBuildingBlocks } from '../../System/Building_Blocks/Wall_and_Barrier/index';
import { SkyBuildingBlock } from '../../System/Building_Blocks/World/Sky/index';
import { FrontPorchAnimations } from './Animations/index';

const PORCH_SPECS = WorldRegistry.rooms.PORCH;
const FOYER_SPECS = WorldRegistry.rooms.FOYER;
const TEMPLE_SPECS = WorldRegistry.rooms.TEMPLE;

export const FrontPorch = {
  location: 'FRONT' as const,
  canonicalName: 'Front_Porch' as const,
  ambient: 'QUIET' as const,
  zone: 'OUTDOOR' as const,
  specs: PORCH_SPECS,
  flooring: FlooringBuildingBlocks.Wooden,
  pillar: PillarBuildingBlocks.ClassicColumn,
  ceiling: CeilingPhysics,
  sky: SkyBuildingBlock,
  animations: FrontPorchAnimations,
  fogColor: { r: 28, g: 24, b: 42 } as const,

  /**
   * Computes twilight sky scanline color ONCE per scanline row sy.
   */
  computeTwilightSkyRowColor32(sy: number, safeHorizon: number): number {
    return SkyBuildingBlock.evaluateSkyColor32(sy, safeHorizon);
  },

  /**
   * Zero-allocation Front Porch Mode-7 scanline pixel evaluator delegating to Building_Blocks.
   */
  evaluateScanlinePixel32(
    rx: number,
    ry: number,
    isFloor: boolean,
    isDoorGap: boolean,
    sy: number,
    horizon: number,
    gateLintelDrop: number,
    rowTwilightSky32: number
  ): number {
    if (rx < 0 || rx > PORCH_SPECS.width || ry < 0 || ry > PORCH_SPECS.height) {
      if (ry < 0 && isDoorGap) {
        if (isFloor) {
          return BlockPatternPalette.isAlternateTile(rx, ry, FOYER_SPECS.floorTileSize)
            ? BlockTexturePalette.FOYER_TILE_BLUE
            : BlockTexturePalette.FOYER_TILE_GREEN;
        }
        return BlockTexturePalette.WALL_BASE_DARK;
      }
      if (ry > PORCH_SPECS.height && isDoorGap) {
        if (isFloor) {
          return BlockPatternPalette.isAlternateTile(rx, ry, TEMPLE_SPECS.floorTileSize)
            ? BlockTexturePalette.TEMPLE_FLOOR_LIGHT
            : BlockTexturePalette.TEMPLE_FLOOR_DARK;
        }
        return DoorPhysics.evaluateLintelColor32(sy, horizon, gateLintelDrop, BlockTexturePalette.TEMPLE_GATE_LINTEL);
      }
      return WallAndBarrierBuildingBlocks.evaluatePorchPerimeterColor32(rx, isFloor, rowTwilightSky32);
    }

    if (isFloor) {
      return BlockPatternPalette.isAlternatePlank(ry, PORCH_SPECS.floorTileSize)
        ? BlockTexturePalette.PORCH_PLANK_LIGHT
        : BlockTexturePalette.PORCH_PLANK_DARK;
    }

    return CeilingPhysics.evaluatePorchCeilingColor32(rx, ry, PORCH_SPECS.ceilingTileSize);
  }
};

export default FrontPorch;
