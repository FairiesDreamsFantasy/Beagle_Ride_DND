/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { SciPyConfig, DEFAULT_SCIPY_CONFIG } from "./General/index";

/**
 * SciPy Controller.
 */
export class SciPyController {
  private config: SciPyConfig = { ...DEFAULT_SCIPY_CONFIG };

  public getStatus() {
    return { module: "SciPy", active: true, config: this.config, domain: "SPECTRAL_AUDIO_DSP" };
  }

  public hannWindowValue(index: number, windowLength: number): number {
    if (windowLength <= 1) return 1;
    return 0.5 * (1 - Math.cos((2 * Math.PI * index) / (windowLength - 1)));
  }

  public applyHannWindow(samples: Float32Array): Float32Array {
    const n = samples.length;
    if (n <= 1) return samples;
    const denom = n - 1;
    for (let i = 0; i < n; i++) {
      samples[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / denom));
    }
    return samples;
  }

  public computeSpectralCentroidHz(magnitudes: ArrayLike<number>, sampleRate: number): number {
    const binCount = magnitudes.length;
    if (binCount === 0 || sampleRate <= 0) return 0;
    const binHz = sampleRate / (binCount * 2);
    let weightedSum = 0;
    let magSum = 0;
    for (let i = 0; i < binCount; i++) {
      const m = magnitudes[i];
      if (m > 0) {
        weightedSum += m * (i * binHz);
        magSum += m;
      }
    }
    return magSum > 1e-12 ? weightedSum / magSum : 0;
  }

  public decibelsToLinear(db: number): number {
    return Math.pow(10, db / 20);
  }

  public linearToDecibels(gain: number): number {
    return gain <= 1e-9 ? -180 : 20 * Math.log10(gain);
  }
}

export const sciPyController = new SciPyController();
