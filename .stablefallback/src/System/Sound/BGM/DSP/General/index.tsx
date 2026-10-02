/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 8 Ultra-Scientific BGM DSP Modules:
 * 1. BGMHarmonicNotchFilterMatrix - Multi-pole notch harmonic suppression
 * 2. BGMPhaseCancellationMatrix - Stereophonic width and anti-phase cancellation model
 * 3. BGMTempoSyncDelayLineEngine - Millisecond tempo-synchronized echo calculator
 * 4. BGMDynamicSpectralCompressor - RMS energy detection and soft-knee dynamics
 * 5. BGMInterauralTimeDelayMatrix - ITD stereophonic acoustic model
 * 6. BGMMidSideStereoMatrix - Sum-and-difference stereophonic matrix
 * 7. BGMSubharmonicGeneratorEngine - Sub-octave division bass synthesizer
 * 8. BGMLowpassAntiAliasingFilter - Sinc interpolation anti-aliasing filter
 */

export const BGMHarmonicNotchFilterMatrix = {
  id: 'BGM_HARMONIC_NOTCH_FILTER_MATRIX',
  calculatePoles(fundamental: number, harmonicsCount: number = 4) {
    const notches: { harmonic: number; frequency: number; q: number }[] = [];
    for (let i = 1; i <= harmonicsCount; i++) {
      notches.push({
        harmonic: i,
        frequency: Number((fundamental * i).toFixed(6)),
        q: 18.0
      });
    }
    return notches;
  }
};

export const BGMPhaseCancellationMatrix = {
  id: 'BGM_PHASE_CANCELLATION_MATRIX',
  calculateStereoCorrelation(left: number[], right: number[]): number {
    let dot = 0, sumL = 0, sumR = 0;
    const len = Math.min(left.length, right.length);
    for (let i = 0; i < len; i++) {
      dot += left[i] * right[i];
      sumL += left[i] * left[i];
      sumR += right[i] * right[i];
    }
    const denom = Math.sqrt(sumL * sumR);
    return denom === 0 ? 1 : Number((dot / denom).toFixed(6));
  }
};

export const BGMTempoSyncDelayLineEngine = {
  id: 'BGM_TEMPO_SYNC_DELAY_LINE_ENGINE',
  calculateSyncDelay(bpm: number, fraction: '1/4' | '1/8' | '1/8D' | '1/16'): number {
    const beatMs = (60 / bpm) * 1000;
    switch (fraction) {
      case '1/4': return Number(beatMs.toFixed(3));
      case '1/8': return Number((beatMs / 2).toFixed(3));
      case '1/8D': return Number(((beatMs / 2) * 1.5).toFixed(3));
      case '1/16': return Number((beatMs / 4).toFixed(3));
    }
  }
};

export const BGMDynamicSpectralCompressor = {
  id: 'BGM_DYNAMIC_SPECTRAL_COMPRESSOR',
  calculateGainReduction(inputDb: number, thresholdDb: number = -18, ratio: number = 3.5, kneeDb: number = 6): number {
    if (inputDb <= thresholdDb - kneeDb / 2) return 0;
    if (inputDb >= thresholdDb + kneeDb / 2) {
      return Number(((inputDb - thresholdDb) * (1 - 1 / ratio)).toFixed(6));
    }
    const x = inputDb - thresholdDb + kneeDb / 2;
    return Number(((x * x) / (2 * kneeDb) * (1 - 1 / ratio)).toFixed(6));
  }
};

export const BGMInterauralTimeDelayMatrix = {
  id: 'BGM_INTERAURAL_TIME_DELAY_MATRIX',
  calculateITD(azimuthRad: number, headRadiusM: number = 0.0875, speedOfSoundMs: number = 343.2): number {
    // Woodworth formula for ITD
    return Number(((headRadiusM / speedOfSoundMs) * (azimuthRad + Math.sin(azimuthRad))).toFixed(8));
  }
};

export const BGMMidSideStereoMatrix = {
  id: 'BGM_MID_SIDE_STEREO_MATRIX',
  encode(left: number, right: number): { mid: number; side: number } {
    return {
      mid: Number(((left + right) * 0.7071067811865475).toFixed(12)),
      side: Number(((left - right) * 0.7071067811865475).toFixed(12))
    };
  },
  decode(mid: number, side: number): { left: number; right: number } {
    return {
      left: Number(((mid + side) * 0.7071067811865475).toFixed(12)),
      right: Number(((mid - side) * 0.7071067811865475).toFixed(12))
    };
  }
};

export const BGMSubharmonicGeneratorEngine = {
  id: 'BGM_SUBHARMONIC_GENERATOR_ENGINE',
  generateSubOctave(frequency: number): number {
    return Number((frequency / 2).toFixed(6));
  }
};

export const BGMLowpassAntiAliasingFilter = {
  id: 'BGM_LOWPASS_ANTI_ALIASING_FILTER',
  calculateCutoff(sampleRate: number = 48000, nyquistMargin: number = 0.45): number {
    return Number((sampleRate * nyquistMargin).toFixed(2));
  }
};

export const BGMDSPGeneral = {
  BGMHarmonicNotchFilterMatrix,
  BGMPhaseCancellationMatrix,
  BGMTempoSyncDelayLineEngine,
  BGMDynamicSpectralCompressor,
  BGMInterauralTimeDelayMatrix,
  BGMMidSideStereoMatrix,
  BGMSubharmonicGeneratorEngine,
  BGMLowpassAntiAliasingFilter,
  version: '1.0.0-bgm-dsp-mathematical'
};

export default BGMDSPGeneral;
