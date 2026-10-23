/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModalHarmonicScaleGenerator, PolyphonicArpeggiatorStepMatrix } from '../../../../../Sound/BGM/Synthesizer/General/index';

/**
 * Registry Sound BGM Synthesizer Module.
 * Bridges musical arpeggiation and modal harmonic mathematics to the Registry.
 */
export const RegistrySoundBGMSynthesizerConfig = {
  id: 'REGISTRY_SOUND_BGM_SYNTHESIZER',
  type: 'BGM_MODAL_SYNTHESIZER_REGISTRY',
  scaleGenerator: ModalHarmonicScaleGenerator.id,
  arpeggiatorMatrix: PolyphonicArpeggiatorStepMatrix.id,
  defaultTempo: 135
};

export const RegistrySoundBGMSynthesizer: React.FC = () => {
  return (
    <div id="registry-sound-bgm-synthesizer" className="hidden" aria-hidden="true">
      Registry Sound BGM Synthesizer Gateway
    </div>
  );
};

export default RegistrySoundBGMSynthesizer;
