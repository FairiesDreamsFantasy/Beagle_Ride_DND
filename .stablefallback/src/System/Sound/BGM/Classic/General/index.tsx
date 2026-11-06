/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ClassicBGMGeneralRegistry = {
  name: 'Classic Background Music General Registry',
  version: '1.0.0',
  description: 'Classic background music configurations preserving legacy chiptunes and procedural sequences.',
  audioRatios: {
    musicVolumeReduction: 0.30, // 30% lower
    ambienceVolumeIncreaseOverMusic: 0.20, // 20% higher than music
    sfxVolumeAmplification: 0.15 // 15% amplified
  },
  classicBGMTracks: [
    {
      id: 0,
      name: 'Elegant Foyer Trot',
      tempo: 135,
      key: 'C Major',
      proceduralPattern: 'chords-pentatonic'
    },
    {
      id: 1,
      name: 'Checked Flooring Sonata',
      tempo: 120,
      key: 'F Major',
      proceduralPattern: 'trot-sonata'
    },
    {
      id: 2,
      name: 'Diamond Collar Chimes',
      tempo: 140,
      key: 'G Major',
      proceduralPattern: 'bell-cascade'
    }
  ]
};
