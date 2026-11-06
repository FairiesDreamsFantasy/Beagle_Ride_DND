/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Garden BGM Logic.
 * Mathematical pattern for the manor's garden.
 */
export const GardenBGM = {
  tempo: 135,
  scale: 'PENTATONIC_MAJOR',
  mood: 'SERENE_MATHEMATICAL',
  parameters: {
    chords: [
      [2, 4, 7, 9],
      [5, 7, 9, 11],
      [7, 9, 11, 13]
    ],
    frequencies: [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33],
    waveType: 'triangle',
    stepDuration: 0.38
  }
};
