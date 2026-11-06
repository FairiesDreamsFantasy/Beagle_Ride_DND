/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { NumPyConfig, DEFAULT_NUMPY_CONFIG } from "./General/index";

/**
 * NumPy Vectorized Audio Mathematical Controller.
 * Implements vectorized array generators, trigonometric waves, and spectral analysis for procedural audio.
 */
export class SoundNumPyController {
  private config: NumPyConfig = { ...DEFAULT_NUMPY_CONFIG };

  public getStatus() {
    return { module: "SoundNumPy", active: true, config: this.config, vectorEngine: "NUMPY_ARRAY_MATH" };
  }

  /**
   * Generates an array of evenly spaced values (np.linspace).
   */
  public linspace(start: number, stop: number, num: number): Float32Array {
    const result = new Float32Array(num);
    const step = num > 1 ? (stop - start) / (num - 1) : 0;
    for (let i = 0; i < num; i++) {
      result[i] = start + step * i;
    }
    return result;
  }

  /**
   * Computes element-wise sine on an array (np.sin).
   */
  public sin(arr: Float32Array): Float32Array {
    const result = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      result[i] = Math.sin(arr[i]);
    }
    return result;
  }

  /**
   * Computes root-mean-square amplitude (np.sqrt(np.mean(arr**2))).
   */
  public rms(arr: Float32Array): number {
    let sumSq = 0;
    for (let i = 0; i < arr.length; i++) {
      sumSq += arr[i] * arr[i];
    }
    return Math.sqrt(sumSq / (arr.length || 1));
  }
}

export const soundNumPyController = new SoundNumPyController();
export default soundNumPyController;
