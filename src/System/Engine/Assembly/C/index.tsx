/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CConfig, DEFAULT_C_CONFIG } from "./General/index";

/**
 * C Virtualization Controller.
 * Provides deterministic C-style raw memory buffers, linear arena allocators, pointer operations, and bit manipulation.
 */
export class CController {
  private config: CConfig = { ...DEFAULT_C_CONFIG };
  private arenaBuffer: Uint8Array = new Uint8Array(64 * 1024); // 64 KB pre-allocated linear arena
  private arenaOffset: number = 0;

  public getStatus() {
    return { 
      module: "C", 
      active: true, 
      config: this.config,
      arenaCapacityBytes: this.arenaBuffer.length,
      arenaUsedBytes: this.arenaOffset
    };
  }

  /**
   * Linear Arena Allocation: O(1) allocation with zero GC garbage.
   */
  public arenaAlloc(byteLength: number): Uint8Array {
    const alignedSize = (byteLength + 3) & ~3; // 4-byte alignment
    if (this.arenaOffset + alignedSize > this.arenaBuffer.length) {
      this.arenaOffset = 0; // Deterministic cyclic reset
    }
    const view = this.arenaBuffer.subarray(this.arenaOffset, this.arenaOffset + byteLength);
    this.arenaOffset += alignedSize;
    return view;
  }

  public arenaReset(): void {
    this.arenaOffset = 0;
  }

  /**
   * Standard memory allocation.
   */
  public malloc(byteLength: number): Uint8Array {
    return new Uint8Array(Math.max(0, Math.floor(byteLength)));
  }

  /**
   * Fast byte block copy (memcpy).
   */
  public memcpy(dest: Uint8Array, destOffset: number, src: Uint8Array, srcOffset: number, length: number): void {
    dest.set(src.subarray(srcOffset, srcOffset + length), destOffset);
  }

  /**
   * Fast byte block set (memset).
   */
  public memset(buffer: Uint8Array, offset: number, value: number, length: number): void {
    buffer.fill(value & 0xFF, offset, offset + length);
  }

  /**
   * Fast 32-bit little-endian integer read.
   */
  public readUint32(buffer: Uint8Array, offset: number): number {
    return (
      buffer[offset] |
      (buffer[offset + 1] << 8) |
      (buffer[offset + 2] << 16) |
      (buffer[offset + 3] << 24)
    ) >>> 0;
  }

  /**
   * Fast 32-bit little-endian integer write.
   */
  public writeUint32(buffer: Uint8Array, offset: number, value: number): void {
    buffer[offset] = value & 0xFF;
    buffer[offset + 1] = (value >> 8) & 0xFF;
    buffer[offset + 2] = (value >> 16) & 0xFF;
    buffer[offset + 3] = (value >> 24) & 0xFF;
  }

  /**
   * Fixed-point 16.16 bit packing for coordinates.
   */
  public toFixed16(val: number): number {
    return Math.floor(val * 65536);
  }

  public fromFixed16(fixedVal: number): number {
    return fixedVal / 65536;
  }

  /**
   * Bitwise bitmask manipulation routines.
   */
  public setBit(val: number, bitIndex: number): number {
    return (val | (1 << bitIndex)) >>> 0;
  }

  public clearBit(val: number, bitIndex: number): number {
    return (val & ~(1 << bitIndex)) >>> 0;
  }

  public testBit(val: number, bitIndex: number): boolean {
    return (val & (1 << bitIndex)) !== 0;
  }
}

export const cController = new CController();
export default cController;
