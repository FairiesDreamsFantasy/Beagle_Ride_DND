/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

/**
 * SFX Synthesizer Logic.
 */
export const SFXSynthesizer = {
  engine: 'POLYPHONIC',
  voices: 32,
  precision: '64_BIT_FORMANT_CONCURRENT'
};

export default SFXSynthesizer;
