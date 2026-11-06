/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * RAM Virtualization Unit: TypedArray Memory Pooler.
 * Pre-allocates and recycles large buffers to eliminate runtime GC spikes.
 */
export class TypedArrayMemoryManager {
  private pools: Map<number, ArrayBuffer[]> = new Map();

  public acquire(byteLength: number): ArrayBuffer {
    const pool = this.pools.get(byteLength) || [];
    const buf = pool.pop() || new ArrayBuffer(byteLength);
    this.pools.set(byteLength, pool);
    return buf;
  }

  public release(buffer: ArrayBuffer): void {
    const len = buffer.byteLength;
    const pool = this.pools.get(len) || [];
    if (pool.length < 16) {
      pool.push(buffer);
      this.pools.set(len, pool);
    }
  }
}

export const ramUnit = new TypedArrayMemoryManager();
export default ramUnit;
