/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Building_Blocks/World/Sky/index.tsx
 * Sky Building Block Module (located inside World/Sky/).
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { ShadingColor32LUT } from '../../../Engine/Mathematics/LUT/Shading';

export const SkyBuildingBlock = {
  id: 'WORLD_SKY_TWILIGHT',
  name: 'N64 Twilight Atmosphere Sky',
  evaluateSkyColor32(sy: number, horizon: number): number {
    const safeHorizon = horizon === 0 ? 1 : horizon;
    const skyIndex = Math.min(255, Math.max(0, Math.floor((sy / safeHorizon) * 255)));
    return ShadingColor32LUT[skyIndex];
  }
};

export default SkyBuildingBlock;
