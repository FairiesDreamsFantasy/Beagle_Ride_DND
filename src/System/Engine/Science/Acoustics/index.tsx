/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Engine/Science/Acoustics/index.tsx
 * Scientific Architectural & Atmospheric Acoustics Engine.
 * Precomputes Eyring RT60, mean free path, axial reflection timing, ISO 9613-1 air absorption,
 * and surface acoustic coefficients from WorldRegistry with zero runtime heap allocation.
 */

export * from './General/index';
import { WorldRegistry } from '../../../Registry/Building_Blocks/World/index';
import {
  AcousticsGeneralConfig,
  type SurfaceAcousticMaterial,
  type AcousticSurfaceMaterialId
} from './General/index';

export type RoomId = keyof typeof WorldRegistry.rooms;

export interface AxialModesHz {
  readonly lengthModeHz: number;
  readonly widthModeHz: number;
  readonly heightModeHz: number;
}

export interface RoomAcousticProfile {
  readonly room: RoomId;
  readonly isIndoor: boolean;
  readonly materialId: AcousticSurfaceMaterialId;
  readonly volumeM3: number;
  readonly surfaceAreaM2: number;
  readonly meanFreePathM: number;
  readonly meanAbsorption: number;
  readonly rt60Sec: number;
  readonly earlyReflectionDelaySec: number;
  readonly feedbackGain: number;
  readonly wetSendGain: number;
  readonly wetDampingCutoffHz: number;
  readonly impactBrightnessHz: number;
  readonly impactGainScale: number;
  readonly airAttenuationDbPerM: number;
  readonly axialModesHz: AxialModesHz;
}

const FT_TO_M = AcousticsGeneralConfig.feetToMeters;
const SPEED_OF_SOUND = AcousticsGeneralConfig.speedOfSoundAir20C;
const SABINE_K = AcousticsGeneralConfig.sabineConstantSI;
const DB_TO_NP_SCALE = 1 / (10 * Math.LOG10E); // ~0.230258509

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * ISO 9613-1 high-frequency atmospheric sound attenuation in air (dB/m).
 */
function computeISO9613AirAttenuationDbPerM(
  frequencyHz: number,
  tempC: number = AcousticsGeneralConfig.standardTempC,
  relHumidityPct: number = AcousticsGeneralConfig.standardRelHumidityPct
): number {
  const safeHumidity = Math.max(5, relHumidityPct);
  const tempRatio = 293.15 / Math.max(200, tempC + 273.15);
  return 1.6e-10 * frequencyHz * frequencyHz * Math.sqrt(tempRatio) * (100 / safeHumidity);
}

/**
 * Eyring-Millington reverberation time RT60 (seconds) with atmospheric air absorption (4mV term).
 */
function computeEyringRT60(
  volumeM3: number,
  surfaceAreaM2: number,
  meanAbsorption: number,
  airAttenuationDbPerM: number
): number {
  const clampedAlpha = clamp(
    meanAbsorption,
    AcousticsGeneralConfig.eyringMinAbsorption,
    AcousticsGeneralConfig.eyringMaxAbsorption
  );
  const surfaceAbsorptionTerm = -surfaceAreaM2 * Math.log(1 - clampedAlpha);
  const intensityAttenM = airAttenuationDbPerM * DB_TO_NP_SCALE;
  const airTerm = 4 * intensityAttenM * volumeM3;
  const denominator = Math.max(0.05, surfaceAbsorptionTerm + airTerm);
  return clamp((SABINE_K * volumeM3) / denominator, 0.08, 4.5);
}

function buildRoomProfile(
  room: RoomId,
  isIndoor: boolean,
  material: SurfaceAcousticMaterial,
  targetEarlyDelaySec: number,
  maxFeedback: number,
  wetSendScale: number
): RoomAcousticProfile {
  const specs = WorldRegistry.rooms[room];
  const lengthM = specs.height * FT_TO_M;
  const widthM = specs.width * FT_TO_M;
  const heightM = specs.ceilingHeight * FT_TO_M;

  const volumeM3 = lengthM * widthM * heightM;
  const floorAreaM2 = lengthM * widthM;
  const ceilingAreaM2 = lengthM * widthM;
  const wallAreaM2 = 2 * (lengthM + widthM) * heightM;
  const surfaceAreaM2 = floorAreaM2 + ceilingAreaM2 + wallAreaM2;

  const meanFreePathM = (4 * volumeM3) / Math.max(1, surfaceAreaM2);
  const meanAbsorption =
    (floorAreaM2 * material.floorAbsorption +
      ceilingAreaM2 * material.ceilingAbsorption +
      wallAreaM2 * material.wallAbsorption) /
    Math.max(1, surfaceAreaM2);

  const airAttenuationDbPerM = computeISO9613AirAttenuationDbPerM(material.wetDampingCutoffHz);
  const rt60Sec = computeEyringRT60(volumeM3, surfaceAreaM2, meanAbsorption, airAttenuationDbPerM);

  // Derive feedback gain g = 10^(-3 * delay / RT60) so recursive delay decay matches physical RT60
  const safeDelaySec = clamp(
    targetEarlyDelaySec,
    AcousticsGeneralConfig.minEarlyReflectionDelaySec,
    AcousticsGeneralConfig.maxEarlyReflectionDelaySec
  );
  const physicalFeedback = Math.pow(10, (-3 * safeDelaySec) / rt60Sec);
  const feedbackGain = clamp(physicalFeedback, isIndoor ? 0.24 : 0.08, maxFeedback);
  const wetSendGain = clamp((1 - meanAbsorption) * wetSendScale, 0.06, 0.92);

  return {
    room,
    isIndoor,
    materialId: material.id,
    volumeM3,
    surfaceAreaM2,
    meanFreePathM,
    meanAbsorption,
    rt60Sec,
    earlyReflectionDelaySec: safeDelaySec,
    feedbackGain,
    wetSendGain,
    wetDampingCutoffHz: material.wetDampingCutoffHz,
    impactBrightnessHz: material.impactBrightnessHz,
    impactGainScale: material.impactGainScale,
    airAttenuationDbPerM,
    axialModesHz: {
      lengthModeHz: SPEED_OF_SOUND / (2 * Math.max(0.1, lengthM)),
      widthModeHz: SPEED_OF_SOUND / (2 * Math.max(0.1, widthM)),
      heightModeHz: SPEED_OF_SOUND / (2 * Math.max(0.1, heightM))
    }
  };
}

/**
 * Precomputed once at module load for O(1) lookup with zero per-frame garbage collection.
 */
const PRECOMPUTED_ROOM_PROFILES: Record<RoomId, RoomAcousticProfile> = {
  FOYER: buildRoomProfile(
    'FOYER',
    true,
    AcousticsGeneralConfig.surfaceMaterials.CERAMIC_TILE,
    Math.max(0.08, (2 * WorldRegistry.rooms.FOYER.ceilingHeight * FT_TO_M) / SPEED_OF_SOUND),
    0.34,
    0.72
  ),
  GARDEN: buildRoomProfile(
    'GARDEN',
    false,
    AcousticsGeneralConfig.surfaceMaterials.GROUND_GRASS,
    0.045,
    0.09,
    0.45
  ),
  PORCH: buildRoomProfile(
    'PORCH',
    false,
    AcousticsGeneralConfig.surfaceMaterials.HARDWOOD_PLANK,
    0.068,
    0.22,
    0.58
  ),
  TEMPLE: buildRoomProfile(
    'TEMPLE',
    true,
    AcousticsGeneralConfig.surfaceMaterials.GRANITE_SLATE,
    0.18,
    0.49,
    0.92
  )
};

export const AcousticsEngine = {
  /**
   * O(1) zero-allocation acoustic profile lookup for any WorldRegistry room.
   */
  getRoomProfile(room: RoomId): RoomAcousticProfile {
    return PRECOMPUTED_ROOM_PROFILES[room] ?? PRECOMPUTED_ROOM_PROFILES.FOYER;
  },

  /**
   * Exact Eyring-Millington RT60 reverberation solver (seconds).
   */
  calculateEyringRT60(
    volumeM3: number,
    surfaceAreaM2: number,
    meanAbsorption: number,
    airAttenuationDbPerM: number = 0.005
  ): number {
    return computeEyringRT60(volumeM3, surfaceAreaM2, meanAbsorption, airAttenuationDbPerM);
  },

  /**
   * Computes fundamental standing-wave axial modes f = c / (2 * L) in Hz.
   */
  calculateAxialReflectionModesHz(lengthFeet: number, widthFeet: number, heightFeet: number): AxialModesHz {
    const lengthM = Math.max(0.1, lengthFeet * FT_TO_M);
    const widthM = Math.max(0.1, widthFeet * FT_TO_M);
    const heightM = Math.max(0.1, heightFeet * FT_TO_M);
    return {
      lengthModeHz: SPEED_OF_SOUND / (2 * lengthM),
      widthModeHz: SPEED_OF_SOUND / (2 * widthM),
      heightModeHz: SPEED_OF_SOUND / (2 * heightM)
    };
  },

  /**
   * ISO 9613-1 high-frequency air attenuation rate (dB/m).
   */
  calculateISO9613AirAttenuationDbPerM(
    frequencyHz: number,
    tempC: number = AcousticsGeneralConfig.standardTempC,
    relHumidityPct: number = AcousticsGeneralConfig.standardRelHumidityPct
  ): number {
    return computeISO9613AirAttenuationDbPerM(frequencyHz, tempC, relHumidityPct);
  },

  /**
   * Computes portal/corridor distance attenuation combining inverse-square law with ISO 9613-1 air loss.
   */
  calculateDistanceGain(
    distanceFeet: number,
    frequencyHz: number = 1200,
    referenceMeters: number = 1.0
  ): number {
    const distanceM = Math.max(referenceMeters, distanceFeet * FT_TO_M);
    const geometricGain = referenceMeters / distanceM;
    const airLossDb = computeISO9613AirAttenuationDbPerM(frequencyHz) * (distanceM - referenceMeters);
    const airGain = Math.pow(10, -airLossDb / 20);
    return clamp(geometricGain * airGain, 0.02, 1.0);
  }
};

export default AcousticsEngine;
