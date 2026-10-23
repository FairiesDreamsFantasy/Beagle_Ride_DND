/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HDDoublePrecisionUpsamplingEngine, HDNyquistShannonReconstructionModel } from '../../../../Sound/HD/General/index';

/**
 * Registry Sound HD Module.
 * Connects high-definition 64-bit audio mathematics to the deterministic Registry.
 */
export const RegistrySoundHDConfig = {
  id: 'REGISTRY_SOUND_HD',
  type: 'HD_AUDIO_PIPELINE_REGISTRY',
  upsampler: HDDoublePrecisionUpsamplingEngine.id,
  reconstruction: HDNyquistShannonReconstructionModel.id,
  sampleRate: 48000,
  targetBitDepth: 64
};

export const RegistrySoundHD: React.FC = () => {
  return (
    <div id="registry-sound-hd" className="hidden" aria-hidden="true">
      Registry Sound HD Gateway
    </div>
  );
};

export default RegistrySoundHD;
