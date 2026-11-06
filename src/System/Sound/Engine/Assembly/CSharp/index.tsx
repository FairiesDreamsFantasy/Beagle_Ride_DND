/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CSharpConfig, DEFAULT_CSHARP_CONFIG } from "./General/index";

export interface AudioVoiceChannel {
  voiceId: number;
  frequency: number;
  gain: number;
  pan: number;
  isActive: boolean;
}

/**
 * C# Audio Channel Bus & Polyphonic Mixer.
 * Implements strongly-typed voice slot allocation and master mix summation.
 */
export class SoundAssemblyCSharpController {
  private config: CSharpConfig = { ...DEFAULT_CSHARP_CONFIG };
  private voiceSlots: AudioVoiceChannel[] = [];
  private readonly MAX_VOICES = 16;

  constructor() {
    for (let i = 0; i < this.MAX_VOICES; i++) {
      this.voiceSlots.push({
        voiceId: i,
        frequency: 440,
        gain: 0,
        pan: 0,
        isActive: false
      });
    }
  }

  public getStatus() {
    return { 
      module: "SoundAssemblyCSharp", 
      active: true, 
      config: this.config,
      activeVoiceCount: this.voiceSlots.filter(v => v.isActive).length,
      maxVoices: this.MAX_VOICES
    };
  }

  public allocateVoice(freq: number, gain: number, pan: number = 0): number {
    for (let i = 0; i < this.MAX_VOICES; i++) {
      if (!this.voiceSlots[i].isActive) {
        this.voiceSlots[i].frequency = freq;
        this.voiceSlots[i].gain = gain;
        this.voiceSlots[i].pan = Math.max(-1, Math.min(1, pan));
        this.voiceSlots[i].isActive = true;
        return i;
      }
    }
    return -1; // Clamped
  }

  public freeVoice(voiceId: number): void {
    if (voiceId >= 0 && voiceId < this.MAX_VOICES) {
      this.voiceSlots[voiceId].isActive = false;
      this.voiceSlots[voiceId].gain = 0;
    }
  }

  public mixActiveVoices(): { left: number; right: number } {
    let sumL = 0;
    let sumR = 0;
    for (let i = 0; i < this.MAX_VOICES; i++) {
      const v = this.voiceSlots[i];
      if (v.isActive && v.gain > 0) {
        const panL = (1 - v.pan) * 0.5;
        const panR = (1 + v.pan) * 0.5;
        sumL += v.gain * panL;
        sumR += v.gain * panR;
      }
    }
    return { left: Math.min(1.0, sumL), right: Math.min(1.0, sumR) };
  }
}

export const soundAssemblyCSharpController = new SoundAssemblyCSharpController();
export default soundAssemblyCSharpController;
