/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Beagle Bark Synthesizer Logic.
 * Mathematical parameters for high-precision baying.
 */
export const BeagleBarkSFX = {
  vocalChords: 4,
  resonance: 'CHEST_BODY',
  overtones: true,
  frequencies: {
    voice1: { start: 320, mid: 580, end: 220 },
    voice2: { start: 160, mid: 290, end: 110, type: 'triangle' },
    voice3: { start: 480, mid: 870, end: 330, type: 'triangle' },
    voice4: { start: 640, mid: 1160, end: 440, type: 'sine' },
    noise: { filter: 1200, Q: 1.5, gain: 0.15 }
  },
  envelope: {
    attack: 0.02,
    decay: 0.32,
    duration: 0.35
  }
};
