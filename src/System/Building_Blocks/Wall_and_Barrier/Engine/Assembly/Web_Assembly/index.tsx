/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Building_Blocks/Wall_and_Barrier/Engine/Assembly/Web_Assembly/index.tsx
 * Domain: Masonry Wall & Barrier Seam (WebAssembly Kernel)
 */

export class WebAssemblyEngine {
  public static status = "Operational";
  public static readonly domain = "Building_Blocks/Wall_and_Barrier";
  public static readonly wasmPageBytes = 65536;

  public static alignBytes(bytes: number, alignment: number = 4): number {
    const mask = Math.max(1, alignment | 0) - 1;
    return (Math.max(0, bytes | 0) + mask) & ~mask;
  }

  public static computePageCount(byteLength: number): number {
    return Math.max(1, Math.ceil(Math.max(0, byteLength) / this.wasmPageBytes));
  }

  public static packABGR32(r: number, g: number, b: number, a: number = 255): number {
    return (((a & 0xFF) << 24) | ((b & 0xFF) << 16) | ((g & 0xFF) << 8) | (r & 0xFF)) >>> 0;
  }

  public static computeRec601Luminance(color32: number): number {
    const r = color32 & 0xFF;
    const g = (color32 >>> 8) & 0xFF;
    const b = (color32 >>> 16) & 0xFF;
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
}
