/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VGAPortConfig {
  hSync: boolean;
  vSync: boolean;
  colorDepthBits: 24;
  dacFrequencyMhz: number;
}

export const DEFAULT_VGA_CONFIG: Readonly<VGAPortConfig> = Object.freeze({
  hSync: true,
  vSync: true,
  colorDepthBits: 24,
  dacFrequencyMhz: 148.5
});
