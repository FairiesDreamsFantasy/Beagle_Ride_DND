/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Ceiling/index.tsx
 * Architectural Ceiling Coffer, Beam & Acoustic Canopy Building Block Module.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { BlockTexturePalette } from '../Animations/Color_Palette/Texture_Palette/index';
import { BlockPatternPalette } from '../Animations/Color_Palette/Pattern_Palette/index';

export const CeilingPhysics = {
  mass: 1.0,
  friction: 0.5,
  collisionOpacity: 1.0,
  getPhysicalProperties: () => ({ mass: 1.0, friction: 0.5, collisionOpacity: 1.0 }),

  evaluateFoyerCeilingColor32(rx: number, ry: number, tileSize: number): number {
    return BlockPatternPalette.isAlternateTile(rx, ry, tileSize)
      ? BlockTexturePalette.FOYER_CEILING_LIGHT
      : BlockTexturePalette.FOYER_CEILING_ALT;
  },

  evaluatePorchCeilingColor32(rx: number, ry: number, ceilingTileSize: number): number {
    if (BlockPatternPalette.isPorchLanternEmitter(rx, ry, 120, 100, 10)) {
      return BlockTexturePalette.PORCH_LANTERN_GLOW;
    }
    return BlockPatternPalette.isAlternatePlank(ry, ceilingTileSize)
      ? BlockTexturePalette.PORCH_CEILING_LIGHT
      : BlockTexturePalette.PORCH_CEILING_DARK;
  },

  evaluateTempleCeilingColor32(rx: number, ry: number, ceilingTileSize: number): number {
    if (BlockPatternPalette.isTileSeam(rx, ry, ceilingTileSize, 1.2)) {
      return BlockTexturePalette.TEMPLE_CEILING_GROUT;
    }
    return BlockPatternPalette.isAlternateTile(rx, ry, ceilingTileSize)
      ? BlockTexturePalette.TEMPLE_CEILING_LIGHT
      : BlockTexturePalette.TEMPLE_CEILING_DARK;
  }
};

export default CeilingPhysics;
