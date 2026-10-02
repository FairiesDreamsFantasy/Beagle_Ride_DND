/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Beagle Interaction SFX Registry.
 */
export const BeagleInteractionSFX = {
  types: ['PETTING', 'COLLAR_GRASP', 'WHIMPER'],
  precision: 'MATHEMATICAL',
  parameters: {
    whimper: {
      freqStart: 680,
      freqMid: 850,
      freqEnd: 750,
      duration: 0.22
    }
  }
};
