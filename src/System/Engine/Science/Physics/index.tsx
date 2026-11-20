/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
import { TrigLUT } from '../../Mathematics/LUT/Trig';
import { CalculusModule } from '../../Mathematics/Calculus/index';
import { AlgebraModule } from '../../Mathematics/Algebra/index';

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

export interface MemoryBudgetMetrics {
  pixelCount: number;
  bytesPerFrameBuffer: number;
  kibPerFrameBuffer: number;
  bandwidthMBpsAt60Fps: number;
}

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Deterministic Scientific Physics Engine.
 * Uses TrigLUT, Velocity Verlet kinematics, and exponential damping to eliminate runtime math spikes.
 */
export const PhysicsEngine = {
  /**
   * Evaluates parabolic jump trajectory under constant gravitational acceleration.
   * Normalized by dtScale (1.0 = 1/60s) using exact constant-acceleration integration.
   */
  evaluateJumpArc: (currentZ: number, velocity: number, gravity: number, dtScale: number = 1.0): JumpArcResult => {
    if (currentZ <= 0 && velocity <= 0) {
      return { nextZ: 0, nextVelocity: 0, hasLanded: false };
    }

    const nextVelocity = velocity - gravity * dtScale;
    const nextZ = currentZ + (velocity + nextVelocity) * 0.5 * dtScale;

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
   * Symplectic Velocity Verlet jump kinematics for sub-step time dt.
   */
  evaluateJumpArcVerlet: (currentZ: number, velocity: number, gravity: number, dt: number = 1.0): JumpArcResult => {
    if (currentZ <= 0 && velocity <= 0) {
      return { nextZ: 0, nextVelocity: 0, hasLanded: false };
    }
    const { pos, vel } = CalculusModule.integrateVerlet(currentZ, velocity, -gravity, -gravity, dt);
    if (pos <= 0) {
      return { nextZ: 0, nextVelocity: 0, hasLanded: true };
    }
    return { nextZ: pos, nextVelocity: vel, hasLanded: false };
  },

  /**
   * Frame-rate independent exponential yaw/spring smoothing.
   */
  evaluateDamping: (current: number, target: number, lambda: number, dt: number): number => {
    return AlgebraModule.exponentialDamping(current, target, lambda, dt);
  },

  /**
   * Evaluates sinusoidal gait bobbing dynamics via O(1) TrigLUT and footstep impact events.
   * Calibrated:
   * - Trot: Alternating left/right paws (PI intervals).
   * - Gallop: 400ms rhythm (0.19635 radian increment, 24 frames/cycle at 60fps).
   */
  evaluateStride: (currentBobFrame: number, isGalloping: boolean, dtScale: number = 1.0): StrideEvaluationResult => {
    const bobIncrement = (isGalloping ? 0.19635 : 0.22) * dtScale;
    const nextBobFrame = currentBobFrame + bobIncrement;
    const walkBob = TrigLUT.sinInterpolated(nextBobFrame * RAD_TO_DEG) * (isGalloping ? 2.5 : 1.5);

    let isStepTransition = false;
    let isLeftFoot = false;
    let gallopCycleAdvanced = false;

    if (isGalloping) {
      const previousCycle = Math.floor(currentBobFrame / (Math.PI * 1.5));
      const currentCycle = Math.floor(nextBobFrame / (Math.PI * 1.5));
      if (currentCycle > previousCycle) {
        gallopCycleAdvanced = true;
      }
    } else {
      const previousStep = Math.floor(currentBobFrame / Math.PI);
      const currentStep = Math.floor(nextBobFrame / Math.PI);
      if (currentStep > previousStep) {
        isStepTransition = true;
        isLeftFoot = (currentStep & 1) === 0;
      }
    }

    return {
      nextBobFrame,
      walkBob,
      isStepTransition,
      isLeftFoot,
      gallopCycleAdvanced
    };
  },

  /**
   * Quantifies exact framebuffer RAM & bus bandwidth footprint from resolution parameters.
   */
  computeFrameMemoryBudget: (width: number, height: number, bytesPerPixel: number = 4): MemoryBudgetMetrics => {
    const pixelCount = Math.max(0, Math.floor(width) * Math.floor(height));
    const bytesPerFrameBuffer = pixelCount * bytesPerPixel;
    return {
      pixelCount,
      bytesPerFrameBuffer,
      kibPerFrameBuffer: Number((bytesPerFrameBuffer / 1024).toFixed(2)),
      bandwidthMBpsAt60Fps: Number(((bytesPerFrameBuffer * 60) / (1024 * 1024)).toFixed(2))
    };
  }
};

export default PhysicsEngine;
