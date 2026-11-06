/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { WebAssemblyConfig, DEFAULT_WEBASSEMBLY_CONFIG } from "./General/index";

/**
 * WebAssembly Visual Framebuffer & Blitter Simulator.
 * Emulates high-speed WASM linear memory blitting directly into 32-bit pixel buffers without canvas overhead.
 */
export class VisualsAssemblyWebAssemblyController {
  private config: WebAssemblyConfig = { ...DEFAULT_WEBASSEMBLY_CONFIG };
  private frameBuffer: Uint32Array = new Uint32Array(320 * 180); // 16:9 retro viewport resolution

  public getStatus() {
    return { 
      module: "VisualsAssemblyWebAssembly", 
      active: true, 
      config: this.config,
      resolution: { width: 320, height: 180 },
      frameBufferBytes: this.frameBuffer.byteLength
    };
  }

  /**
   * Fast WASM memset32: clears entire framebuffer in a single loop with zero allocation.
   */
  public clearScreen(color32: number = 0xFF000000): void {
    this.frameBuffer.fill(color32);
  }

  /**
   * Fast linear memory blit from source buffer to target viewport.
   */
  public blit(src: Uint32Array, srcOffset: number, destOffset: number, count: number): void {
    const end = Math.min(this.frameBuffer.length, destOffset + count);
    for (let i = destOffset, j = srcOffset; i < end; i++, j++) {
      this.frameBuffer[i] = src[j];
    }
  }

  public getBuffer(): Uint32Array {
    return this.frameBuffer;
  }
}

export const visualsAssemblyWebAssemblyController = new VisualsAssemblyWebAssemblyController();
export default visualsAssemblyWebAssemblyController;
