/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CConfig, DEFAULT_C_CONFIG } from "./General/index";

/**
 * High-Performance Sound C-Engine.
 * Implements fixed-point additive synthesis and raw buffer interleaving.
 */
export class SoundAssemblyCController {
  private config: CConfig = { ...DEFAULT_C_CONFIG };

  public getStatus() {
    return { module: "SoundAssemblyC", active: true, config: this.config, pureMathActive: true };
  }

  /**
   * Interleaves separate Left/Right channels into a single stereophonic buffer (O(n)).
   */
  public interleave(left: Float32Array, right: Float32Array): Float32Array {
    const len = left.length;
    const result = new Float32Array(len * 2);
    for (let i = 0; i < len; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
    return result;
  }

  /**
   * Fast fixed-point volume gain application (O(n)).
   */
  public applyGain(buffer: Float32Array, gain: number): void {
    const fixedGain = (gain * 65536) | 0;
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = ((buffer[i] * fixedGain) >> 16);
    }
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
