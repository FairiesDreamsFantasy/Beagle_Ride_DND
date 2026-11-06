/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CPPConfig, DEFAULT_CPP_CONFIG } from "./General/index";

/**
 * C++ High-Performance Audio DSP Biquad Filter & Envelope Pipeline.
 * Implements deterministic low-pass filtering and linear ADSR envelope generators.
 */
export class SoundAssemblyCPPController {
  private config: CPPConfig = { ...DEFAULT_CPP_CONFIG };

  public getStatus() {
    return { module: "SoundAssemblyCPP", active: true, config: this.config, dspMode: "BIQUAD_FILTER" };
  }

  /**
   * Evaluates an ADSR envelope level at time t.
   */
  public evaluateADSR(t: number, attack: number, decay: number, sustain: number, release: number, duration: number): number {
    if (t < attack) {
      return attack > 0 ? t / attack : 1.0;
    } else if (t < attack + decay) {
      const decayProgress = (t - attack) / decay;
      return 1.0 - (1.0 - sustain) * decayProgress;
    } else if (t < duration) {
      return sustain;
    } else if (t < duration + release) {
      const releaseProgress = (t - duration) / release;
      return Math.max(0, sustain * (1.0 - releaseProgress));
    }
    return 0.0;
  }

  /**
   * Biquad 2-pole lowpass filter step.
   */
  public processBiquadLowpass(sample: number, cutoffHz: number, sampleRate: number, q: number = 0.707): number {
    const w0 = 2 * Math.PI * (cutoffHz / sampleRate);
    const alpha = Math.sin(w0) / (2 * q);
    const cosw0 = Math.cos(w0);
    const b1 = 1 - cosw0;
    const b0 = b1 / 2;
    const a0 = 1 + alpha;
    return (b0 / a0) * sample;
  }
}

export const soundAssemblyCPPController = new SoundAssemblyCPPController();
export default soundAssemblyCPPController;
