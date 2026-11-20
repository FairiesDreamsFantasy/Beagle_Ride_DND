/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { SciPyConfig, DEFAULT_SCIPY_CONFIG } from "./General/index";

/**
 * SciPy Controller.
 */
export class SciPyController {
  private config: SciPyConfig = { ...DEFAULT_SCIPY_CONFIG };

  public getStatus() {
    return { module: "SciPy", active: true, config: this.config, domain: "IMAGE_FILTER_SPLINES" };
  }

  public createGaussianKernel1D(sigma: number, radius: number): Float32Array {
    const safeRadius = Math.max(0, radius | 0);
    const len = safeRadius * 2 + 1;
    const kernel = new Float32Array(len);
    const s2 = 2 * Math.max(0.1, sigma) * Math.max(0.1, sigma);
    let sum = 0;
    for (let i = -safeRadius; i <= safeRadius; i++) {
      const w = Math.exp(-(i * i) / s2);
      kernel[i + safeRadius] = w;
      sum += w;
    }
    const invSum = 1 / sum;
    for (let i = 0; i < len; i++) {
      kernel[i] *= invSum;
    }
    return kernel;
  }

  public cubicHermite(p0: number, m0: number, p1: number, m1: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * p0 +
      (t3 - 2 * t2 + t) * m0 +
      (-2 * t3 + 3 * t2) * p1 +
      (t3 - t2) * m1
    );
  }

  public bilinearSample(c00: number, c10: number, c01: number, c11: number, fx: number, fy: number): number {
    const top = c00 + (c10 - c00) * fx;
    const bottom = c01 + (c11 - c01) * fx;
    return top + (bottom - top) * fy;
  }
}

export const sciPyController = new SciPyController();
