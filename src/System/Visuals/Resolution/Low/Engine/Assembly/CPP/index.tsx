/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Visuals/Resolution/Low/Engine/Assembly/CPP/index.tsx
 * Domain: Low-Power 16:9 Viewport (CPP Kernel)
 */

export interface ScopedResource {
  released?: boolean;
  release?: () => void;
}

export class CPPEngine {
  public static status = "Operational";
  public static readonly domain = "Visuals/Resolution/Low";
  public static readonly minBound = 180;
  public static readonly maxBound = 320;

  public static release(obj: ScopedResource | Uint8Array | Uint32Array | Float32Array | null | undefined): void {
    if (!obj) return;
    if (obj instanceof Uint8Array || obj instanceof Uint32Array || obj instanceof Float32Array) {
      obj.fill(0);
    } else {
      if (typeof obj.release === "function") {
        obj.release();
      }
      obj.released = true;
    }
  }

  public static clampRange(val: number, minVal: number = this.minBound, maxVal: number = this.maxBound): number {
    return val < minVal ? minVal : val > maxVal ? maxVal : val;
  }

  public static computeReciprocalSafe(val: number): number {
    return Math.abs(val) < 1e-9 ? 0 : 1.0 / val;
  }
}
