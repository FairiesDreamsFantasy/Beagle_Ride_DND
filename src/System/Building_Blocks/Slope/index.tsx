/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Building_Blocks/Slope/index.tsx
 * Slope Building Block Module.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface SlopeSpecs {
  readonly id: string;
  readonly name: string;
  readonly gradientFactor: number;
}

export const SlopeBuildingBlocks = {
  GardenMound: {
    id: 'SLOPE_GARDEN_MOUND',
    name: 'Floral Garden Terraced Slope',
    gradientFactor: 0.18,
    evaluateHeight(x: number, y: number): number {
      return Math.sin(x * 0.05) * Math.cos(y * 0.05) * 3.0;
    }
  }
};

export default SlopeBuildingBlocks;
