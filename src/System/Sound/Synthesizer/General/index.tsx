/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 8 Fully-Implemented Mathematical Synthesizer Modules for Sound/Synthesizer/General:
 * 1. FourierSeriesWaveformGenerator - Exact harmonic synthesis
 * 2. EqualTemperamentCentTuning - Pitch interval and cent deviation calculator
 * 3. ADSRCurvatureEnvelopeModel - Exact exponential time-constant decay envelope
 * 4. WavetableLookupGenerator - High-density 2048-point wavetable generator
 * 5. ChebyshevNonlinearTransferModel - Mathematical harmonic distortion shaper
 * 6. HarmonicConsonanceDissonanceMetric - Helmholtz sensory dissonance analyzer
 * 7. TPDFDitherStochasticMatrix - Double-precision triangular dither matrix
 * 8. FrequencyModulationBesselEngine - Chowning FM synthesis index calculator
 */

export const FourierSeriesWaveformGenerator = {
  id: 'FOURIER_SERIES_WAVEFORM_GENERATOR',
  generateHarmonics(fundamental: number, numHarmonics: number = 16, type: 'sawtooth' | 'square' | 'triangle') {
    const harmonics: { harmonicNumber: number; frequency: number; amplitude: number; phaseRad: number }[] = [];
    for (let k = 1; k <= numHarmonics; k++) {
      let amp = 0;
      let phase = 0;
      if (type === 'sawtooth') {
        amp = (2 / Math.PI) * (Math.pow(-1, k + 1) / k);
      } else if (type === 'square') {
        if (k % 2 !== 0) {
          amp = (4 / Math.PI) * (1 / k);
        }
      } else if (type === 'triangle') {
        if (k % 2 !== 0) {
          const n = (k - 1) / 2;
          amp = (8 / (Math.PI * Math.PI)) * (Math.pow(-1, n) / (k * k));
        }
      }
      if (amp !== 0) {
        harmonics.push({
          harmonicNumber: k,
          frequency: Number((fundamental * k).toFixed(12)),
          amplitude: Number(amp.toFixed(15)),
          phaseRad: phase
        });
      }
    }
    return harmonics;
  }
};

export const EqualTemperamentCentTuning = {
  id: 'EQUAL_TEMPERAMENT_CENT_TUNING',
  baseA4: 440.0,
  midiToFrequency(midiNote: number, pitchBendCents: number = 0): number {
    const semitones = midiNote - 69 + pitchBendCents / 100;
    return Number((this.baseA4 * Math.pow(2, semitones / 12)).toFixed(12));
  },
  frequencyToMidi(frequency: number): { midiNote: number; centDeviation: number } {
    const exactMidi = 69 + 12 * Math.log2(frequency / this.baseA4);
    const nearestNote = Math.round(exactMidi);
    const centDeviation = Number(((exactMidi - nearestNote) * 100).toFixed(6));
    return { midiNote: nearestNote, centDeviation };
  }
};

export const ADSRCurvatureEnvelopeModel = {
  id: 'ADSR_CURVATURE_ENVELOPE_MODEL',
  calculateValue(t: number, attackTime: number, decayTime: number, sustainLevel: number, releaseTime: number, noteDuration: number): number {
    if (t < 0) return 0;
    if (t <= attackTime) {
      return attackTime > 0 ? Number((1 - Math.exp(-4 * (t / attackTime))).toFixed(12)) : 1;
    }
    if (t <= attackTime + decayTime) {
      const decayProgress = (t - attackTime) / decayTime;
      return Number((1 - (1 - sustainLevel) * (1 - Math.exp(-4 * decayProgress))).toFixed(12));
    }
    if (t <= noteDuration) {
      return sustainLevel;
    }
    const releaseProgress = (t - noteDuration) / releaseTime;
    if (releaseProgress >= 1) return 0;
    return Number((sustainLevel * Math.exp(-5 * releaseProgress)).toFixed(12));
  }
};

export const WavetableLookupGenerator = {
  id: 'WAVETABLE_LOOKUP_GENERATOR',
  tableSize: 2048,
  generate(type: 'sine' | 'sawtooth' | 'square' | 'triangle'): Float64Array {
    const table = new Float64Array(this.tableSize);
    for (let i = 0; i < this.tableSize; i++) {
      const phase = (2 * Math.PI * i) / this.tableSize;
      if (type === 'sine') {
        table[i] = Math.sin(phase);
      } else if (type === 'sawtooth') {
        table[i] = 1 - (2 * i) / this.tableSize;
      } else if (type === 'square') {
        table[i] = i < this.tableSize / 2 ? 1.0 : -1.0;
      } else if (type === 'triangle') {
        table[i] = 2 * Math.abs(2 * (i / this.tableSize - Math.floor(i / this.tableSize + 0.5))) - 1;
      }
    }
    return table;
  }
};

export const ChebyshevNonlinearTransferModel = {
  id: 'CHEBYSHEV_NONLINEAR_TRANSFER_MODEL',
  evaluateT(order: number, x: number): number {
    const clampedX = Math.max(-1, Math.min(1, x));
    if (order === 0) return 1;
    if (order === 1) return clampedX;
    if (order === 2) return 2 * clampedX * clampedX - 1;
    if (order === 3) return 4 * Math.pow(clampedX, 3) - 3 * clampedX;
    if (order === 4) return 8 * Math.pow(clampedX, 4) - 8 * clampedX * clampedX + 1;
    return Math.cos(order * Math.acos(clampedX));
  }
};

export const HarmonicConsonanceDissonanceMetric = {
  id: 'HARMONIC_CONSONANCE_DISSONANCE_METRIC',
  calculateSensoryDissonance(f1: number, f2: number): number {
    const fMin = Math.min(f1, f2);
    const fMax = Math.max(f1, f2);
    const s = 0.24 / (0.021 * fMin + 19);
    const d = fMax - fMin;
    return Number((Math.exp(-3.5 * s * d) - Math.exp(-5.75 * s * d)).toFixed(12));
  }
};

export const TPDFDitherStochasticMatrix = {
  id: 'TPDF_DITHER_STOCHASTIC_MATRIX',
  calculateTPDFSample(bitDepth: number = 64): number {
    const q = 1 / Math.pow(2, bitDepth);
    const r1 = Math.random();
    const r2 = Math.random();
    return Number(((r1 - r2) * q).toFixed(15));
  }
};

export const FrequencyModulationBesselEngine = {
  id: 'FREQUENCY_MODULATION_BESSEL_ENGINE',
  approximateBesselJ(n: number, beta: number): number {
    let sum = 0;
    const maxK = 12;
    for (let k = 0; k < maxK; k++) {
      const num = Math.pow(-1, k) * Math.pow(beta / 2, 2 * k + n);
      let denom = 1;
      for (let i = 1; i <= k; i++) denom *= i;
      for (let i = 1; i <= k + n; i++) denom *= i;
      sum += num / denom;
    }
    return Number(sum.toFixed(12));
  },
  calculateSidebandAmplitudes(carrierFreq: number, modFreq: number, modIndexBeta: number, orderCount: number = 4) {
    const sidebands: { order: number; frequency: number; amplitude: number }[] = [];
    for (let n = -orderCount; n <= orderCount; n++) {
      const orderAbs = Math.abs(n);
      const sign = n < 0 && orderAbs % 2 !== 0 ? -1 : 1;
      const amp = sign * this.approximateBesselJ(orderAbs, modIndexBeta);
      sidebands.push({
        order: n,
        frequency: Number((carrierFreq + n * modFreq).toFixed(12)),
        amplitude: Number(amp.toFixed(12))
      });
    }
    return sidebands;
  }
};

export const SoundSynthesizerGeneral = {
  FourierSeriesWaveformGenerator,
  EqualTemperamentCentTuning,
  ADSRCurvatureEnvelopeModel,
  WavetableLookupGenerator,
  ChebyshevNonlinearTransferModel,
  HarmonicConsonanceDissonanceMetric,
  TPDFDitherStochasticMatrix,
  FrequencyModulationBesselEngine,
  version: '1.0.0-mathematical'
};

export default SoundSynthesizerGeneral;
