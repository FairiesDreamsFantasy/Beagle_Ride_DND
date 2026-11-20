/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Sound/DSP/Engine/Assembly/CPP/index.tsx
 * Domain: Master DSP Chain (CPP Acoustic Kernel)
 */

export interface AudioLeaseHandle {
  active: boolean;
  buffer?: Float32Array;
  release?: () => void;
}

export class SoundCPPEngine {
  public static status = "Operational";
  public static readonly domain = "DSP";
  public static readonly channelCount = 2;
  private static leasedSlots = 0;

  public static acquireSlot(): AudioLeaseHandle {
    this.leasedSlots++;
    const handle: AudioLeaseHandle = {
      active: true,
      release: () => {
        if (handle.active) {
          handle.active = false;
          this.leasedSlots = Math.max(0, this.leasedSlots - 1);
        }
      }
    };
    return handle;
  }

  public static release(handle: AudioLeaseHandle | Float32Array | null | undefined): void {
    if (!handle) return;
    if (handle instanceof Float32Array) {
      handle.fill(0);
    } else if (typeof handle.release === "function") {
      handle.release();
    } else if (handle.buffer instanceof Float32Array) {
      handle.buffer.fill(0);
      handle.active = false;
    }
  }

  public static computeRMS(samples: ArrayLike<number>): number {
    const n = samples.length;
    if (n === 0) return 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const v = samples[i];
      sumSq += v * v;
    }
    return Math.sqrt(sumSq / n);
  }

  public static applyLinearEnvelope(samples: Float32Array, startGain: number, endGain: number): Float32Array {
    const n = samples.length;
    if (n === 0) return samples;
    const inv = n > 1 ? 1 / (n - 1) : 0;
    for (let i = 0; i < n; i++) {
      const g = startGain + (endGain - startGain) * (i * inv);
      samples[i] *= g;
    }
    return samples;
  }
}
