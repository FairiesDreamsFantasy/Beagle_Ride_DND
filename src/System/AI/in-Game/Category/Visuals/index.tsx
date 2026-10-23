/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/AI/in-Game/Category/Visuals/index.tsx
 * Ultra-Scientific In-Game Visual AI Evaluation Engine
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './Animations/index';
import { BeagleSpecs } from '@/src/types';

export interface VisualAIState {
  earFlopFrequencyHz: number;
  eyeBlinkPeriodFrames: number;
  tailWagAmplitudeDeg: number;
  furSheenFactor: number;
  reinsTensionRatio: number;
}

export const InGameAIVisualsEngine = {
  /**
   * Deterministically calculates dynamic visual state variables for canine character rendering.
   */
  evaluateCanineVisualState(beagle: BeagleSpecs, isMoving: boolean, isBarking: boolean, isPetting: boolean): VisualAIState {
    const baseWag = isPetting ? 45 : (isMoving ? 25 : 8);
    const tailFactor = beagle.tailStyle === 'SICKLE' ? 1.3 : 1.0;
    const wagAmplitude = Math.min(60, baseWag * tailFactor);
    const earFreq = isMoving ? 3.5 : 1.2;
    const blinkPeriod = isPetting ? 240 : 180; // Pets relax eyes
    const sheen = Math.min(1.0, 0.7 * beagle.furThicknessFactor);
    const tension = isMoving ? 0.85 : 0.40;

    return {
      earFlopFrequencyHz: earFreq,
      eyeBlinkPeriodFrames: blinkPeriod,
      tailWagAmplitudeDeg: wagAmplitude,
      furSheenFactor: sheen,
      reinsTensionRatio: tension,
    };
  }
};

export default InGameAIVisualsEngine;
