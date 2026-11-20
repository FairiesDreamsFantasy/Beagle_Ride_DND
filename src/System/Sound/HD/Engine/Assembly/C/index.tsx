/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Sound/HD/Engine/Assembly/C/index.tsx
 * Domain: HD 24-bit Quantizer (C Acoustic Kernel)
 */

export class SoundCEngine {
  public static status = "Operational";
  public static readonly domain = "HD";
  public static readonly referenceHz = 48000;
  public static readonly dcPole = 0.998;

  public static process(samples: Float32Array, gain: number = 1.0): Float32Array {
    let prevX = 0;
    let prevY = 0;
    const pole = this.dcPole;
    for (let i = 0; i < samples.length; i++) {
      const x = samples[i];
      const dcClean = x - prevX + pole * prevY;
      prevX = x;
      prevY = dcClean;
      samples[i] = Math.tanh(dcClean * gain);
    }
    return samples;
  }

  public static floatToPcm16(sample: number): number {
    const clamped = sample < -1 ? -1 : sample > 1 ? 1 : sample;
    return (clamped * 32767) | 0;
  }

  public static pcm16ToFloat(pcm16: number): number {
    return (pcm16 | 0) / 32768;
  }

  public static computePeakAbs(samples: ArrayLike<number>): number {
    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const a = samples[i] < 0 ? -samples[i] : samples[i];
      if (a > peak) peak = a;
    }
    return peak;
  }
}
