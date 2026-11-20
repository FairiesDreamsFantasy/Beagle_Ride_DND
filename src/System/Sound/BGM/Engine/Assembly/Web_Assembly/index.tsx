/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Sound/BGM/Engine/Assembly/Web_Assembly/index.tsx
 * Domain: BGM Sequencer (WebAssembly Acoustic Kernel)
 */

export class SoundWebAssemblyEngine {
  public static status = "Operational";
  public static readonly domain = "BGM";
  public static readonly wasmPageBytes = 65536;

  public static computePageCount(sampleCount: number, bytesPerSample: number = 4): number {
    const totalBytes = Math.max(0, sampleCount | 0) * Math.max(1, bytesPerSample | 0);
    return Math.max(1, Math.ceil(totalBytes / this.wasmPageBytes));
  }

  public static packStereoFrame32(leftNorm: number, rightNorm: number): number {
    const l = Math.max(-32768, Math.min(32767, (leftNorm * 32767) | 0)) & 0xFFFF;
    const r = Math.max(-32768, Math.min(32767, (rightNorm * 32767) | 0)) & 0xFFFF;
    return ((r << 16) | l) >>> 0;
  }

  public static mixScaledInto(dest: Float32Array, src: Float32Array, gain: number): number {
    const len = Math.min(dest.length, src.length);
    for (let i = 0; i < len; i++) {
      dest[i] += src[i] * gain;
    }
    return len;
  }
}
