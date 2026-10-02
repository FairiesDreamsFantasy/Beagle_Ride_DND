/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

export interface JumpArcResult {
  nextZ: number;
  nextVelocity: number;
  hasLanded: boolean;
}

export interface StrideEvaluationResult {
  nextBobFrame: number;
  walkBob: number;
  isStepTransition: boolean;
  isLeftFoot: boolean;
  gallopCycleAdvanced: boolean;
}

/**
 * Deterministic Physics Engine.
 * Provides analytical physics integration for ballistic jump trajectories,
 * sinusoidal stride bobbing, and gallop scuff cadence.
 */
export const PhysicsEngine = {
  /**
   * Evaluates parabolic jump trajectory under constant gravitational acceleration.
   */
  evaluateJumpArc: (currentZ: number, velocity: number, gravity: number): JumpArcResult => {
    if (currentZ <= 0 && velocity <= 0) {
      return { nextZ: 0, nextVelocity: 0, hasLanded: false };
    }

    let nextZ = currentZ + velocity;
    let nextVelocity = velocity - gravity;

    if (nextZ <= 0) {
      return {
        nextZ: 0,
        nextVelocity: 0,
        hasLanded: true
      };
    }

    return {
      nextZ,
      nextVelocity,
      hasLanded: false
    };
  },

  /**
   * Evaluates sinusoidal gait bobbing dynamics and footstep impact events.
   * Calibrated:
   * - Trot: Alternating left/right paws (PI intervals).
   * - Gallop: 400ms rhythm (0.19635 radian increment, 24 frames/cycle at 60fps).
   */
  evaluateStride: (currentBobFrame: number, isGalloping: boolean): StrideEvaluationResult => {
    const bobIncrement = isGalloping ? 0.19635 : 0.22;
    const nextBobFrame = currentBobFrame + bobIncrement;
    const walkBob = Math.sin(nextBobFrame) * (isGalloping ? 2.5 : 1.5);

    let isStepTransition = false;
    let isLeftFoot = false;
    let gallopCycleAdvanced = false;

    if (isGalloping) {
      const previousCycle = Math.floor((currentBobFrame - 0.19635) / (Math.PI * 1.5));
      const currentCycle = Math.floor(nextBobFrame / (Math.PI * 1.5));
      if (currentCycle > previousCycle) {
        gallopCycleAdvanced = true;
      }
    } else {
      const previousStep = Math.floor((currentBobFrame - 0.22) / Math.PI);
      const currentStep = Math.floor(nextBobFrame / Math.PI);
      if (currentStep > previousStep) {
        isStepTransition = true;
        isLeftFoot = currentStep % 2 === 0;
      }
    }

    return {
      nextBobFrame,
      walkBob,
      isStepTransition,
      isLeftFoot,
      gallopCycleAdvanced
    };
  }
};

export default PhysicsEngine;
