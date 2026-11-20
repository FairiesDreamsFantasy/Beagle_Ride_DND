/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const IS_LITTLE_ENDIAN = (() => {
  const buf = new ArrayBuffer(4);
  new Uint32Array(buf)[0] = 0x01020304;
  return new Uint8Array(buf)[0] === 0x04;
})();

/**
 * WebAssembly Page-Aligned Linear Memory & Endianness Verification Engine.
 * Enforces IEEE/WASM 64 KiB (65,536-byte) page boundaries for minimal RAM fragmentation.
 */
export class WebAssemblyEngine {
  public static status = "Operational";
  public static readonly WASM_PAGE_BYTES = 65536;

  public static alignUp16(bytes: number): number {
    return (Math.max(0, Math.ceil(bytes)) + 15) & ~15;
  }

  public static computeRequiredPages(pixelCount: number, bytesPerPixel: number = 4): number {
    const totalBytes = Math.max(1, Math.floor(pixelCount)) * bytesPerPixel;
    return Math.ceil(totalBytes / this.WASM_PAGE_BYTES);
  }

  public static computePageAlignedBytes(pixelCount: number, bytesPerPixel: number = 4): number {
    return this.computeRequiredPages(pixelCount, bytesPerPixel) * this.WASM_PAGE_BYTES;
  }

  public static isLittleEndianSystem(): boolean {
    return IS_LITTLE_ENDIAN;
  }
}
