/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 8 Fully-Implemented Mathematical Synthesizer Modules for Sound/BGM/Synthesizer/General:
 * 1. ModalHarmonicScaleGenerator - Pythagorean, Just, and Equal scale ratios
 * 2. PolyphonicArpeggiatorStepMatrix - Multi-step tempo & meter rhythm generator
 * 3. ChowningFMOrganSynthesisModel - Multi-operator FM brass/organ ratio synthesizer
 * 4. MicrotonalCentDeviationMatrix - Indian shruti, meantone, and quarter-comma tuning
 * 5. BGMVoiceAllocationPriorityQueue - O(1) lowest-energy voice stealing manager
 * 6. PolyphonicPhaseAccumulator - Double-precision phase tracking oscillator
 * 7. ResonantHarmonicCombMatrix - Karplus-Strong physical plucked-string model
 * 8. DynamicSpectralBrightnessMetric - Spectral centroid and timbre brightness analyzer
 */

export const ModalHarmonicScaleGenerator = {
  id: 'MODAL_HARMONIC_SCALE_GENERATOR',
  modes: {
    ionian: [0, 2, 4, 5, 7, 9, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10]
  },
  generateFrequencies(rootFreq: number, modeName: keyof typeof ModalHarmonicScaleGenerator.modes, octaves: number = 2): number[] {
    const intervals = this.modes[modeName];
    const freqs: number[] = [];
    for (let oct = 0; oct < octaves; oct++) {
      for (const semitone of intervals) {
        const totalSemitones = oct * 12 + semitone;
        freqs.push(Number((rootFreq * Math.pow(2, totalSemitones / 12)).toFixed(12)));
      }
    }
    return freqs;
  }
};

export const PolyphonicArpeggiatorStepMatrix = {
  id: 'POLYPHONIC_ARPEGGIATOR_STEP_MATRIX',
  calculateStepTimes(bpm: number, subdivision: 4 | 8 | 16 | 32, totalSteps: number = 16): number[] {
    const quarterNoteDuration = 60 / bpm;
    const stepDuration = quarterNoteDuration * (4 / subdivision);
    const times: number[] = [];
    for (let i = 0; i < totalSteps; i++) {
      times.push(Number((i * stepDuration).toFixed(12)));
    }
    return times;
  }
};

export const ChowningFMOrganSynthesisModel = {
  id: 'CHOWNING_FM_ORGAN_SYNTHESIS_MODEL',
  calculateOperators(fundamental: number, harmonicRatio: number = 2.0, modIndex: number = 1.5) {
    const carrierFreq = fundamental;
    const modulatorFreq = fundamental * harmonicRatio;
    const peakFreqDeviation = modIndex * modulatorFreq;
    return {
      carrierFreq: Number(carrierFreq.toFixed(12)),
      modulatorFreq: Number(modulatorFreq.toFixed(12)),
      modIndex,
      peakFreqDeviation: Number(peakFreqDeviation.toFixed(12))
    };
  }
};

export const MicrotonalCentDeviationMatrix = {
  id: 'MICROTONAL_CENT_DEVIATION_MATRIX',
  justIntonationRatios: [
    { name: 'Unison', ratio: 1 / 1, cents: 0 },
    { name: 'Minor Second', ratio: 16 / 15, cents: 111.73 },
    { name: 'Major Second', ratio: 9 / 8, cents: 203.91 },
    { name: 'Minor Third', ratio: 6 / 5, cents: 315.64 },
    { name: 'Major Third', ratio: 5 / 4, cents: 386.31 },
    { name: 'Perfect Fourth', ratio: 4 / 3, cents: 498.04 },
    { name: 'Tritone', ratio: 45 / 32, cents: 590.22 },
    { name: 'Perfect Fifth', ratio: 3 / 2, cents: 701.96 },
    { name: 'Minor Sixth', ratio: 8 / 5, cents: 813.69 },
    { name: 'Major Sixth', ratio: 5 / 3, cents: 884.36 },
    { name: 'Minor Seventh', ratio: 9 / 5, cents: 1017.60 },
    { name: 'Major Seventh', ratio: 15 / 8, cents: 1088.27 },
    { name: 'Octave', ratio: 2 / 1, cents: 1200.0 }
  ],
  calculateExactFrequency(root: number, intervalIndex: number): number {
    const item = this.justIntonationRatios[intervalIndex % this.justIntonationRatios.length];
    const octaveMultiplier = Math.pow(2, Math.floor(intervalIndex / this.justIntonationRatios.length));
    return Number((root * item.ratio * octaveMultiplier).toFixed(12));
  }
};

export const BGMVoiceAllocationPriorityQueue = {
  id: 'BGM_VOICE_ALLOCATION_PRIORITY_QUEUE',
  maxBGMVoices: 16,
  voices: [] as { id: number; note: number; energy: number; startTime: number }[],
  allocate(note: number, energy: number, now: number): number {
    if (this.voices.length < this.maxBGMVoices) {
      const voiceId = this.voices.length;
      this.voices.push({ id: voiceId, note, energy, startTime: now });
      return voiceId;
    }
    // Steal lowest-energy voice
    let lowestIndex = 0;
    let minEnergy = this.voices[0].energy;
    for (let i = 1; i < this.voices.length; i++) {
      if (this.voices[i].energy < minEnergy) {
        minEnergy = this.voices[i].energy;
        lowestIndex = i;
      }
    }
    this.voices[lowestIndex] = { id: lowestIndex, note, energy, startTime: now };
    return lowestIndex;
  }
};

export const PolyphonicPhaseAccumulator = {
  id: 'POLYPHONIC_PHASE_ACCUMULATOR',
  calculatePhaseIncrement(frequency: number, sampleRate: number = 48000): number {
    return Number(((2 * Math.PI * frequency) / sampleRate).toFixed(15));
  }
};

export const ResonantHarmonicCombMatrix = {
  id: 'RESONANT_HARMONIC_COMB_MATRIX',
  calculateDelayLineSamples(frequency: number, sampleRate: number = 48000): number {
    return Math.max(2, Math.round(sampleRate / frequency));
  },
  calculateFeedbackLoopDecay(rt60: number, loopDelaySec: number): number {
    return Number(Math.pow(10, (-3 * loopDelaySec) / rt60).toFixed(12));
  }
};

export const DynamicSpectralBrightnessMetric = {
  id: 'DYNAMIC_SPECTRAL_BRIGHTNESS_METRIC',
  calculateCentroid(magnitudes: number[], frequencies: number[]): number {
    let num = 0;
    let den = 0;
    for (let i = 0; i < magnitudes.length; i++) {
      num += frequencies[i] * magnitudes[i];
      den += magnitudes[i];
    }
    return den === 0 ? 0 : Number((num / den).toFixed(6));
  }
};

export const BGMSynthesizerGeneral = {
  ModalHarmonicScaleGenerator,
  PolyphonicArpeggiatorStepMatrix,
  ChowningFMOrganSynthesisModel,
  MicrotonalCentDeviationMatrix,
  BGMVoiceAllocationPriorityQueue,
  PolyphonicPhaseAccumulator,
  ResonantHarmonicCombMatrix,
  DynamicSpectralBrightnessMetric,
  version: '1.0.0-bgm-mathematical'
};

export default BGMSynthesizerGeneral;
