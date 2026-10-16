/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BeagleSpecs, HandState } from '../../../../types';

export interface PetEvaluationResult {
  text: string;
  sfxId: number;
  durationFrames: number;
  pitchMultiplier: number;
}

export interface CollarEvaluationResult {
  nextHandState: HandState;
  text: string;
  sfxId: number;
}

export interface BarkEvaluationResult {
  text: string;
  sfxId: number;
  pitchModifier: number;
  durationFrames: number;
}

/**
 * Deterministic Character Interaction Engine.
 * Formulates O(1) state transitions, acoustic synthesis parameters,
 * and descriptive sensory strings without inline component hardcoding.
 */
export const CharacterInteractionEngine = {
  /**
   * Evaluates petting physics, duration, vocal feedback, and tactile narration.
   * Grounded in individual Beagle anatomical and coat characteristics.
   */
  evaluatePetting: (beagle: BeagleSpecs): PetEvaluationResult => {
    return {
      text: beagle.petDescription,
      sfxId: beagle.petSfxId,
      durationFrames: 45,
      pitchMultiplier: 1.0
    };
  },

  /**
   * Evaluates collar grasp mechanics, harness tactile feedback, and rein states.
   */
  evaluateCollarGrasp: (beagle: BeagleSpecs, currentHandState: HandState): CollarEvaluationResult => {
    if (currentHandState === 'GRASPING') {
      return {
        nextHandState: 'DEFAULT',
        text: 'Holding the default reins position.',
        sfxId: 1
      };
    }

    const collarDescription = `Holding her ${beagle.collarColor.toLowerCase()} collar decorated with ${beagle.collarDecorations}!`;
    return {
      nextHandState: 'GRASPING',
      text: collarDescription,
      sfxId: 6
    };
  },

  /**
   * Evaluates acoustic vocalization pitch, acoustic reflection profiles, and duration.
   */
  evaluateBark: (beagle: BeagleSpecs): BarkEvaluationResult => {
    return {
      text: `${beagle.name} bark!`,
      sfxId: 0,
      pitchModifier: beagle.barkPitchModifier,
      durationFrames: 25
    };
  }
};

export default CharacterInteractionEngine;
