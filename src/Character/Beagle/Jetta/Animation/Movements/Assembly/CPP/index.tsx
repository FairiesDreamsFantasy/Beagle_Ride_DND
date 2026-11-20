/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Beagle/Jetta/Animation/Movements/Assembly/CPP/index.tsx
 * Domain: Jetta:LocomotionKinematics (CPP Kernel)
 */

export interface CharacterFrameState {
  phaseRad: number;
  elevationFt: number;
  pitchScale: number;
}

export class CharacterCPPLogic {
  public static status = "Operational";
  public static readonly domain = "Jetta:LocomotionKinematics";
  public static readonly eyeHeightFt = 5.5;
  public static readonly strideHz = 3;

  public static clampElevation(zFt: number, minFt: number = 0, maxFt: number = 24): number {
    return zFt < minFt ? minFt : zFt > maxFt ? maxFt : zFt;
  }

  public static advanceStridePhase(currentPhaseRad: number, dtSec: number): number {
    const tau = Math.PI * 2;
    const next = currentPhaseRad + tau * this.strideHz * Math.max(0, dtSec);
    return next >= tau ? next - Math.floor(next / tau) * tau : next;
  }

  public static resetState(state: CharacterFrameState): void {
    state.phaseRad = 0;
    state.elevationFt = 0;
    state.pitchScale = 1;
  }
}
