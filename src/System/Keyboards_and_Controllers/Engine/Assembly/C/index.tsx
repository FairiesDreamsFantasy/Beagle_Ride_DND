/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CConfig, DEFAULT_C_CONFIG } from "./General/index";

/**
 * C Controller.
 */
export class CController {
  private config: CConfig = { ...DEFAULT_C_CONFIG };

  public getStatus() {
    return { module: "C", active: true, config: this.config, fixedPoint: "Q16.16" };
  }

  public packScanCodeMask(keyCode: number, shift: boolean, ctrl: boolean, alt: boolean): number {
    let mask = keyCode & 0xFFFF;
    if (shift) mask |= 0x10000;
    if (ctrl) mask |= 0x20000;
    if (alt) mask |= 0x40000;
    return mask >>> 0;
  }

  public hasModifier(mask: number, bitOffset: number): boolean {
    return ((mask >>> 0) & (1 << (bitOffset & 31))) !== 0;
  }

  public toFixed16Axis(delta: number, sensitivity: number = 1.0): number {
    return Math.round(delta * sensitivity * 65536) | 0;
  }

  public fromFixed16Axis(fixedVal: number): number {
    return fixedVal / 65536;
  }

  public shouldAcceptEvent(nowMs: number, lastEventMs: number, debounceWindowMs: number = 40): boolean {
    return nowMs - lastEventMs >= debounceWindowMs;
  }
}

export const cController = new CController();
