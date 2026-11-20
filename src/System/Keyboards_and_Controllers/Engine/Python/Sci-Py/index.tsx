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
    return { module: "SciPy", active: true, config: this.config, domain: "SIGNAL_CONDITIONING" };
  }

  public slewRateLimit(current: number, target: number, maxDeltaPerSec: number, dtSec: number): number {
    const maxStep = Math.max(0, maxDeltaPerSec * Math.max(0, dtSec));
    const delta = target - current;
    if (delta > maxStep) return current + maxStep;
    if (delta < -maxStep) return current - maxStep;
    return target;
  }

  public applyRadialResponseCurve(
    x: number,
    y: number,
    exponent: number = 1.6,
    deadzone: number = 0.08
  ): { x: number; y: number } {
    const r = Math.hypot(x, y);
    if (r <= deadzone || r === 0) return { x: 0, y: 0 };
    const norm = Math.min(1, (r - deadzone) / (1 - deadzone));
    const curved = Math.pow(norm, exponent);
    const scale = curved / r;
    return { x: x * scale, y: y * scale };
  }

  public lowPassAxis(prev: number, target: number, cutoffHz: number, dtSec: number): number {
    if (dtSec <= 0 || cutoffHz <= 0) return target;
    const rc = 1 / (2 * Math.PI * cutoffHz);
    const alpha = dtSec / (rc + dtSec);
    return prev + alpha * (target - prev);
  }
}

export const sciPyController = new SciPyController();
