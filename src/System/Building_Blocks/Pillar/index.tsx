/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Building_Blocks/Pillar/index.tsx
 * Pillar Building Block Module.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface PillarSpecs {
  readonly id: string;
  readonly name: string;
  readonly radiusFeet: number;
  readonly heightFeet: number;
  readonly flutingCount: number;
}

export const PillarBuildingBlocks = {
  ClassicColumn: {
    id: 'PILLAR_CLASSIC',
    name: 'Doric Stone Porch Column',
    radiusFeet: 1.5,
    heightFeet: 12.0,
    flutingCount: 20,
    evaluateFlute(angleRad: number, count: number): boolean {
      return Math.sin(angleRad * count) > 0.0;
    }
  },
  TemplePillar: {
    id: 'PILLAR_TEMPLE',
    name: 'Chiseled Granitic Temple Pier',
    radiusFeet: 2.2,
    heightFeet: 18.0,
    flutingCount: 24,
    evaluateStressFactor(loadLbs: number): number {
      return Math.min(1.0, loadLbs / 50000.0);
    }
  }
};

export default PillarBuildingBlocks;
