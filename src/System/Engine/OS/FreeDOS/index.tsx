/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { FreeDOSConfig, DEFAULT_FREEDOS_CONFIG } from "./General/index";

/**
 * FreeDOS Virtual Environment Controller.
 * Formulates deterministic 640KB conventional memory verification, 8.3 filenames, and DOS interrupt vectors.
 */
export class FreeDOSController {
  private config: FreeDOSConfig = { ...DEFAULT_FREEDOS_CONFIG };
  private conventionalMemoryBytes: number = 640 * 1024; // 655,360 bytes
  private interruptHandlers: Map<number, (ax: number, bx: number) => number> = new Map();

  public getStatus() {
    return {
      module: "FreeDOS",
      active: true,
      config: this.config,
      conventionalMemoryBytes: this.conventionalMemoryBytes,
      installedInterrupts: Array.from(this.interruptHandlers.keys())
    };
  }

  /**
   * Validates DOS 8.3 filename compliance.
   */
  public isValidDosFilename(filename: string): boolean {
    const parts = filename.toUpperCase().split(".");
    if (parts.length > 2) return false;
    const name = parts[0];
    const ext = parts[1] || "";
    if (name.length === 0 || name.length > 8) return false;
    if (ext.length > 3) return false;
    return /^[A-Z0-9_$#!%&'-]+$/.test(name) && (ext.length === 0 || /^[A-Z0-9_$#!%&'-]+$/.test(ext));
  }

  /**
   * Registers a DOS software interrupt vector (e.g. 0x21 for DOS API).
   */
  public registerInterrupt(vector: number, handler: (ax: number, bx: number) => number): void {
    this.interruptHandlers.set(vector, handler);
  }

  /**
   * Dispatches a DOS software interrupt.
   */
  public dispatchInterrupt(vector: number, ax: number, bx: number = 0): number {
    const handler = this.interruptHandlers.get(vector);
    return handler ? handler(ax, bx) : 0;
  }
}

export const freeDOSController = new FreeDOSController();
export default freeDOSController;
