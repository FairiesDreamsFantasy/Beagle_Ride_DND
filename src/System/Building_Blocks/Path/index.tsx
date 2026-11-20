/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Building_Blocks/Path/index.tsx
 * Path Building Block Module.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface PathSpecs {
  readonly id: string;
  readonly name: string;
  readonly widthFeet: number;
}

export const PathBuildingBlocks = {
  GardenCobblestone: {
    id: 'PATH_COBBLESTONE',
    name: 'Winding Garden Cobblestone Path',
    widthFeet: 6.0,
    evaluateProximity(px: number, py: number, cx: number, cy: number): boolean {
      const dx = px - cx;
      const dy = py - cy;
      return (dx * dx + dy * dy) <= (3.0 * 3.0);
    }
  }
};

export default PathBuildingBlocks;
