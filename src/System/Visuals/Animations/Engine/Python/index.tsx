/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Scientific Vectorized Array Kernels (NumPy/SciPy-aligned in-place typed math).
 * Operates strictly on pre-allocated destination TypedArrays so 0 heap allocations occur per frame.
 */
export class PythonEngine {
  public static status = "Operational";

  public static linspaceInto(target: Float32Array, start: number, end: number): Float32Array {
    const n = target.length;
    if (n === 0) return target;
    if (n === 1) {
      target[0] = start;
      return target;
    }
    const step = (end - start) / (n - 1);
    for (let i = 0; i < n; i++) {
      target[i] = start + i * step;
    }
    return target;
  }

  public static dotFloat32(a: Float32Array, b: Float32Array): number {
    const n = Math.min(a.length, b.length);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      acc += a[i] * b[i];
    }
    return acc;
  }

  public static clampIntoFloat32(source: Float32Array, target: Float32Array, minVal: number, maxVal: number): void {
    const n = Math.min(source.length, target.length);
    for (let i = 0; i < n; i++) {
      const v = source[i];
      target[i] = v < minVal ? minVal : (v > maxVal ? maxVal : v);
    }
  }

  public static emaStep(prev: number, sample: number, alpha: number): number {
    const a = alpha < 0 ? 0 : (alpha > 1 ? 1 : alpha);
    return prev * (1 - a) + sample * a;
  }
}
