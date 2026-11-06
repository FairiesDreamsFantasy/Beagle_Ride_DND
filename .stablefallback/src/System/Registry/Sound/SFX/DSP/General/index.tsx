/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SFXDopplerFrequencyShiftEngine, SFXAtmosphericAbsorptionModel } from '../../../../../Sound/SFX/DSP/General/index';

/**
 * Registry Sound SFX DSP Module.
 * Wired directly from System/Sound/SFX/DSP/General.
 */
export const RegistrySoundSFXDSPConfig = {
  id: 'REGISTRY_SOUND_SFX_DSP',
  type: 'SFX_DSP_PIPELINE_REGISTRY',
  dopplerEngine: SFXDopplerFrequencyShiftEngine.id,
  atmosphericAbsorption: SFXAtmosphericAbsorptionModel.id,
  precision: '64_BIT_DOUBLE_PRECISION'
};

export const RegistrySoundSFXDSP: React.FC = () => {
  return (
    <div id="registry-sound-sfx-dsp" className="hidden" aria-hidden="true">
      Registry Sound SFX DSP Gateway
    </div>
  );
};

export default RegistrySoundSFXDSP;
