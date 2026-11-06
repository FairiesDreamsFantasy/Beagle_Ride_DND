/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Position, BeagleSpecs, RiderSpecs, GameSettings } from '@/src/types';

export interface GeneralAIAnalysisResult {
  beagleSummary: string;
  riderSummary: string;
  environmentalContext: string;
  interactionMode: string;
  telemetryVector: {
    x: number;
    y: number;
    angle: number;
    direction: string;
    speedFactor: number;
  };
}

/**
 * General In-Game AI Engine.
 * Formulates non-hardcoded context descriptors grounded in exact world telemetry.
 */
export const InGameAIGeneralCategoryEngine = {
  /**
   * Analyzes current world state telemetry.
   */
  analyzeContext: (params: {
    position: Position;
    beagle: BeagleSpecs;
    rider: RiderSpecs;
    settings: GameSettings;
    activeRoom: 'FOYER' | 'PORCH' | 'GARDEN' | 'TEMPLE';
  }): GeneralAIAnalysisResult => {
    const { position, beagle, rider, settings, activeRoom } = params;

    const beagleSummary = `${beagle.name} (${beagle.breed}, ${beagle.gender}), shoulder height: ${beagle.shoulderHeightFeet}'${beagle.shoulderHeightInches}", coat: ${beagle.color}, collar: ${beagle.collarColor} (${beagle.collarDecorations}).`;
    const riderSummary = `${rider.name} (${rider.description}), eye height: ${rider.eyeHeight}ft, primary tone: ${rider.primaryColor}.`;
    const environmentalContext = `Active realm: ${activeRoom}. Orientation: ${position.direction} (${position.angle}°). Coordinates: [X:${position.x.toFixed(1)}, Y:${position.y.toFixed(1)}].`;
    const interactionMode = `View mode: ${settings.viewMode}, Audio state: ${settings.isMuted ? 'Muted' : `Volume ${(settings.volume * 100).toFixed(0)}%`}.`;

    return {
      beagleSummary,
      riderSummary,
      environmentalContext,
      interactionMode,
      telemetryVector: {
        x: position.x,
        y: position.y,
        angle: position.angle,
        direction: position.direction,
        speedFactor: beagle.furThicknessFactor
      }
    };
  }
};

export default InGameAIGeneralCategoryEngine;
