/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { WebAssemblyConfig, DEFAULT_WEBASSEMBLY_CONFIG } from "./General/index";

/**
 * TypedArray Linear-Memory Visual Engine.
 * Performs direct 32-bit linear-memory blitting, fill, and brightness scaling lazily on demand.
 */
export class VisualsAssemblyWebAssemblyController {
  private config: WebAssemblyConfig = { ...DEFAULT_WEBASSEMBLY_CONFIG };
  private frameBuffer: Uint32Array | null = null;

  private ensureFrameBuffer(): Uint32Array {
    if (!this.frameBuffer) {
      this.frameBuffer = new Uint32Array(320 * 180);
    }
    return this.frameBuffer;
  }

  public getStatus() {
    return { 
      module: "VisualsAssemblyWebAssembly", 
      active: true, 
      config: this.config,
      resolution: { width: 320, height: 180 },
      frameBufferBytes: this.frameBuffer ? this.frameBuffer.byteLength : 0
    };
  }

  /**
   * Linear-memory batch brightness scaling over 32-bit packed ABGR pixels.
   */
  public scaleBrightness(factor: number): void {
    const buf = this.ensureFrameBuffer();
    const len = buf.length;
    for (let i = 0; i < len; i++) {
      const p = buf[i];
      const r = Math.max(0, Math.min(255, ((p & 0xFF) * factor) | 0));
      const g = Math.max(0, Math.min(255, (((p >> 8) & 0xFF) * factor) | 0));
      const b = Math.max(0, Math.min(255, (((p >> 16) & 0xFF) * factor) | 0));
      buf[i] = (p & 0xFF000000) | (b << 16) | (g << 8) | r;
    }
  }

  /**
   * Deterministic 32-bit memset fill across the linear framebuffer.
   */
  public clearScreen(color32: number = 0xFF000000): void {
    this.ensureFrameBuffer().fill(color32 >>> 0);
  }

  /**
   * Linear memory blit from source buffer to target viewport.
   */
  public blit(src: Uint32Array, srcOffset: number, destOffset: number, count: number): void {
    const buf = this.ensureFrameBuffer();
    const safeSrcStart = Math.max(0, srcOffset | 0);
    const safeDestStart = Math.max(0, destOffset | 0);
    const maxCount = Math.min(count | 0, src.length - safeSrcStart, buf.length - safeDestStart);
    if (maxCount <= 0) return;
    buf.set(src.subarray(safeSrcStart, safeSrcStart + maxCount), safeDestStart);
  }

  public getBuffer(): Uint32Array {
    return this.ensureFrameBuffer();
  }
}

export const visualsAssemblyWebAssemblyController = new VisualsAssemblyWebAssemblyController();
export default visualsAssemblyWebAssemblyController;
