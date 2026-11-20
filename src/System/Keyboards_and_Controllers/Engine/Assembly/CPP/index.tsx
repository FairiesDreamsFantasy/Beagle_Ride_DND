/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CPPConfig, DEFAULT_CPP_CONFIG } from "./General/index";

/**
 * CPP Controller.
 */
export class CPPController {
  private config: CPPConfig = { ...DEFAULT_CPP_CONFIG };
  private activeKeys: Map<number, number> = new Map();

  public getStatus() {
    return { module: "CPP", active: true, config: this.config, heldKeyCount: this.activeKeys.size };
  }

  public registerKeyDown(keyCode: number, timestampMs: number): boolean {
    if (this.activeKeys.has(keyCode)) return false;
    this.activeKeys.set(keyCode, timestampMs);
    return true;
  }

  public registerKeyUp(keyCode: number): number {
    const start = this.activeKeys.get(keyCode);
    this.activeKeys.delete(keyCode);
    return start ?? -1;
  }

  public isKeyHeld(keyCode: number): boolean {
    return this.activeKeys.has(keyCode);
  }

  public getHoldDurationMs(keyCode: number, nowMs: number): number {
    const start = this.activeKeys.get(keyCode);
    return start === undefined ? 0 : Math.max(0, nowMs - start);
  }

  public releaseAll(): void {
    this.activeKeys.clear();
  }
}

export const cPPController = new CPPController();
