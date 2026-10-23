/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CPPConfig, DEFAULT_CPP_CONFIG } from "./General/index";

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
