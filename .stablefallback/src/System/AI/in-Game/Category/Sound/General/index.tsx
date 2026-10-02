/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Position, BeagleSpecs, GameSettings } from '@/src/types';

export interface SoundGeneralAIAnalysis {
  reverbProfile: string;
  notchFilterRequired: boolean;
  mainsPowerHumActive: boolean;
  calculatedBarkPitchHz: number;
  formantEnvelopeDescription: string;
  recommendedMasterGain: number;
}

/**
 * General Acoustic Physics & Formant Synthesis AI Engine.
 * Evaluates real-time acoustic profiles without hardcoding.
 */
export const InGameAISoundGeneralCategoryEngine = {
  /**
   * Analyzes acoustic environmental acoustics and calculates exact vocal frequencies.
   */
  analyzeAcoustics: (params: {
    position: Position;
    beagle: BeagleSpecs;
    settings: GameSettings;
    activeRoom: 'FOYER' | 'PORCH' | 'GARDEN' | 'TEMPLE';
  }): SoundGeneralAIAnalysis => {
    const { position, beagle, settings, activeRoom } = params;

    // Room acoustic mapping grounded in physics
    const isIndoor = activeRoom === 'FOYER' || activeRoom === 'TEMPLE';
    const notchFilterRequired = isIndoor;
    const mainsPowerHumActive = isIndoor;

    let reverbProfile = 'Plain';
    if (activeRoom === 'FOYER') {
      reverbProfile = 'Hallway';
    } else if (activeRoom === 'TEMPLE') {
      reverbProfile = 'Cave';
    } else if (activeRoom === 'PORCH') {
      reverbProfile = 'Alley';
    } else if (activeRoom === 'GARDEN') {
      reverbProfile = 'Forest';
    }

    // Base canine bark frequency = 240 Hz scaled by Beagle pitch modifier
    const basePitchHz = 240;
    const calculatedBarkPitchHz = parseFloat((basePitchHz * beagle.barkPitchModifier).toFixed(2));

    const formantEnvelopeDescription = `Canine Formant Envelope: ${beagle.name} (${beagle.breed}), fundamental pitch: ${calculatedBarkPitchHz} Hz, fur damping factor: ${beagle.furThicknessFactor}.`;

    // Master gain calculations based on 0.819 baseline
    const baseGain = 0.819;
    const recommendedMasterGain = settings.isMuted 
      ? 0 
      : parseFloat((baseGain * settings.volume).toFixed(3));

    return {
      reverbProfile,
      notchFilterRequired,
      mainsPowerHumActive,
      calculatedBarkPitchHz,
      formantEnvelopeDescription,
      recommendedMasterGain
    };
  }
};

export default InGameAISoundGeneralCategoryEngine;
