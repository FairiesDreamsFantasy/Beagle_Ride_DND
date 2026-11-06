/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MasterLogarithmicGainCurveModel, MasterEqualLoudnessContourEngine } from '../../../../Sound/Master_Volume_Control/General/index';

/**
 * Registry Sound Master Volume Control Module.
 * Integrates Weber-Fechner perceptual volume and ISO 226 loudness into the Registry.
 */
export const RegistrySoundMasterVolumeControlConfig = {
  id: 'REGISTRY_SOUND_MASTER_VOLUME_CONTROL',
  type: 'PERCEPTUAL_MASTER_GAIN_REGISTRY',
  gainCurveModel: MasterLogarithmicGainCurveModel.id,
  loudnessContour: MasterEqualLoudnessContourEngine.id,
  calibratedGain: 0.819
};

export const RegistrySoundMasterVolumeControl: React.FC = () => {
  return (
    <div id="registry-sound-master-volume-control" className="hidden" aria-hidden="true">
      Registry Sound Master Volume Control Gateway
    </div>
  );
};

export default RegistrySoundMasterVolumeControl;
