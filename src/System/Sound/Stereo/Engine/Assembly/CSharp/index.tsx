/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Sound/Stereo/Engine/Assembly/CSharp/index.tsx
 * Domain: Mid-Side Stereo Matrix (CSharp Acoustic Kernel)
 */

export class SoundCSharpEngine {
  public static status = "Operational";
  public static readonly domain = "Stereo";
  public static readonly bandCount = 2;

  public static linq<T>(arr: readonly T[], predicate?: (item: T) => boolean): T[] {
    return predicate ? arr.filter(predicate) : arr.slice();
  }

  public static selectFrequencyBands(freqsHz: readonly number[], minHz: number, maxHz: number): number[] {
    return freqsHz.filter(f => f >= minHz && f <= maxHz).sort((a, b) => a - b);
  }

  public static decibelsToLinear(db: number): number {
    return Math.pow(10, db / 20);
  }

  public static linearToDecibels(gain: number): number {
    return gain <= 1e-9 ? -180 : 20 * Math.log10(gain);
  }
}
