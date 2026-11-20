/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Wall_and_Barrier/index.tsx
 * Walls & Perimeter Barriers Module: Tiled Manor Walls, Flower Hedges, Porch Railings, and Temple Masonry.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { BlockTexturePalette } from '../Animations/Color_Palette/Texture_Palette/index';
import { BlockPatternPalette } from '../Animations/Color_Palette/Pattern_Palette/index';

export const Wall_and_BarrierPhysics = {
  mass: 1.0,
  friction: 0.5,
  collisionOpacity: 1.0,
  getPhysicalProperties: () => ({ mass: 1.0, friction: 0.5, collisionOpacity: 1.0 })
};

export const WallAndBarrierBuildingBlocks = {
  /**
   * Stately black-tiled interior border wall for the Foyer.
   */
  evaluateFoyerBorderColor32(rx: number, ry: number): number {
    return BlockPatternPalette.isTileSeam(rx, ry, 15, 0.6)
      ? BlockTexturePalette.WALL_GROUT_DARK
      : BlockTexturePalette.WALL_BASE_DARK;
  },

  /**
   * Pruned perimeter flower hedge surrounding the Garden.
   */
  evaluateGardenHedgeColor32(rx: number, ry: number): number {
    return BlockPatternPalette.isAlternateTile(rx, ry, 15)
      ? BlockTexturePalette.GARDEN_HEDGE_DARK
      : BlockTexturePalette.GARDEN_HEDGE_LIGHT;
  },

  /**
   * Front Porch perimeter colonnade with white Doric columns, railings, and lawn edge.
   */
  evaluatePorchPerimeterColor32(rx: number, isFloor: boolean, skyColor32: number): number {
    if (BlockPatternPalette.isPeriodicColumn(rx, 160, 12)) {
      return BlockTexturePalette.PORCH_COLUMN_WHITE;
    }
    if (BlockPatternPalette.isRailingPost(rx, 15, 1.2)) {
      return BlockTexturePalette.PORCH_RAILING_DARK;
    }
    return isFloor ? BlockTexturePalette.PORCH_LAWN_SURROUND : skyColor32;
  }
};

export default WallAndBarrierBuildingBlocks;
