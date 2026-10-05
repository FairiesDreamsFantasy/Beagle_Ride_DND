/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DSPBiquadBandPassFilterEngine, DSPFastFourierTransformRadix2 } from '../../../../Sound/DSP/General/index';

/**
 * Registry Sound DSP Module.
 * Integrates Radix-2 FFT and biquad digital signal processing into the Registry.
 */
export const RegistrySoundDSPConfig = {
  id: 'REGISTRY_SOUND_DSP',
  type: 'DIGITAL_SIGNAL_PROCESSING_REGISTRY',
  bandPassEngine: DSPBiquadBandPassFilterEngine.id,
  fftAnalyzer: DSPFastFourierTransformRadix2.id,
  sampleRate: 48000
};

export const RegistrySoundDSP: React.FC = () => {
  return (
    <div id="registry-sound-dsp" className="hidden" aria-hidden="true">
      Registry Sound DSP Gateway
    </div>
  );
};

export default RegistrySoundDSP;
