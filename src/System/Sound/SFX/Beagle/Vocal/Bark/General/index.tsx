/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BeagleBarkGeneralSFX = {
  version: '1.0.0',
  parameters: {
    base: 320,
    peak: 580,
    tail: 220,
    resonance: 1200,
    voices: [
      { freq: 160, peak: 290, tail: 110, type: 'triangle' as const, vol: 0.8 },
      { freq: 480, peak: 870, tail: 330, type: 'triangle' as const, vol: 0.55 },
      { freq: 640, peak: 1160, tail: 440, type: 'sine' as const, vol: 0.35 }
    ]
  }
};
