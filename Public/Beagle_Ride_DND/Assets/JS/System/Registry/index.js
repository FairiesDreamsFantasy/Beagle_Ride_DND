/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standalone Unified System Registry Module
 */

export const StandaloneRegistry = {
  rooms: {
    Foyer: { width: 800, height: 800, name: 'Foyer', zone: 'INDOOR', mainsHum: true },
    FrontPorch: { width: 800, height: 200, name: 'Front Porch', zone: 'OUTDOOR', breeze: true },
    Garden: { width: 800, height: 800, name: 'Garden', zone: 'OUTDOOR', fountain: true, perimeterWalkway: true },
    Temple: { width: 2000, height: 2000, name: 'Temple of Hayana', zone: 'INDOOR', reverbDelay: 0.18, feedback: 0.48 }
  },
  physics: {
    spatialHashBucketFeet: 40,
    gravity: 0.4,
    jumpInitialVelocity: 7.5
  },
  audio: {
    polyphonyLimit: 16,
    referenceDbBgm: -6,
    referenceDbAmbience: 0,
    referenceDbSfx: 3
  }
};

export default StandaloneRegistry;
