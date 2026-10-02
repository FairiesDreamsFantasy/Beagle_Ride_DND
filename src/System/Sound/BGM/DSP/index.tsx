/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

/**
 * BGM DSP Module.
 */
export const BGMDSP = {
  type: 'HARMONIC_FILTERING_AND_DYNAMIC_COMPRESSION',
  channels: 2,
  sampleRate: 48000
};

export default BGMDSP;
