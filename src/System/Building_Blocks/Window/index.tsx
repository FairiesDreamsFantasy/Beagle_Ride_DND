/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Window/index.tsx
 * Architectural Window & Light Transmittance Building Block Module.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export const WindowPhysics = {
  mass: 1.0,
  friction: 0.5,
  collisionOpacity: 1.0,
  refractiveIndexCrownGlass: 1.52,
  transmittance: 0.88,
  getPhysicalProperties: () => ({ mass: 1.0, friction: 0.5, collisionOpacity: 1.0 }),

  /**
   * Computes Fresnel reflectance approximation at normal incidence angle cosTheta.
   */
  evaluateFresnelReflectance(cosTheta: number): number {
    const r0 = 0.0426; // ((1.52 - 1) / (1.52 + 1))^2
    const c = 1.0 - (cosTheta < 0 ? 0 : (cosTheta > 1 ? 1 : cosTheta));
    const c2 = c * c;
    return r0 + (1.0 - r0) * (c2 * c2 * c);
  }
};

export default WindowPhysics;
