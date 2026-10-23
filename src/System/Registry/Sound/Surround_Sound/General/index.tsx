/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ITURBS775SurroundSpeakerMatrix, VectorBaseAmplitudePanning3D } from '../../../../Sound/Surround_Sound/General/index';

/**
 * Registry Sound Surround Sound Module.
 * Integrates ITU-R BS.775 5.1 and 3D VBAP amplitude panning into the Registry.
 */
export const RegistrySoundSurroundSoundConfig = {
  id: 'REGISTRY_SOUND_SURROUND_SOUND',
  type: '5_1_SURROUND_AND_VBAP_REGISTRY',
  speakerMatrix: ITURBS775SurroundSpeakerMatrix.id,
  vbapModel: VectorBaseAmplitudePanning3D.id,
  channels: 5.1
};

export const RegistrySoundSurroundSound: React.FC = () => {
  return (
    <div id="registry-sound-surround-sound" className="hidden" aria-hidden="true">
      Registry Sound Surround Sound Gateway
    </div>
  );
};

export default RegistrySoundSurroundSound;
