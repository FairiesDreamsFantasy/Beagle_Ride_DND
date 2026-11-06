/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BeaglePettingGeneralSFX = {
  material: 'FUR',
  friction: 0.45,
  rustle: 'HIGH_FIDELITY',
  parameters: {
    short: {
      freqs: [350, 250, 450],
      duration: 0.15
    },
    long: {
      filterStart: 800,
      filterMid: 1200,
      filterEnd: 600,
      duration: 0.5
    }
  }
};
