/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BGMHarmonicNotchFilterMatrix, BGMTempoSyncDelayLineEngine } from '../../../../../Sound/BGM/DSP/General/index';

/**
 * Registry Sound BGM DSP Module.
 * Wired directly from System/Sound/BGM/DSP/General.
 */
export const RegistrySoundBGMDSPConfig = {
  id: 'REGISTRY_SOUND_BGM_DSP',
  type: 'BGM_DSP_PIPELINE_REGISTRY',
  harmonicNotchMatrix: BGMHarmonicNotchFilterMatrix.id,
  tempoSyncDelayEngine: BGMTempoSyncDelayLineEngine.id,
  channels: 2,
  sampleRate: 48000
};

export const RegistrySoundBGMDSP: React.FC = () => {
  return (
    <div id="registry-sound-bgm-dsp" className="hidden" aria-hidden="true">
      Registry Sound BGM DSP Gateway
    </div>
  );
};

export default RegistrySoundBGMDSP;
