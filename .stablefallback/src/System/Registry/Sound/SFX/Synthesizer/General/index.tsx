/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FormantVocalFilterSynthesizer, TransientImpulseGenerator } from '../../../../../Sound/SFX/Synthesizer/General/index';

/**
 * Registry Sound SFX Synthesizer Module.
 * Connects canine formant filters and transient acoustics to the deterministic Registry.
 */
export const RegistrySoundSFXSynthesizerConfig = {
  id: 'REGISTRY_SOUND_SFX_SYNTHESIZER',
  type: 'SFX_FORMANT_SYNTHESIZER_REGISTRY',
  formantVocalFilter: FormantVocalFilterSynthesizer.id,
  transientImpulse: TransientImpulseGenerator.id,
  polyphonyVoices: 32
};

export const RegistrySoundSFXSynthesizer: React.FC = () => {
  return (
    <div id="registry-sound-sfx-synthesizer" className="hidden" aria-hidden="true">
      Registry Sound SFX Synthesizer Gateway
    </div>
  );
};

export default RegistrySoundSFXSynthesizer;
