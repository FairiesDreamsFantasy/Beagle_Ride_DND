/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ClassicSFXGeneralRegistry = {
  name: 'Classic Sound Effects General Registry',
  version: '1.0.0',
  description: 'Classic sound configurations for retro-compatibility (8-bit, 16-bit, 32-bit) up to high-fidelity 64-bit precision.',
  bitDepths: {
    retro8bit: {
      sampleRate: 11025,
      quantization: 256,
      gainModifier: 0.85
    },
    vintage16bit: {
      sampleRate: 22050,
      quantization: 65536,
      gainModifier: 0.90
    },
    standard32bit: {
      sampleRate: 44100,
      quantization: 4294967296,
      gainModifier: 1.00
    },
    highFidelity64bit: {
      sampleRate: 96000,
      quantization: 1.8446744073709552e+19,
      gainModifier: 1.15
    }
  },
  classicSFXPresets: [
    {
      id: 0,
      name: 'Retro Bark (8-bit)',
      type: 'classic-sfx',
      frequency: 280,
      duration: 0.18,
      wave: 'square' as OscillatorType
    },
    {
      id: 1,
      name: 'Chiptune Paw Step',
      type: 'classic-sfx',
      frequency: 120,
      duration: 0.05,
      wave: 'triangle' as OscillatorType
    },
    {
      id: 2,
      name: 'Arcade Jump Swoosh',
      type: 'classic-sfx',
      frequency: 440,
      endFrequency: 880,
      duration: 0.22,
      wave: 'sine' as OscillatorType
    }
  ]
};
