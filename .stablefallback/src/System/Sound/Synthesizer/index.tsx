/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

/**
 * Sound Synthesizer Module.
 */
export const SoundSynthesizer = {
  type: 'MATHEMATICAL',
  voices: 64,
  precision: '64_BIT_DOUBLE_PRECISION'
};

export default SoundSynthesizer;
