/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CollisionGeneralSFX = {
  version: '1.0.0',
  jump: {
    start: 180,
    peak: 380,
    end: 150,
    duration: 0.35
  },
  landing: {
    start: 120,
    end: 40,
    duration: 0.25
  },
  wall: {
    osc1: { start: 140, peak: 280, end: 100 },
    osc2: { start: 210, peak: 420, end: 150 },
    duration: 0.3
  }
};
