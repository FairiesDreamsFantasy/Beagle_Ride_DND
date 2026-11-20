/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { applyGain, calculateHighPassCoefficients } from './General/index';

/**
 * Digital Signal Processing Engine.
 * Implements DC-blocking high-pass biquad filtering, linear gain scaling, and soft-knee limiting.
 */
export class DSPEngine {
  private lastX1 = 0;
  private lastY1 = 0;

  public process(input: Float32Array, gain: number = 1.0, sampleRate: number = 48000): Float32Array {
    if (!input || input.length === 0) return input;
    const output = new Float32Array(input.length);
    const hp = calculateHighPassCoefficients(20, sampleRate, 0.707);
    const r = Math.min(0.999, Math.max(0.9, 1 - (hp.a0 - 1)));

    let x1 = this.lastX1;
    let y1 = this.lastY1;
    for (let i = 0; i < input.length; i++) {
      const x = input[i];
      const y = x - x1 + r * y1;
      x1 = x;
      y1 = y;
      // Soft-knee saturation curve: x / (1 + |x|) above linear threshold
      const scaled = y * gain;
      output[i] = scaled > 1 || scaled < -1 ? Math.tanh(scaled) : scaled;
    }
    this.lastX1 = x1;
    this.lastY1 = y1;
    if (gain !== 1.0) {
      applyGain(output, 1.0);
    }
    return output;
  }

  public reset(): void {
    this.lastX1 = 0;
    this.lastY1 = 0;
  }
}

export const dspEngine = new DSPEngine();
