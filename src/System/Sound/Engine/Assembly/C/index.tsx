/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CConfig, DEFAULT_C_CONFIG } from "./General/index";

/**
 * Mathematical Audio DSP Waveform Synthesizer (C-Virtualization Engine).
 * Generates pure mathematical sine, square, and triangle waves for zero-asset procedural audio.
 */
export class SoundAssemblyCController {
  private config: CConfig = { ...DEFAULT_C_CONFIG };

  public getStatus() {
    return { module: "SoundAssemblyC", active: true, config: this.config, pureMathActive: true };
  }

  /**
   * Generates a pure additive sine wave sample at time t.
   */
  public synthesizeSine(frequency: number, sampleRate: number, timeStep: number): number {
    return Math.sin(2 * Math.PI * frequency * timeStep);
  }

  /**
   * Generates a square wave via Fourier series summation (harmonic approximation).
   */
  public synthesizeSquare(frequency: number, sampleRate: number, timeStep: number, harmonics: number = 8): number {
    let sample = 0;
    for (let k = 1; k <= harmonics; k += 2) {
      sample += Math.sin(2 * Math.PI * k * frequency * timeStep) / k;
    }
    return (4 / Math.PI) * sample;
  }
}

export const soundAssemblyCController = new SoundAssemblyCController();
export default soundAssemblyCController;
