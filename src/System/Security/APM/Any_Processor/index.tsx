/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APMProcessorProfile } from '../General/index';

/**
 * CPU Concurrency Profiling, Thread Detection, and Virtual Cycle Benchmark Engine.
 * Benchmarks instruction throughput and calculates virtual cycle speed metrics.
 */
export class AnyProcessorProfiler {
  private static instance: AnyProcessorProfiler | null = null;
  private cachedProfile: APMProcessorProfile | null = null;

  public static getInstance(): AnyProcessorProfiler {
    if (!AnyProcessorProfiler.instance) {
      AnyProcessorProfiler.instance = new AnyProcessorProfiler();
    }
    return AnyProcessorProfiler.instance;
  }

  public profileProcessor(): APMProcessorProfile {
    if (this.cachedProfile) {
      return this.cachedProfile;
    }

    const logicalCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;

    // Lightweight micro-benchmark for instruction throughput
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let acc = 0;
    for (let i = 0; i < 50000; i++) {
      acc = (acc + i * 3) ^ (i & 0xFF);
    }
    const elapsed = Math.max(0.01, (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start);
    const benchmarkScore = Math.round(50000 / elapsed);

    let concurrencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMAL' = 'MEDIUM';
    if (logicalCores <= 2) {
      concurrencyLevel = 'LOW';
    } else if (logicalCores <= 4) {
      concurrencyLevel = 'MEDIUM';
    } else if (logicalCores <= 8) {
      concurrencyLevel = 'HIGH';
    } else {
      concurrencyLevel = 'MAXIMAL';
    }

    // Estimate virtual cycle speed
    const virtualCycleSpeedMHz = Math.min(4800, Math.max(1200, Math.round(benchmarkScore * 0.45)));

    this.cachedProfile = {
      logicalCores,
      virtualCycleSpeedMHz,
      concurrencyLevel,
      benchmarkScore
    };

    return this.cachedProfile;
  }

  public resetCache(): void {
    this.cachedProfile = null;
  }
}

export const anyProcessorProfiler = AnyProcessorProfiler.getInstance();
export default anyProcessorProfiler;
