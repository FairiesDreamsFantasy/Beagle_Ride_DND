/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Sound/Surround_Sound/Engine/Python/index.tsx
 * Domain: VBAP Surround Panner (Python Acoustic Kernel)
 */

export class SoundPythonEngine {
  public static status = "Operational";
  public static readonly domain = "Surround_Sound";
  public static readonly defaultSampleRate = 48000;

  public static hannWindowInto(out: Float32Array): Float32Array {
    const n = out.length;
    if (n <= 1) {
      if (n === 1) out[0] = 1.0;
      return out;
    }
    const denom = n - 1;
    for (let i = 0; i < n; i++) {
      out[i] = 0.5 * (1.0 - Math.cos((2.0 * Math.PI * i) / denom));
    }
    return out;
  }

  public static midiToFreqHz(midiNote: number, a4Hz: number = 600): number {
    return a4Hz * Math.pow(2, (midiNote - 69) / 12);
  }

  public static equalPowerPan(pan: number): { left: number; right: number } {
    const clamped = pan < -1 ? -1 : pan > 1 ? 1 : pan;
    const theta = (clamped + 1) * (Math.PI * 0.25);
    return { left: Math.cos(theta), right: Math.sin(theta) };
  }
}
