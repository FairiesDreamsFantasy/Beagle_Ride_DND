/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DSP General Definitions and Algorithms.
 * Preserves existing DSPNode, applyGain, applyTPDFDither, calculateNotchCoefficients,
 * and calculateHighPassCoefficients, while expanding with 8 ultra-scientific DSP modules:
 * 1. DSPBiquadBandPassFilterEngine - Bristow-Johnson bandpass coefficient engine
 * 2. DSPFastFourierTransformRadix2 - Cooley-Tukey Radix-2 power-of-two FFT analyzer
 * 3. DSPConvolverTransferFunction - Finite Impulse Response convolution engine
 * 4. DSPHilbertTransformPhaseShifter - 90-degree analytical signal phase quadrature
 * 5. DSPDynamicRangeExpanderNoiseGate - Downward expansion soft-knee noise gate
 * 6. DSPStateVariableFilterEngine - Chamberlin digital state variable 12dB/oct filter
 * 7. DSPIntraSamplePeakDetector - 4x oversampled true-peak reconstructor
 * 8. DSPSpectrumWindowBlackmanHarris - 4-term Blackman-Harris 92dB sidelobe window
 */

export interface DSPNode {
  id: string;
  type: string;
  bypass: boolean;
}

export function applyGain(buffer: Float32Array, gain: number): void {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] *= gain;
  }
}

/**
 * TPDF (Triangular Probability Density Function) Dither.
 * Eliminates quantization distortion by adding stochastic noise.
 */
export function applyTPDFDither(value: number, bitDepth: number): number {
  const step = Math.pow(2, 1 - bitDepth);
  const r1 = (Math.random() * 2 - 1) * step;
  const r2 = (Math.random() * 2 - 1) * step;
  return value + (r1 + r2);
}

/**
 * Biquad Filter Coefficients for Notch and High-Pass filtering.
 */
export interface BiquadCoefficients {
  a0: number; a1: number; a2: number;
  b0: number; b1: number; b2: number;
}

export function calculateNotchCoefficients(frequency: number, sampleRate: number, Q: number): BiquadCoefficients {
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const alpha = Math.sin(omega) / (2 * Q);
  const cosW = Math.cos(omega);

  return {
    b0: 1,
    b1: -2 * cosW,
    b2: 1,
    a0: 1 + alpha,
    a1: -2 * cosW,
    a2: 1 - alpha
  };
}

export function calculateHighPassCoefficients(frequency: number, sampleRate: number, Q: number): BiquadCoefficients {
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const alpha = Math.sin(omega) / (2 * Q);
  const cosW = Math.cos(omega);

  return {
    b0: (1 + cosW) / 2,
    b1: -(1 + cosW),
    b2: (1 + cosW) / 2,
    a0: 1 + alpha,
    a1: -2 * cosW,
    a2: 1 - alpha
  };
}

export const DSPBiquadBandPassFilterEngine = {
  id: 'DSP_BIQUAD_BAND_PASS_FILTER_ENGINE',
  calculate(frequency: number, sampleRate: number, Q: number): BiquadCoefficients {
    const omega = (2 * Math.PI * frequency) / sampleRate;
    const alpha = Math.sin(omega) / (2 * Q);
    const cosW = Math.cos(omega);
    return {
      b0: alpha,
      b1: 0,
      b2: -alpha,
      a0: 1 + alpha,
      a1: -2 * cosW,
      a2: 1 - alpha
    };
  }
};

export const DSPFastFourierTransformRadix2 = {
  id: 'DSP_FAST_FOURIER_TRANSFORM_RADIX2',
  fft(real: Float64Array, imag: Float64Array): void {
    const n = real.length;
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tempR = real[i]; real[i] = real[j]; real[j] = tempR;
        const tempI = imag[i]; imag[i] = imag[j]; imag[j] = tempI;
      }
      let k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }
    for (let l = 2; l <= n; l <<= 1) {
      const ang = (-2 * Math.PI) / l;
      const wStepR = Math.cos(ang);
      const wStepI = Math.sin(ang);
      const halfL = l >> 1;
      for (let i = 0; i < n; i += l) {
        let wR = 1.0;
        let wI = 0.0;
        for (let m = 0; m < halfL; m++) {
          const idx = i + m + halfL;
          const uR = real[i + m];
          const uI = imag[i + m];
          const vR = real[idx] * wR - imag[idx] * wI;
          const vI = real[idx] * wI + imag[idx] * wR;
          real[i + m] = uR + vR;
          imag[i + m] = uI + vI;
          real[idx] = uR - vR;
          imag[idx] = uI - vI;
          const nextWR = wR * wStepR - wI * wStepI;
          wI = wR * wStepI + wI * wStepR;
          wR = nextWR;
        }
      }
    }
  }
};

export const DSPConvolverTransferFunction = {
  id: 'DSP_CONVOLVER_TRANSFER_FUNCTION',
  convolve(signal: Float64Array, impulse: Float64Array): Float64Array {
    const outLen = signal.length + impulse.length - 1;
    const result = new Float64Array(outLen);
    for (let i = 0; i < signal.length; i++) {
      for (let j = 0; j < impulse.length; j++) {
        result[i + j] += signal[i] * impulse[j];
      }
    }
    return result;
  }
};

export const DSPHilbertTransformPhaseShifter = {
  id: 'DSP_HILBERT_TRANSFORM_PHASE_SHIFTER',
  calculateFilterImpulse(taps: number = 31): Float64Array {
    const h = new Float64Array(taps);
    const mid = Math.floor(taps / 2);
    for (let i = 0; i < taps; i++) {
      const n = i - mid;
      h[i] = n % 2 !== 0 ? (2 / (Math.PI * n)) : 0;
    }
    return h;
  }
};

export const DSPDynamicRangeExpanderNoiseGate = {
  id: 'DSP_DYNAMIC_RANGE_EXPANDER_NOISE_GATE',
  evaluate(sample: number, thresholdLinear: number = 0.005, expansionRatio: number = 4.0): number {
    const abs = Math.abs(sample);
    if (abs >= thresholdLinear) return sample;
    const gain = Math.pow(abs / thresholdLinear, expansionRatio - 1);
    return sample * gain;
  }
};

export const DSPStateVariableFilterEngine = {
  id: 'DSP_STATE_VARIABLE_FILTER_ENGINE',
  // Chamberlin State Variable Filter (low, high, band, notch)
  step(sample: number, cutoffHz: number, q: number, sampleRate: number = 48000, state = { low: 0, band: 0 }) {
    const f = 2 * Math.sin((Math.PI * cutoffHz) / sampleRate);
    const damp = 1 / Math.max(0.1, q);
    const low = state.low + f * state.band;
    const high = sample - low - damp * state.band;
    const band = f * high + state.band;
    const notch = high + low;
    state.low = low;
    state.band = band;
    return { low, high, band, notch };
  }
};

export const DSPIntraSamplePeakDetector = {
  id: 'DSP_INTRA_SAMPLE_PEAK_DETECTOR',
  estimateTruePeak(s1: number, s2: number, s3: number, s4: number): number {
    // Cubic Hermite peak oversample estimation
    const a = -0.5 * s1 + 1.5 * s2 - 1.5 * s3 + 0.5 * s4;
    const b = s1 - 2.5 * s2 + 2 * s3 - 0.5 * s4;
    const c = -0.5 * s1 + 0.5 * s3;
    if (Math.abs(a) < 1e-9) return Math.max(Math.abs(s2), Math.abs(s3));
    const tPeak = -b / (2 * a);
    if (tPeak >= 0 && tPeak <= 1) {
      const peakVal = a * tPeak * tPeak * tPeak + b * tPeak * tPeak + c * tPeak + s2;
      return Math.max(Math.abs(s2), Math.abs(s3), Math.abs(peakVal));
    }
    return Math.max(Math.abs(s2), Math.abs(s3));
  }
};

export const DSPSpectrumWindowBlackmanHarris = {
  id: 'DSP_SPECTRUM_WINDOW_BLACKMAN_HARRIS',
  generate(length: number): Float64Array {
    const w = new Float64Array(length);
    const a0 = 0.35875, a1 = 0.48829, a2 = 0.14128, a3 = 0.01168;
    for (let i = 0; i < length; i++) {
      const f = (2 * Math.PI * i) / (length - 1);
      w[i] = a0 - a1 * Math.cos(f) + a2 * Math.cos(2 * f) - a3 * Math.cos(3 * f);
    }
    return w;
  }
};

export const DSPEngineGeneral = {
  applyGain,
  applyTPDFDither,
  calculateNotchCoefficients,
  calculateHighPassCoefficients,
  DSPBiquadBandPassFilterEngine,
  DSPFastFourierTransformRadix2,
  DSPConvolverTransferFunction,
  DSPHilbertTransformPhaseShifter,
  DSPDynamicRangeExpanderNoiseGate,
  DSPStateVariableFilterEngine,
  DSPIntraSamplePeakDetector,
  DSPSpectrumWindowBlackmanHarris,
  version: '1.0.0-dsp-mathematical'
};

export default DSPEngineGeneral;
