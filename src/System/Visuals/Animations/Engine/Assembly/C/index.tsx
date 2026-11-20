/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * C-Style Linear Bump-Pointer Arena Allocator.
 * Operates inside a single pre-allocated ArrayBuffer slab so frame-temporary views
 * incur O(1) pointer advancement and O(1) bulk reset with ZERO heap GC overhead.
 */
export class CLinearArena {
  private readonly buffer: ArrayBuffer;
  private offsetBytes: number = 0;

  constructor(capacityBytes: number = 65536) {
    const aligned = (Math.max(256, capacityBytes) + 15) & ~15;
    this.buffer = new ArrayBuffer(aligned);
  }

  public allocUint32(length: number): Uint32Array | null {
    const alignedOffset = (this.offsetBytes + 3) & ~3;
    const byteSize = Math.max(1, length) * Uint32Array.BYTES_PER_ELEMENT;
    if (alignedOffset + byteSize > this.buffer.byteLength) {
      return null;
    }
    const view = new Uint32Array(this.buffer, alignedOffset, length);
    this.offsetBytes = alignedOffset + byteSize;
    return view;
  }

  public reset(): void {
    this.offsetBytes = 0;
  }

  public getUsedBytes(): number {
    return this.offsetBytes;
  }

  public getCapacityBytes(): number {
    return this.buffer.byteLength;
  }
}

export class CEngine {
  public static status = "Operational";
  private static sharedArena: CLinearArena | null = null;

  private static getOrCreateSharedArena(): CLinearArena {
    if (!this.sharedArena) {
      this.sharedArena = new CLinearArena(524288);
    }
    return this.sharedArena;
  }

  public static createArena(capacityBytes: number): CLinearArena {
    return new CLinearArena(capacityBytes);
  }

  public static mallocUint32(length: number): Uint32Array {
    return this.getOrCreateSharedArena().allocUint32(length) ?? new Uint32Array(length);
  }

  public static resetFrameArena(): void {
    if (this.sharedArena) {
      this.sharedArena.reset();
    }
  }

  public static getArenaTelemetry(): { usedBytes: number; capacityBytes: number } {
    if (!this.sharedArena) {
      return { usedBytes: 0, capacityBytes: 0 };
    }
    return {
      usedBytes: this.sharedArena.getUsedBytes(),
      capacityBytes: this.sharedArena.getCapacityBytes()
    };
  }
}
