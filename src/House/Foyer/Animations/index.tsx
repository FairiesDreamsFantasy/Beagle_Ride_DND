/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * House/Foyer/Animations/index.tsx
 * Scientific Architectural Animation Registry for House/Foyer/.
 */

import { BlockAnimation2D } from '../../../System/Building_Blocks/Animations/2-D/index';
import { BlockAnimation3D } from '../../../System/Building_Blocks/Animations/3-D/index';

export interface FoyerAnimationEntry {
  readonly id: string;
  readonly target: 'DOOR' | 'TILE_GLINT' | 'CEILING_COFFER';
  readonly frequencyHz: number;
}

export const FoyerAnimations = {
  registry: [
    { id: 'FOYER_NORTH_PORTAL_SHIMMER', target: 'DOOR', frequencyHz: 0.35 },
    { id: 'FOYER_CERAMIC_GLAZE_SPECULAR', target: 'TILE_GLINT', frequencyHz: 0.25 }
  ] as readonly FoyerAnimationEntry[],

  evaluateDoorSwing(progress01: number): number {
    return BlockAnimation2D.evaluateDoorSwingDeg(progress01, 90);
  },

  evaluateCeilingRadiance(nx: number, ny: number, nz: number): number {
    return BlockAnimation3D.evaluateSurfaceIllumination(nx, ny, nz, 0.0, -0.45, 0.89, 0.42);
  }
};

export default FoyerAnimations;
