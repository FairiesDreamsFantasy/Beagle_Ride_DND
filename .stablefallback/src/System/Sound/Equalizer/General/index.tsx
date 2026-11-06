/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Equalizer General Types.
 */
export interface EQBand {
  frequency: number;
  q: number;
  gain: number;
  type: BiquadFilterType;
}

export const DEFAULT_EQ_BANDS: EQBand[] = [
  { frequency: 60, q: 1, gain: 0, type: 'peaking' },
  { frequency: 250, q: 1, gain: 0, type: 'peaking' },
  { frequency: 1000, q: 1, gain: 0, type: 'peaking' },
  { frequency: 4000, q: 1, gain: 0, type: 'peaking' },
  { frequency: 12000, q: 1, gain: 0, type: 'peaking' }
];
