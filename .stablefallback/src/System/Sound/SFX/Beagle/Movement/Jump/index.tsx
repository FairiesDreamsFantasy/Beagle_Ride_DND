/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Beagle Jump SFX Logic.
 */
export const BeagleJumpSFX = {
  phases: ['SWOOSH', 'THUMP'],
  airResistance: 0.15,
  parameters: {
    swoosh: {
      freqStart: 180,
      freqMid: 380,
      freqEnd: 150,
      duration: 0.35
    },
    thump: {
      freqStart: 120,
      freqEnd: 40,
      duration: 0.25
    }
  }
};
