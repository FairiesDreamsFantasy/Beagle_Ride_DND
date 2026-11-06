/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CPPConfig, DEFAULT_CPP_CONFIG } from "./General/index";

/**
 * High-Performance Fixed Capacity Ring Buffer (std::circular_buffer analogue).
 * Guarantees O(1) push and pop with zero heap allocation after initialization.
 */
export class FixedRingBuffer<T> {
  private buffer: (T | null)[];
  private capacity: number;
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity).fill(null);
  }

  public push(item: T): boolean {
    if (this.count >= this.capacity) {
      // Overwrite oldest item deterministically
      this.head = (this.head + 1) % this.capacity;
      this.count--;
    }
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }

  public pop(): T | null {
    if (this.count === 0) return null;
    const item = this.buffer[this.head];
    this.buffer[this.head] = null;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return item;
  }

  public size(): number {
    return this.count;
  }

  public clear(): void {
    this.buffer.fill(null);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }
}

/**
 * C++ Virtualization Controller.
 * Implements deterministic RAII memory pools, typed vector containers, and zero-leak resource disposal.
 */
export class CPPController {
  private config: CPPConfig = { ...DEFAULT_CPP_CONFIG };
  private activePools: Map<string, ArrayBuffer[]> = new Map();

  public getStatus() {
    return { module: "CPP", active: true, config: this.config, activePoolCount: this.activePools.size };
  }

  /**
   * Creates a dedicated fixed-capacity ring buffer for zero-GC event handling.
   */
  public createRingBuffer<T>(capacity: number): FixedRingBuffer<T> {
    return new FixedRingBuffer<T>(capacity);
  }

  /**
   * Acquire a pre-allocated typed buffer from an RAII pool (avoids GC churn).
   */
  public acquireBuffer(poolName: string, byteLength: number): ArrayBuffer {
    let pool = this.activePools.get(poolName);
    if (!pool) {
      pool = [];
      this.activePools.set(poolName, pool);
    }
    const existing = pool.pop();
    if (existing && existing.byteLength >= byteLength) {
      return existing;
    }
    return new ArrayBuffer(byteLength);
  }

  /**
   * Return a buffer to the RAII pool for instant deterministic reuse.
   */
  public releaseBuffer(poolName: string, buffer: ArrayBuffer): void {
    const pool = this.activePools.get(poolName);
    if (pool && pool.length < 32) {
      pool.push(buffer);
    }
  }

  /**
   * Clears an allocated resource pool.
   */
  public clearPool(poolName: string): void {
    this.activePools.delete(poolName);
  }
}

export const cPPController = new CPPController();
export default cPPController;
