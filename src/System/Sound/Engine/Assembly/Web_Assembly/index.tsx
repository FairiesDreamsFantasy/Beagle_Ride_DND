/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { WebAssemblyConfig, DEFAULT_WEBASSEMBLY_CONFIG } from "./General/index";

/**
 * WebAssembly Audio Engine.
 * Emulates high-speed WASM linear memory processing and frequency-domain scaling.
 */
export class SoundAssemblyWebAssemblyController {
  private config: WebAssemblyConfig = { ...DEFAULT_WEBASSEMBLY_CONFIG };
  private memoryPage: Float32Array = new Float32Array(16384); // 64KB page (16k 32-bit floats)

  public getStatus() {
    return { 
      module: "SoundAssemblyWebAssembly", 
      active: true, 
      config: this.config,
      linearMemoryBytes: this.memoryPage.byteLength,
      pageCount: 1
    };
  }

  /**
   * Simple frequency-domain multiplier simulation (pseudo-EQ).
   * Scales samples by index-based weights to simulate spectral filtering.
   */
  public spectralScale(offset: number, length: number, lowGain: number, highGain: number): void {
    const end = Math.min(this.memoryPage.length, offset + length);
    for (let i = offset; i < end; i++) {
      const progress = (i - offset) / (length || 1);
      const weight = lowGain + (highGain - lowGain) * progress;
      this.memoryPage[i] *= weight;
    }
  }

  /**
   * Fast WASM-style SIMD batch gain scaling directly in linear memory.
   */
  public applyLinearGain(offset: number, length: number, gainFactor: number): void {
    const end = Math.min(this.memoryPage.length, offset + length);
    for (let i = offset; i < end; i++) {
      this.memoryPage[i] *= gainFactor;
    }
  }

  /**
   * Fast WASM-style DC-offset removal filter pass.
   */
  public removeDCOffset(offset: number, length: number): void {
    const end = Math.min(this.memoryPage.length, offset + length);
    let mean = 0;
    for (let i = offset; i < end; i++) {
      mean += this.memoryPage[i];
    }
    mean /= (end - offset || 1);
    for (let i = offset; i < end; i++) {
      this.memoryPage[i] -= mean;
    }
  }

  public getMemorySlice(offset: number, length: number): Float32Array {
    return this.memoryPage.subarray(offset, offset + length);
  }
}

export const soundAssemblyWebAssemblyController = new SoundAssemblyWebAssemblyController();
export default soundAssemblyWebAssemblyController;
