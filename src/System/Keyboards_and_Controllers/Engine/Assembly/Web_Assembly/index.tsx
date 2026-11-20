/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { WebAssemblyConfig, DEFAULT_WEBASSEMBLY_CONFIG } from "./General/index";

/**
 * WebAssembly Controller.
 */
export class WebAssemblyController {
  private config: WebAssemblyConfig = { ...DEFAULT_WEBASSEMBLY_CONFIG };

  public getStatus() {
    return { module: "WebAssembly", active: true, config: this.config, packetEncoding: "UINT32_INPUT_FRAME" };
  }

  public packInputPacket32(scanCode: number, modifiers: number, pressed: boolean): number {
    return (((pressed ? 1 : 0) << 24) | ((modifiers & 0xFF) << 16) | (scanCode & 0xFFFF)) >>> 0;
  }

  public unpackScanCode(packet32: number): number {
    return packet32 & 0xFFFF;
  }

  public unpackModifiers(packet32: number): number {
    return (packet32 >>> 16) & 0xFF;
  }

  public isPacketPressed(packet32: number): boolean {
    return ((packet32 >>> 24) & 1) === 1;
  }

  public shouldTriggerRepeat(heldMs: number, lastRepeatMs: number, initialDelayMs: number = 250, intervalMs: number = 60): boolean {
    if (heldMs < initialDelayMs) return false;
    return (heldMs - lastRepeatMs) >= intervalMs;
  }
}

export const webAssemblyController = new WebAssemblyController();
