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
    return { module: "SciPy", active: true, config: this.config, solvers: ["TRAPEZOIDAL", "RK4", "LERP"] };
  }

  public trapezoidalIntegrate(samples: ArrayLike<number>, dx: number): number {
    const n = samples.length;
    if (n < 2) return 0;
    let sum = 0.5 * (samples[0] + samples[n - 1]);
    for (let i = 1; i < n - 1; i++) {
      sum += samples[i];
    }
    return sum * dx;
  }

  public rk4Step(y: number, t: number, dt: number, derivative: (state: number, time: number) => number): number {
    const halfDt = dt * 0.5;
    const k1 = derivative(y, t);
    const k2 = derivative(y + halfDt * k1, t + halfDt);
    const k3 = derivative(y + halfDt * k2, t + halfDt);
    const k4 = derivative(y + dt * k3, t + dt);
    return y + (dt / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4);
  }

  public linearInterpolate(x0: number, y0: number, x1: number, y1: number, x: number): number {
    const span = x1 - x0;
    if (Math.abs(span) < 1e-12) return y0;
    return y0 + ((y1 - y0) * (x - x0)) / span;
  }
}

export const sciPyController = new SciPyController();
