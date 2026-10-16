/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InGameAISoundGeneralCategoryEngine } from './General/index';
import { Position, BeagleSpecs, GameSettings } from '@/src/types';

export interface AcousticAIAnalysisResult {
  reverbProfile: string;
  notchFilterRequired: boolean;
  mainsPowerHumActive: boolean;
  calculatedBarkPitchHz: number;
  formantEnvelopeDescription: string;
  recommendedMasterGain: number;
}

/**
 * Sound AI Engine Interface Gateway.
 */
export const InGameAISoundCategoryEngine = {
  General: InGameAISoundGeneralCategoryEngine,

  /**
   * Evaluates room acoustics and vocal formant synthesis parameters.
   */
  evaluateAcousticMatrix: (params: {
    position: Position;
    beagle: BeagleSpecs;
    settings: GameSettings;
    activeRoom: 'FOYER' | 'PORCH' | 'GARDEN' | 'TEMPLE';
  }): AcousticAIAnalysisResult => {
    return InGameAISoundGeneralCategoryEngine.analyzeAcoustics(params);
  }
};

export { InGameAISoundGeneralCategoryEngine } from './General/index';
export default InGameAISoundCategoryEngine;
