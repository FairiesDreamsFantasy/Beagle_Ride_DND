/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CConfig, DEFAULT_C_CONFIG } from "./General/index";

/**
 * C Virtualization Controller.
 * Provides deterministic C-style raw memory buffers, pointer operations, and bit manipulation.
 */
export class CController {
  private config: CConfig = { ...DEFAULT_C_CONFIG };

  public getStatus() {
    return { module: "C", active: true, config: this.config };
  }

  /**
   * Allocates an aligned contiguous byte buffer.
   */
  public malloc(byteLength: number): Uint8Array {
    return new Uint8Array(Math.max(0, Math.floor(byteLength)));
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
