/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CPPConfig, DEFAULT_CPP_CONFIG } from "./General/index";

/**
 * C++ High-Speed Rasterizer & RAII Resource Manager.
 * Implements deterministic buffer pooling and pure integer rasterization.
 */
export class VisualsAssemblyCPPController {
  private config: CPPConfig = { ...DEFAULT_CPP_CONFIG };
  private bufferPool: Map<string, ArrayBuffer[]> = new Map();

  public getStatus() {
    return { 
      module: "VisualsAssemblyCPP", 
      active: true, 
      config: this.config, 
      pipeline: "BRESENHAM_RASTER",
      poolCount: this.bufferPool.size
    };
  }

  /**
   * RAII-style buffer acquisition. Prevents GC spikes by reusing typed arrays.
   */
  public acquireBuffer(key: string, size: number): Uint32Array {
    let pool = this.bufferPool.get(key);
    if (!pool) {
      pool = [];
      this.bufferPool.set(key, pool);
    }
    const buf = pool.pop();
    if (buf && buf.byteLength >= size * 4) {
      return new Uint32Array(buf, 0, size);
    }
    return new Uint32Array(size);
  }

  /**
   * RAII-style buffer release for deterministic reuse.
   */
  public releaseBuffer(key: string, arr: Uint32Array): void {
    const pool = this.bufferPool.get(key);
    if (pool && pool.length < 16) {
      pool.push(arr.buffer);
    }
  }

  /**
   * Bresenham integer line drawing algorithm.
   */
  public drawLine(
    x0: number, y0: number, x1: number, y1: number, 
    color32: number, 
    pixelBuffer: Uint32Array, 
    screenWidth: number, 
    screenHeight: number
  ): void {
    let x = Math.floor(x0);
    let y = Math.floor(y0);
    const targetX = Math.floor(x1);
    const targetY = Math.floor(y1);

    const dx = Math.abs(targetX - x);
    const dy = -Math.abs(targetY - y);
    const sx = x < targetX ? 1 : -1;
    const sy = y < targetY ? 1 : -1;
    let err = dx + dy;

    while (true) {
      if (x >= 0 && x < screenWidth && y >= 0 && y < screenHeight) {
        pixelBuffer[y * screenWidth + x] = color32;
      }
      if (x === targetX && y === targetY) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * Fast horizontal scanline filler.
   */
  public fillSpan(
    xStart: number, xEnd: number, y: number, 
    color32: number, 
    pixelBuffer: Uint32Array, 
    screenWidth: number, 
    screenHeight: number
  ): void {
    if (y < 0 || y >= screenHeight) return;
    const x0 = Math.max(0, Math.min(screenWidth - 1, Math.floor(xStart)));
    const x1 = Math.max(0, Math.min(screenWidth - 1, Math.floor(xEnd)));
    const rowOffset = y * screenWidth;
    for (let x = x0; x <= x1; x++) {
      pixelBuffer[rowOffset + x] = color32;
    }
  }
}

export const visualsAssemblyCPPController = new VisualsAssemblyCPPController();
export default visualsAssemblyCPPController;
