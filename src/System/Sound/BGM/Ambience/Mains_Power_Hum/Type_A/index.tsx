/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Sound/BGM/Ambience/Mains_Power_Hum/Type_A/index.tsx
 * Ultra-Scientific Type-A Industrial Transformer Real-Time Synthesizer (5000^1000000% Factor)
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './General/index';
import { TypeAGeneralConfig, TypeATransformerResonanceModel } from './General/index';

/**
 * Type-A Transformer Audio Synthesizer Controller.
 */
export class TypeAMainsHumController {
  private audioCtx: AudioContext | null = null;
  private fundamentalOsc: OscillatorNode | null = null;
  private harmonicOsc: OscillatorNode | null = null;
  private bandpassFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    return this.audioCtx;
  }

  /**
   * Starts parametric synthesis of Type-A transformer acoustics.
   */
  public start(volume: number = 0.15): boolean {
    if (this.isRunning) return true;
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // 1. 60Hz Fundamental & 120Hz Magnetostriction Oscillators
    this.fundamentalOsc = ctx.createOscillator();
    this.fundamentalOsc.type = 'sine';
    this.fundamentalOsc.frequency.setValueAtTime(60.0, ctx.currentTime);

    this.harmonicOsc = ctx.createOscillator();
    this.harmonicOsc.type = 'sawtooth';
    this.harmonicOsc.frequency.setValueAtTime(120.0, ctx.currentTime);

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.35, ctx.currentTime);

    // 2. Transformer Enclosure Bandpass Filter
    const peakRes = TypeATransformerResonanceModel.calculatePeakResonance(TypeAGeneralConfig.leakageInductancemH, 2.2);
    this.bandpassFilter = ctx.createBiquadFilter();
    this.bandpassFilter.type = 'bandpass';
    this.bandpassFilter.frequency.setValueAtTime(Math.min(800, peakRes), ctx.currentTime);
    this.bandpassFilter.Q.setValueAtTime(3.5, ctx.currentTime);

    // 3. Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 1.0);

    // Connect graph
    this.fundamentalOsc.connect(this.masterGain);
    this.harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(this.bandpassFilter);
    this.bandpassFilter.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    this.fundamentalOsc.start();
    this.harmonicOsc.start();
    this.isRunning = true;

    return true;
  }

  /**
   * Stops Type-A transformer hum synthesis.
   */
  public stop(fadeSec: number = 0.5): void {
    if (!this.isRunning || !this.masterGain || !this.audioCtx) return;

    const ctx = this.audioCtx;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fadeSec);

    setTimeout(() => {
      try {
        this.fundamentalOsc?.stop();
        this.fundamentalOsc?.disconnect();
        this.harmonicOsc?.stop();
        this.harmonicOsc?.disconnect();
        this.bandpassFilter?.disconnect();
        this.masterGain?.disconnect();
      } catch {
        // Safe disposal
      }
      this.isRunning = false;
    }, fadeSec * 1000 + 50);
  }

  public getStatus(): { isRunning: boolean; config: typeof TypeAGeneralConfig } {
    return {
      isRunning: this.isRunning,
      config: TypeAGeneralConfig
    };
  }
}

export const typeAMainsHumController = new TypeAMainsHumController();
