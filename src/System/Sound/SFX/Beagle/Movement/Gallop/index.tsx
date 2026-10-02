/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Beagle Gallop SFX Logic.
 */
export * from './General/index';

export const BeagleGallopSFX = {
  intensity: 'HIGH',
  dualImpact: true,
  parameters: {
    thud: {
      freqStart: 60,
      freqEnd: 20,
      duration: 0.12
    },
    scuff: {
      foyerFreq: 2200,
      gardenFreq: 1200,
      duration: 0.08
    }
  }
};
