/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BeagleTrotGeneralSFX = {
  cadence: 'STEADY',
  impacts: 4,
  precision: '64-BIT-UPSAMPLED',
  parameters: {
    baseFrequencies: { left: 85, right: 92 },
    roomModifiers: {
      PORCH: 1.15,
      GARDEN: 0.8,
      TEMPLE: 0.9,
      FOYER: 1.0
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
