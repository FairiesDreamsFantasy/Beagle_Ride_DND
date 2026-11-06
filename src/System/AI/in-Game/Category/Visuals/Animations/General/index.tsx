/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSettings, BeagleSpecs, RiderSpecs, ViewMode } from '@/src/types';
import { BeagleRegistry } from '@/src/System/Registry/Character/Beagle/index';
import { RiderRegistry } from '@/src/System/Registry/Character/Rider/index';

export interface AnimationTelemetryVector {
  bobFrame: number;
  isMoving: boolean;
  isGalloping: boolean;
  isLeaning: boolean;
  jumpZ: number;
  selectedBeagle: string;
  selectedRider: string;
  viewMode: ViewMode;
}

export interface AnimationRenderParameters {
  strideFrequencyRad: number;
  verticalBobDisplacement: number;
  leanOffsetPixels: number;
  beagleSpriteHeight: number;
  cameraHorizonOffset: number;
  collarShakeFactor: number;
  coatColorHex: string;
  saddleColorHex: string;
  earColorHex: string;
  eyeColorHex: string;
  collarColorHex: string;
}

/**
 * General Visual Animations AI Category Engine.
 * Computes exact mathematical parameters for character and perspective animations.
 */
export const InGameAIVisualAnimationsGeneralEngine = {
  version: '1.0.0',
  description: 'AI-driven visual animation parameter calculator for 2.5D perspective rendering',

  /**
   * Evaluates visual animation parameters dynamically based on current game telemetry.
   */
  evaluateAnimationParameters(telemetry: AnimationTelemetryVector): AnimationRenderParameters {
    const beagleSpecs: BeagleSpecs = BeagleRegistry.find(b => b.id === telemetry.selectedBeagle) || BeagleRegistry[0];
    const riderSpecs: RiderSpecs = RiderRegistry.find(r => r.id === telemetry.selectedRider) || RiderRegistry[0];

    // Stride rhythm: Gallop vs Trot (Calibrated to 400ms cycle for gallop)
    const strideFrequencyRad = telemetry.isGalloping ? 0.19635 : 0.22;
    const maxBobAmplitude = telemetry.isGalloping ? 2.5 : 1.5;
    const verticalBobDisplacement = telemetry.isMoving ? Math.sin(telemetry.bobFrame) * maxBobAmplitude : 0;

    // Lean offset and collar shake
    const leanOffsetPixels = telemetry.isLeaning ? 12 : 0;
    const collarShakeFactor = telemetry.isMoving ? Math.abs(Math.sin(telemetry.bobFrame * 2)) * 1.8 : 0;

    // Beagle sprite rendering height based on shoulder height
    const baseHeight = beagleSpecs.shoulderHeightInches || 42;
    const beagleSpriteHeight = Math.round(baseHeight * 1.05);

    // Camera horizon offset combining walk bob and jump Z elevation
    const cameraHorizonOffset = -verticalBobDisplacement + (telemetry.jumpZ * 1.5);

    return {
      strideFrequencyRad,
      verticalBobDisplacement,
      leanOffsetPixels,
      beagleSpriteHeight,
      cameraHorizonOffset,
      collarShakeFactor,
      coatColorHex: beagleSpecs.skinColor || '#FFFFFF',
      saddleColorHex: beagleSpecs.color || '#FF5722',
      earColorHex: beagleSpecs.earColor || '#FF5722',
      eyeColorHex: beagleSpecs.eyeColor || '#1E3A8A',
      collarColorHex: beagleSpecs.collarColor || '#1E40AF'
    };
  }
};
