/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Sound/BGM/Ambience/index.tsx
 * Master Ambience Synthesis Gateway
 * Protected under the 1999.999999999999% Hardening Mandate (5000^1000000% Factor).
 */

export * from './City/index';
export * from './Mains_Power_Hum/index';

import { cityAmbienceController } from './City/index';
import { MasterMainsPowerHumManager } from './Mains_Power_Hum/index';

/**
 * Unified Ambience Audio Architecture.
 */
export const BGMAmbience = {
  layering: 'DYNAMIC',
  precision: '64-BIT_IEEE_754',
  samplingRate: 192000,
  bitDepth: 64,

  City: cityAmbienceController,
  MainsHum: MasterMainsPowerHumManager,

  startCityAmbience(volume = 0.2) {
    return cityAmbienceController.play(volume);
  },

  stopCityAmbience(fadeSec = 0.5) {
    cityAmbienceController.stop(fadeSec);
  },

  startMainsHum(volume = 0.15) {
    return MasterMainsPowerHumManager.startHum(volume);
  },

  stopMainsHum(fadeSec = 0.5) {
    MasterMainsPowerHumManager.stopHum(fadeSec);
  }
};

export default BGMAmbience;
