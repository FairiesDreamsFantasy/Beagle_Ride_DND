/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Beagle Trot SFX Logic.
 */
export * from './General/index';

export const BeagleTrotSFX = {
  cadence: 'STEADY',
  impacts: 4,
  parameters: {
    baseFrequencies: { left: 85, right: 92 },
    roomModifiers: {
      PORCH: 1.15,
      GARDEN: 0.8,
      TEMPLE: 0.9
    },
    envelope: {
      padDuration: 0.08,
      clawDuration: 0.04,
      gardenPadDuration: 0.12,
      porchPadDuration: 0.10
    },
    clawFrequencies: { left: 1400, right: 1550 }
  }
};
