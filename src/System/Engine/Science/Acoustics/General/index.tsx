/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Engine/Science/Acoustics/General/index.tsx
 * Fundamental Physical Constants & Material Sabine Absorption Coefficients.
 */

export type AcousticSurfaceMaterialId =
  | 'CERAMIC_TILE'
  | 'GROUND_GRASS'
  | 'HARDWOOD_PLANK'
  | 'GRANITE_SLATE';

export interface SurfaceAcousticMaterial {
  readonly id: AcousticSurfaceMaterialId;
  readonly floorAbsorption: number;
  readonly ceilingAbsorption: number;
  readonly wallAbsorption: number;
  readonly impactBrightnessHz: number;
  readonly impactGainScale: number;
  readonly wetDampingCutoffHz: number;
}

export const AcousticsGeneralConfig = {
  /** Exact international foot-to-meter conversion factor. */
  feetToMeters: 0.3048,
  /** Speed of sound in dry air at 20 degrees C (m/s). */
  speedOfSoundAir20C: 343.2,
  /** Standard reference temperature (Celsius) and relative humidity (%). */
  standardTempC: 20.0,
  standardRelHumidityPct: 50.0,
  /** Sabine SI reverberation constant 4 * ln(10^6) / c ~= 0.161 s/m. */
  sabineConstantSI: 0.161,
  /** Minimum absorption coefficient to avoid Eyring singularity ln(1 - 0). */
  eyringMinAbsorption: 0.001,
  /** Maximum absorption coefficient for free-field / open sky boundary. */
  eyringMaxAbsorption: 0.999,
  /** Minimum delay (seconds) preventing harsh metallic comb resonance on small heights. */
  minEarlyReflectionDelaySec: 0.032,
  maxEarlyReflectionDelaySec: 0.22,
  /** Material acoustic coefficients grounded in WorldRegistry / House / Temple surface definitions. */
  surfaceMaterials: {
    CERAMIC_TILE: {
      id: 'CERAMIC_TILE',
      floorAbsorption: 0.015,
      ceilingAbsorption: 0.14,
      wallAbsorption: 0.05,
      impactBrightnessHz: 2400,
      impactGainScale: 0.96,
      wetDampingCutoffHz: 4200
    },
    GROUND_GRASS: {
      id: 'GROUND_GRASS',
      floorAbsorption: 0.85,
      ceilingAbsorption: 0.999,
      wallAbsorption: 0.65,
      impactBrightnessHz: 1150,
      impactGainScale: 0.68,
      wetDampingCutoffHz: 1800
    },
    HARDWOOD_PLANK: {
      id: 'HARDWOOD_PLANK',
      floorAbsorption: 0.12,
      ceilingAbsorption: 0.15,
      wallAbsorption: 0.88,
      impactBrightnessHz: 1750,
      impactGainScale: 0.88,
      wetDampingCutoffHz: 2800
    },
    GRANITE_SLATE: {
      id: 'GRANITE_SLATE',
      floorAbsorption: 0.02,
      ceilingAbsorption: 0.03,
      wallAbsorption: 0.015,
      impactBrightnessHz: 2950,
      impactGainScale: 1.0,
      wetDampingCutoffHz: 4800
    }
  } satisfies Record<AcousticSurfaceMaterialId, SurfaceAcousticMaterial>
} as const;
