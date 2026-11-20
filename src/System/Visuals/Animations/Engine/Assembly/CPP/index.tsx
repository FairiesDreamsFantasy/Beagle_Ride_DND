/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ramUnit } from '../../../../../Hardware_Virtualization/RAM/index';

export interface ScopedBufferLease {
  buffer: Uint32Array;
  release: () => void;
}

const F32_SCRATCH = new Float32Array(1);
const U32_SCRATCH = new Uint32Array(F32_SCRATCH.buffer);

/**
 * C++-Style RAII Resource Scoper & IEEE-754 Low-Level Bitwise Numerical Kernels.
 */
export class CPPEngine {
  public static status = "Operational";

  /**
   * Acquires a RAII-leased Uint32Array from ramUnit with deterministic release().
   */
  public static acquireScopedUint32(length: number): ScopedBufferLease {
    const buffer = ramUnit.acquireUint32(length);
    let released = false;
    return {
      buffer,
      release: () => {
        if (!released) {
          released = true;
          ramUnit.releaseUint32(buffer);
        }
      }
    };
  }

  /**
   * Classic IEEE-754 single-precision bit-hack fast inverse square root (1 / sqrt(x))
   * with two Newton-Raphson refinement steps.
   */
  public static fastInvSqrt(x: number): number {
    if (x <= 0) return 0;
    const halfX = 0.5 * x;
    F32_SCRATCH[0] = x;
    let i = U32_SCRATCH[0];
    i = 0x5f3759df - (i >> 1);
    U32_SCRATCH[0] = i;
    let y = F32_SCRATCH[0];
    y = y * (1.5 - halfX * y * y);
    y = y * (1.5 - halfX * y * y);
    return y;
  }

  /**
   * Deterministic span fill over a contiguous Uint32Array segment.
   */
  public static fillSpan32(target: Uint32Array, start: number, end: number, color32: number): void {
    const s = start < 0 ? 0 : start;
    const e = end > target.length ? target.length : end;
    if (s < e) {
      target.fill(color32, s, e);
    }
  }

  public static release(lease: ScopedBufferLease | Uint32Array | null | undefined): void {
    if (!lease) return;
    if (lease instanceof Uint32Array) {
      ramUnit.releaseUint32(lease);
    } else if (typeof lease.release === 'function') {
      lease.release();
    }
  }
}
