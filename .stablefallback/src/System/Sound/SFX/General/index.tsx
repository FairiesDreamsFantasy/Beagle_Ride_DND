/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SFX General Definitions.
 */
export interface SFXEntry {
  name: string;
  category: 'BEAGLE' | 'INTERACTION' | 'ENVIRONMENT' | 'SYSTEM';
  baseVolume: number;
}
