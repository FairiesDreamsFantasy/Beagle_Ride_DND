/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Fairy-Rider/POV/Python/index.tsx
 * Domain: FairyRider:FirstPersonEyeCamera (Python Kernel)
 */

export class CharacterPythonLogic {
  public static status = "Operational";
  public static readonly domain = "FairyRider:FirstPersonEyeCamera";
  public static readonly strideHz = 2.4;
  public static readonly pitchRatio = 1.12;

  public static evaluateHarmonicBob(phaseRad: number, amplitudePx: number = 2.0): number {
    return Math.sin(phaseRad) * amplitudePx;
  }

  public static evaluateParabolicJump(z0: number, vz0: number, gravity: number, dt: number): { z: number; vz: number } {
    const nextVz = vz0 - gravity * dt;
    const nextZ = Math.max(0, z0 + vz0 * dt - 0.5 * gravity * dt * dt);
    return { z: nextZ, vz: nextZ === 0 ? 0 : nextVz };
  }

  public static scalePitchHz(baseHz: number): number {
    return baseHz * this.pitchRatio;
  }
}
