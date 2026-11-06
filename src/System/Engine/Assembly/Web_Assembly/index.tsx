/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { WebAssemblyConfig, DEFAULT_WEBASSEMBLY_CONFIG } from "./General/index";

/**
 * WebAssembly Virtual Machine & Linear Memory Controller.
 * Formulates deterministic page-aligned linear memory views and fast byte copies.
 */
export class WebAssemblyController {
  private config: WebAssemblyConfig = { ...DEFAULT_WEBASSEMBLY_CONFIG };
  private memoryPageSize: number = 65536; // 64KiB WASM Page Standard
  private linearMemory: WebAssembly.Memory | null = null;

  public getStatus() {
    return {
      module: "WebAssembly",
      active: true,
      config: this.config,
      pageSize: this.memoryPageSize,
      hasNativeWasm: typeof WebAssembly !== "undefined"
    };
  }

  /**
   * Initializes or expands linear memory pages.
   */
  public allocateLinearMemory(initialPages: number = 1, maximumPages: number = 16): WebAssembly.Memory | null {
    if (typeof WebAssembly === "undefined") return null;
    try {
      this.linearMemory = new WebAssembly.Memory({ initial: initialPages, maximum: maximumPages });
      return this.linearMemory;
    } catch {
      return null;
    }
  }

  /**
   * Fast byte copy between typed arrays.
   */
  public memoryCopy(dest: Uint8Array, destOffset: number, src: Uint8Array, srcOffset: number, length: number): void {
    dest.set(src.subarray(srcOffset, srcOffset + length), destOffset);
  }
}

export const webAssemblyController = new WebAssemblyController();
export default webAssemblyController;
