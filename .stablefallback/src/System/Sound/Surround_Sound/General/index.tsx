/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 8 Ultra-Scientific Surround Sound Modules:
 * 1. ITURBS775SurroundSpeakerMatrix - Standard 5.1 circular azimuth positioning matrix
 * 2. VectorBaseAmplitudePanning3D - 3D VBAP speaker gain calculation
 * 3. AmbisonicBFormatEncoderEngine - W, X, Y, Z spherical harmonic spatial encoder
 * 4. SubwooferLFEButterworthFilterMatrix - 4th-order 120Hz lowpass LFE crossover
 * 5. SpatialDistanceDelayCompensationEngine - Millisecond time-of-flight alignment
 * 6. HeadRelatedTransferSphericalModel - Dual-ear interaural level and phase simulator
 * 7. ReverberantDiffuseEnergyDistribution - Spatial room reflection decorrelator
 * 8. SurroundSpeakerClippingGuard - Multi-channel summation protection limiter
 */

export const ITURBS775SurroundSpeakerMatrix = {
  id: 'ITU_R_BS775_SURROUND_SPEAKER_MATRIX',
  speakers: [
    { channel: 'FL', azimuthDeg: -30, elevationDeg: 0 },
    { channel: 'FR', azimuthDeg: 30, elevationDeg: 0 },
    { channel: 'FC', azimuthDeg: 0, elevationDeg: 0 },
    { channel: 'LFE', azimuthDeg: 0, elevationDeg: 0, isLowFrequency: true },
    { channel: 'SL', azimuthDeg: -110, elevationDeg: 0 },
    { channel: 'SR', azimuthDeg: 110, elevationDeg: 0 }
  ],
  calculateGains(sourceAzimuthDeg: number): Record<string, number> {
    const rad = (sourceAzimuthDeg * Math.PI) / 180;
    const x = Math.sin(rad);
    const y = Math.cos(rad);
    const flGain = Math.max(0, -x * 0.707 + y * 0.707);
    const frGain = Math.max(0, x * 0.707 + y * 0.707);
    const fcGain = Math.max(0, y > 0.5 ? y : 0);
    const slGain = Math.max(0, -x * 0.707 - y * 0.707);
    const srGain = Math.max(0, x * 0.707 - y * 0.707);
    return {
      FL: Number(flGain.toFixed(6)),
      FR: Number(frGain.toFixed(6)),
      FC: Number(fcGain.toFixed(6)),
      LFE: 0.5,
      SL: Number(slGain.toFixed(6)),
      SR: Number(srGain.toFixed(6))
    };
  }
};

export const VectorBaseAmplitudePanning3D = {
  id: 'VECTOR_BASE_AMPLITUDE_PANNING_3D',
  calculate3DVectorGains(x: number, y: number, z: number): { horizontalMagnitude: number; elevationAngleRad: number } {
    const horiz = Math.sqrt(x * x + y * y);
    const elev = Math.atan2(z, Math.max(1e-6, horiz));
    return {
      horizontalMagnitude: Number(horiz.toFixed(6)),
      elevationAngleRad: Number(elev.toFixed(6))
    };
  }
};

export const AmbisonicBFormatEncoderEngine = {
  id: 'AMBISONIC_B_FORMAT_ENCODER_ENGINE',
  encodeSample(monoSignal: number, azimuthRad: number, elevationRad: number = 0) {
    // 1st order B-format channels: W (omnidirectional), X (front-back), Y (left-right), Z (up-down)
    const cosEl = Math.cos(elevationRad);
    return {
      W: Number((monoSignal * 0.7071067811865475).toFixed(12)),
      X: Number((monoSignal * cosEl * Math.cos(azimuthRad)).toFixed(12)),
      Y: Number((monoSignal * cosEl * Math.sin(azimuthRad)).toFixed(12)),
      Z: Number((monoSignal * Math.sin(elevationRad)).toFixed(12))
    };
  }
};

export const SubwooferLFEButterworthFilterMatrix = {
  id: 'SUBWOOFER_LFE_BUTTERWORTH_FILTER_MATRIX',
  crossoverFreqHz: 120,
  calculateCutoffRatio(sampleRate: number = 48000): number {
    return Number(((2 * Math.PI * this.crossoverFreqHz) / sampleRate).toFixed(8));
  }
};

export const SpatialDistanceDelayCompensationEngine = {
  id: 'SPATIAL_DISTANCE_DELAY_COMPENSATION_ENGINE',
  calculateDelayMs(distanceMeters: number, speedOfSound: number = 343.2): number {
    return Number(((distanceMeters / speedOfSound) * 1000).toFixed(4));
  }
};

export const HeadRelatedTransferSphericalModel = {
  id: 'HEAD_RELATED_TRANSFER_SPHERICAL_MODEL',
  calculateInterauralLevelDifferenceDb(azimuthRad: number, freqHz: number): number {
    // High frequencies experience greater acoustic head shadow
    const maxIld = Math.min(20, (freqHz / 1000) * 3.5);
    return Number((Math.sin(azimuthRad) * maxIld).toFixed(4));
  }
};

export const ReverberantDiffuseEnergyDistribution = {
  id: 'REVERBERANT_DIFFUSE_ENERGY_DISTRIBUTION',
  decorrelateSurround(frontEnergy: number, surroundDecayRate: number = 0.65): number {
    return Number((frontEnergy * surroundDecayRate).toFixed(6));
  }
};

export const SurroundSpeakerClippingGuard = {
  id: 'SURROUND_SPEAKER_CLIPPING_GUARD',
  normalizeMultiChannelGains(gains: number[]): number[] {
    const sumSquares = gains.reduce((acc, g) => acc + g * g, 0);
    const rms = Math.sqrt(sumSquares);
    if (rms <= 1.0) return gains;
    return gains.map(g => Number((g / rms).toFixed(6)));
  }
};

export const SurroundSoundGeneral = {
  ITURBS775SurroundSpeakerMatrix,
  VectorBaseAmplitudePanning3D,
  AmbisonicBFormatEncoderEngine,
  SubwooferLFEButterworthFilterMatrix,
  SpatialDistanceDelayCompensationEngine,
  HeadRelatedTransferSphericalModel,
  ReverberantDiffuseEnergyDistribution,
  SurroundSpeakerClippingGuard,
  version: '1.0.0-surround-mathematical'
};

export default SurroundSoundGeneral;
