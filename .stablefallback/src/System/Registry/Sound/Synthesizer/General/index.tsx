/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FourierSeriesWaveformGenerator, EqualTemperamentCentTuning } from '../../../../Sound/Synthesizer/General/index';

/**
 * Registry Sound Synthesizer Module.
 * Connects the 8 mathematical modules of Sound/Synthesizer to the deterministic Registry.
 */
export const RegistrySoundSynthesizerConfig = {
  id: 'REGISTRY_SOUND_SYNTHESIZER',
  type: 'MATHEMATICAL_SYNTHESIZER_REGISTRY',
  polyphonyVoices: 64,
  precision: '64_BIT_DOUBLE_PRECISION',
  waveformGenerator: FourierSeriesWaveformGenerator.id,
  tuningMatrix: EqualTemperamentCentTuning.id
};

export const RegistrySoundSynthesizer: React.FC = () => {
  return (
    <div id="registry-sound-synthesizer" className="hidden" aria-hidden="true">
      Registry Sound Synthesizer Gateway
    </div>
  );
};

export default RegistrySoundSynthesizer;
