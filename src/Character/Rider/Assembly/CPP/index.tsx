/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/Character/Rider/Assembly/CPP/index.tsx
 * Domain: RiderSubsystem:Core (CPP Kernel)
 */

export interface CharacterFrameState {
  phaseRad: number;
  elevationFt: number;
  pitchScale: number;
}

export class CharacterCPPLogic {
  public static status = "Operational";
  public static readonly domain = "RiderSubsystem:Core";
  public static readonly eyeHeightFt = 5.25;
  public static readonly strideHz = 2.4;

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
