/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LowRAMConfig {
  bufferStrategy: 'RING_BUFFER_ZERO_ALLOC' | 'UNLIMITED_EXPANDABLE';
  maxHeapCapBytes: number;
  supportsUnlimitedRAM: true;
}

export const DEFAULT_LOW_RAM_CONFIG: Readonly<LowRAMConfig> = Object.freeze({
  bufferStrategy: 'RING_BUFFER_ZERO_ALLOC',
  maxHeapCapBytes: Infinity,
  supportsUnlimitedRAM: true
});
