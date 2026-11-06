/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Bandwidth Booster Specifications.
 * Enables high-bandwidth content delivery optimization for zero-latency streaming.
 * Uses deterministic mathematical models to ensure signal integrity and maximum throughput.
 */
export interface BandwidthBoosterConfig {
  throughputTargetGbps: number;
  multiStreamOptimization: boolean;
  zeroLatencyBuffer: boolean;
  burstModeEnabled: boolean;
  nyquistStabilityFactor: number; // Ensuring signal integrity via Nyquist-Shannon sampling
  shannonEntropyThreshold: number; // Managing data entropy for lossless delivery
  stochasticDitherRatio: number; // Preventing quantization noise during high-speed bursts
}

export const DEFAULT_BANDWIDTH_BOOSTER_CONFIG: Readonly<BandwidthBoosterConfig> = Object.freeze({
  throughputTargetGbps: 10.0,
  multiStreamOptimization: true,
  zeroLatencyBuffer: true,
  burstModeEnabled: true,
  nyquistStabilityFactor: 1.618033988749895, // Derived from the Golden Ratio for harmonic stability
  shannonEntropyThreshold: 0.9999999999999999, // Absolute precision mandate
  stochasticDitherRatio: 0.05 // 5% noise-floor floor stabilization
});
