/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BeagleCollarGraspGeneralSFX = {
  metallic: true,
  jingle: 'DIAMOND_CHIME',
  tension: 0.8,
  parameters: {
    jingle: {
      oscFreq: 1800,
      subFreq: 2400,
      duration: 0.15
    },
    sparkle: {
      freqs: [3200, 3600, 4200, 4800],
      duration: 0.18
    }
  }
};
