/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Building_Blocks/Ramp/index.tsx
 * Ramp Building Block Module.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface RampSpecs {
  readonly id: string;
  readonly name: string;
  readonly slopeAngleDeg: number;
  readonly lengthFeet: number;
}

export const RampBuildingBlocks = {
  WoodenRamp: {
    id: 'RAMP_WOODEN',
    name: 'Porch Access Wooden Ramp',
    slopeAngleDeg: 12.0,
    lengthFeet: 16.0,
    evaluateElevation(progress: number): number {
      return progress * Math.tan((12.0 * Math.PI) / 180.0) * 16.0;
    }
  },
  StoneRamp: {
    id: 'RAMP_STONE',
    name: 'Temple Ascent Stone Ramp',
    slopeAngleDeg: 15.0,
    lengthFeet: 30.0,
    evaluateElevation(progress: number): number {
      return progress * Math.tan((15.0 * Math.PI) / 180.0) * 30.0;
    }
  }
};

export default RampBuildingBlocks;
