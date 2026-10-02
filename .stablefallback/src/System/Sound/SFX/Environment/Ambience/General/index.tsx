/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const AmbienceGeneralSFX = {
  parameters: {
    portal: {
      frequency: 440,
      duration: 0.45,
      steps: [
        { vol: 0.5, time: 0 },
        { vol: 0.25, time: 0.1 },
        { vol: 0.12, time: 0.2 }
      ]
    },
    rumble: {
      frequency: 61.8, // Golden-ratio derived frequency to avoid 60Hz mains hum resonance
      duration: 0.6
    }
  }
};
