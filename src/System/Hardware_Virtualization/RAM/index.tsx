/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * RAM Virtualization Unit: Bounded TypedArray Memory Pooler.
 * Pre-allocates and recycles ArrayBuffers and Uint32Array views to eliminate runtime GC spikes
 * while enforcing an explicit total pooled memory ceiling.
 */
export class TypedArrayMemoryManager {
  private pools: Map<number, ArrayBuffer[]> = new Map();
  private totalPooledBytes: number = 0;
  private readonly maxPooledBytes: number = 16 * 1024 * 1024; // 16 MiB strict hypervisor RAM cap
  private cacheHits: number = 0;
  private allocations: number = 0;

  public acquire(byteLength: number): ArrayBuffer {
    const safeBytes = Math.max(4, byteLength);
    const pool = this.pools.get(safeBytes);
    if (pool && pool.length > 0) {
      const buf = pool.pop()!;
      this.totalPooledBytes = Math.max(0, this.totalPooledBytes - safeBytes);
      this.cacheHits++;
      return buf;
    }
    this.allocations++;
    return new ArrayBuffer(safeBytes);
  }

  public release(buffer: ArrayBuffer): void {
    const len = buffer.byteLength;
    if (len <= 0 || this.totalPooledBytes + len > this.maxPooledBytes) {
      return;
    }
    let pool = this.pools.get(len);
    if (!pool) {
      pool = [];
      this.pools.set(len, pool);
    }
    if (pool.length < 16) {
      pool.push(buffer);
      this.totalPooledBytes += len;
    }
  }

  /**
   * Acquires a zero-initialized Uint32Array backed by the pooled ArrayBuffer slab.
   */
  public acquireUint32(length: number): Uint32Array {
    const safeLen = Math.max(1, Math.floor(length));
    const buf = this.acquire(safeLen * Uint32Array.BYTES_PER_ELEMENT);
    const view = new Uint32Array(buf, 0, safeLen);
    view.fill(0);
    return view;
  }

  /**
   * Returns a Uint32Array's backing ArrayBuffer to the RAM hypervisor pool.
   */
  public releaseUint32(view: Uint32Array | null | undefined): void {
    if (!view || !(view.buffer instanceof ArrayBuffer)) return;
    this.release(view.buffer);
  }

  public sweep(): number {
    let freedBytes = 0;
    for (const [byteLen, pool] of this.pools.entries()) {
      if (pool.length > 4) {
        const excess = pool.splice(4);
        for (const buf of excess) {
          freedBytes += buf.byteLength;
        }
      }
    }
    this.totalPooledBytes = Math.max(0, this.totalPooledBytes - freedBytes);
    return freedBytes;
  }

  public getStats(): { totalPooledBytes: number; maxPooledBytes: number; cacheHits: number; allocations: number } {
    return {
      totalPooledBytes: this.totalPooledBytes,
      maxPooledBytes: this.maxPooledBytes,
      cacheHits: this.cacheHits,
      allocations: this.allocations
    };
  }
}

export const ramUnit = new TypedArrayMemoryManager();
export default ramUnit;
