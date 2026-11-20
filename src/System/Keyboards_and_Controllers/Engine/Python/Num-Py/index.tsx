/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { NumPyConfig, DEFAULT_NUMPY_CONFIG } from "./General/index";

/**
 * NumPy Controller.
 */
export class NumPyController {
  private config: NumPyConfig = { ...DEFAULT_NUMPY_CONFIG };

  public getStatus() {
    return { module: "NumPy", active: true, config: this.config, vectorOps: "IEEE754_2D" };
  }

  public normalizeVector2D(x: number, y: number, deadzone: number = 0.05): { x: number; y: number; magnitude: number } {
    const mag = Math.hypot(x, y);
    if (mag <= deadzone || mag === 0) {
      return { x: 0, y: 0, magnitude: 0 };
    }
    const clampedMag = mag > 1 ? 1 : mag;
    const scale = clampedMag / mag;
    return { x: x * scale, y: y * scale, magnitude: clampedMag };
  }

  public dotProduct(ax: number, ay: number, bx: number, by: number): number {
    return ax * bx + ay * by;
  }

  public exponentialFilter(prev: number, target: number, alpha: number = 0.25): number {
    const clampedAlpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
    return prev + (target - prev) * clampedAlpha;
  }
}

export const numPyController = new NumPyController();
