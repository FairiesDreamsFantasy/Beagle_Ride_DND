/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CPPConfig, DEFAULT_CPP_CONFIG } from "./General/index";

/**
 * C++ High-Performance Audio Engine.
 * Implements deterministic RAII polyphony management and Biquad filtering.
 */
export class SoundAssemblyCPPController {
  private config: CPPConfig = { ...DEFAULT_CPP_CONFIG };
  private activeVoices: Set<number> = new Set();
  private readonly MAX_VOICES = 16;
  private nextVoiceId: number = 1;

  // Direct Form I Biquad delay states
  private bqX1: number = 0;
  private bqX2: number = 0;
  private bqY1: number = 0;
  private bqY2: number = 0;

  public getStatus() {
    return { 
      module: "SoundAssemblyCPP", 
      active: true, 
      config: this.config, 
      dspMode: "BIQUAD_FILTER",
      activeVoices: this.activeVoices.size
    };
  }

  /**
   * Deterministic monotonic RAII voice allocation with FIFO stealing (O(1)).
   */
  public allocateVoice(): number {
    if (this.activeVoices.size >= this.MAX_VOICES) {
      const oldest = this.activeVoices.values().next().value;
      if (oldest !== undefined) {
        this.activeVoices.delete(oldest);
      }
    }
    const voiceId = this.nextVoiceId++;
    if (this.nextVoiceId > 0x7fffffff) {
      this.nextVoiceId = 1;
    }
    this.activeVoices.add(voiceId);
    return voiceId;
  }

  public releaseVoice(voiceId: number): void {
    this.activeVoices.delete(voiceId);
  }

  public resetFilterState(): void {
    this.bqX1 = 0;
    this.bqX2 = 0;
    this.bqY1 = 0;
    this.bqY2 = 0;
  }

  /**
   * Evaluates a linear ADSR envelope level at time t.
   */
  public evaluateADSR(t: number, attack: number, decay: number, sustain: number, release: number, duration: number): number {
    if (t < 0) return 0.0;
    if (t < attack) {
      return attack > 0 ? t / attack : 1.0;
    } else if (t < attack + decay) {
      const decayProgress = decay > 0 ? (t - attack) / decay : 1.0;
      return 1.0 - (1.0 - sustain) * decayProgress;
    } else if (t < duration) {
      return sustain;
    } else if (t < duration + release) {
      const releaseProgress = release > 0 ? (t - duration) / release : 1.0;
      return Math.max(0, sustain * (1.0 - releaseProgress));
    }
    return 0.0;
  }

  /**
   * Stateful Direct Form I 2-pole Biquad lowpass filter step (Audio EQ Cookbook).
   */
  public processBiquadLowpass(sample: number, cutoffHz: number, sampleRate: number, q: number = 0.707): number {
    const safeSr = Math.max(8000, sampleRate);
    const clampedFc = Math.max(20, Math.min(safeSr * 0.45, cutoffHz));
    const safeQ = Math.max(0.1, q);

    const w0 = (2 * Math.PI * clampedFc) / safeSr;
    const cosw0 = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * safeQ);

    const a0Inv = 1.0 / (1.0 + alpha);
    const b0 = ((1.0 - cosw0) * 0.5) * a0Inv;
    const b1 = (1.0 - cosw0) * a0Inv;
    const b2 = b0;
    const a1 = (-2.0 * cosw0) * a0Inv;
    const a2 = (1.0 - alpha) * a0Inv;

    const y0 = b0 * sample + b1 * this.bqX1 + b2 * this.bqX2 - a1 * this.bqY1 - a2 * this.bqY2;
    this.bqX2 = this.bqX1;
    this.bqX1 = sample;
    this.bqY2 = this.bqY1;
    this.bqY1 = y0;
    return y0;
  }
}

export const soundAssemblyCPPController = new SoundAssemblyCPPController();
export default soundAssemblyCPPController;
