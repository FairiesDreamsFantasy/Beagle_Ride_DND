/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CSharpConfig, DEFAULT_CSHARP_CONFIG } from "./General/index";

/**
 * CSharp Controller.
 */
export class CSharpController {
  private config: CSharpConfig = { ...DEFAULT_CSHARP_CONFIG };

  public getStatus() {
    return { module: "CSharp", active: true, config: this.config, pipeline: "MANAGED_INPUT_LINQ" };
  }

  public resolveDeadzone(rawAxis: number, deadzone: number = 0.08): number {
    const abs = rawAxis < 0 ? -rawAxis : rawAxis;
    if (abs <= deadzone) return 0;
    const clampedZone = Math.min(0.95, Math.max(0, deadzone));
    const scaled = (abs - clampedZone) / (1 - clampedZone);
    return (rawAxis < 0 ? -scaled : scaled);
  }

  public mapNormalizedAxis(rawValue: number, minVal: number, maxVal: number): number {
    const span = maxVal - minVal;
    if (Math.abs(span) < 1e-9) return 0;
    const norm = ((rawValue - minVal) / span) * 2 - 1;
    return norm < -1 ? -1 : norm > 1 ? 1 : norm;
  }

  public queryActiveBindings<T extends { enabled: boolean; priority: number }>(bindings: readonly T[]): T[] {
    return bindings.filter(b => b.enabled).sort((a, b) => b.priority - a.priority);
  }
}

export const cSharpController = new CSharpController();
