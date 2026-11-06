/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AcousticWaveSpeedTemperatureModel, SabineReverberationRT60Calculator } from '../../../../Sound/Engine/General/index';

/**
 * Registry Sound Engine Module.
 * Integrates physical wave mechanics and Sabine reverberation into the Registry.
 */
export const RegistrySoundEngineConfig = {
  id: 'REGISTRY_SOUND_ENGINE',
  type: 'PHYSICAL_ACOUSTICS_ENGINE_REGISTRY',
  waveSpeedModel: AcousticWaveSpeedTemperatureModel.id,
  rt60Calculator: SabineReverberationRT60Calculator.id,
  sampleRate: 44100
};

export const RegistrySoundEngine: React.FC = () => {
  return (
    <div id="registry-sound-engine" className="hidden" aria-hidden="true">
      Registry Sound Engine Gateway
    </div>
  );
};

export default RegistrySoundEngine;
