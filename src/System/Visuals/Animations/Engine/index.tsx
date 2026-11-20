/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./Assembly/C/index";
export * from "./Assembly/CPP/index";
export * from "./Assembly/CSharp/index";
export * from "./Assembly/Web_Assembly/index";
export * from "./Python/index";

import { CEngine } from "./Assembly/C/index";
import { CPPEngine } from "./Assembly/CPP/index";
import { CSharpEngine } from "./Assembly/CSharp/index";
import { WebAssemblyEngine } from "./Assembly/Web_Assembly/index";
import { PythonEngine } from "./Python/index";

export interface VisualMemoryProfile {
  width: number;
  height: number;
  pixelCount: number;
  rawBytes: number;
  wasmPages: number;
  pageAlignedBytes: number;
  isLittleEndian: boolean;
}

/**
 * Unified Animation Engine Facade.
 * Coordinates C linear arenas, C++ RAII buffer scoping, C# zero-alloc spans,
 * WebAssembly 64 KiB page alignment, and vectorized Float32 kernels.
 */
export const VisualAnimationEngine = {
  C: CEngine,
  CPP: CPPEngine,
  CSharp: CSharpEngine,
  WebAssembly: WebAssemblyEngine,
  Python: PythonEngine,

  computeMemoryProfile(width: number, height: number): VisualMemoryProfile {
    const safeW = Math.max(1, Math.floor(width));
    const safeH = Math.max(1, Math.floor(height));
    const pixelCount = safeW * safeH;
    const rawBytes = pixelCount * 4;
    return {
      width: safeW,
      height: safeH,
      pixelCount,
      rawBytes,
      wasmPages: WebAssemblyEngine.computeRequiredPages(pixelCount, 4),
      pageAlignedBytes: WebAssemblyEngine.computePageAlignedBytes(pixelCount, 4),
      isLittleEndian: WebAssemblyEngine.isLittleEndianSystem()
    };
  },

  resetFrameTemporaries(): void {
    CEngine.resetFrameArena();
  }
};

export default VisualAnimationEngine;
