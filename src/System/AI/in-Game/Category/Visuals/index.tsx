/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/AI/in-Game/Category/Visuals/index.tsx
 * Ultra-Scientific In-Game Visual AI Evaluation Engine
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './Animations/index';
export * from './Resolution/index';
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
    const out: VisualAIState = {
      earFlopFrequencyHz: 1.2,
      eyeBlinkPeriodFrames: 180,
      tailWagAmplitudeDeg: 8,
      furSheenFactor: 0.7,
      reinsTensionRatio: 0.4
    };
    return this.evaluateCanineVisualStateInto(out, beagle, isMoving, isBarking, isPetting);
  },

  evaluateCanineVisualStateInto(
    out: VisualAIState,
    beagle: BeagleSpecs,
    isMoving: boolean,
    _isBarking: boolean,
    isPetting: boolean
  ): VisualAIState {
    const baseWag = isPetting ? 45 : (isMoving ? 25 : 8);
    const tailFactor = beagle.tailStyle === 'SICKLE' ? 1.3 : 1.0;
    out.earFlopFrequencyHz = isMoving ? 3.5 : 1.2;
    out.eyeBlinkPeriodFrames = isPetting ? 240 : 180;
    out.tailWagAmplitudeDeg = Math.min(60, baseWag * tailFactor);
    out.furSheenFactor = Math.min(1.0, 0.7 * beagle.furThicknessFactor);
    out.reinsTensionRatio = isMoving ? 0.85 : 0.40;
    return out;
  }
};

export default InGameAIVisualsEngine;
