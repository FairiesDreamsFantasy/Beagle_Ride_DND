/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
export * from './Synthesizer/index';
export * from './HD/index';
export * from './BGM/Synthesizer/index';
export * from './SFX/Synthesizer/index';
export * from './Engine/index';
export * from './Master_Volume_Control/index';
export * from './Surround_Sound/index';
export * from './DSP/index';
export * from './BGM/DSP/index';
export * from './SFX/DSP/index';

import { SoundRegistryGeneralConfig } from './General/index';
import { RegistrySoundSynthesizerConfig } from './Synthesizer/index';
import { RegistrySoundHDConfig } from './HD/index';
import { RegistrySoundBGMSynthesizerConfig } from './BGM/Synthesizer/index';
import { RegistrySoundSFXSynthesizerConfig } from './SFX/Synthesizer/index';
import { RegistrySoundEngineConfig } from './Engine/index';
import { RegistrySoundMasterVolumeControlConfig } from './Master_Volume_Control/index';
import { RegistrySoundSurroundSoundConfig } from './Surround_Sound/index';
import { RegistrySoundDSPConfig } from './DSP/index';
import { RegistrySoundBGMDSPConfig } from './BGM/DSP/index';
import { RegistrySoundSFXDSPConfig } from './SFX/DSP/index';

/**
 * Deterministic Sound Registry.
 * Aggregates all mathematical acoustic architectures.
 */
export const SoundRegistry = {
  version: '2.0.0-ultra-precise',
  General: SoundRegistryGeneralConfig,
  Synthesizer: RegistrySoundSynthesizerConfig,
  HD: RegistrySoundHDConfig,
  BGMSynthesizer: RegistrySoundBGMSynthesizerConfig,
  SFXSynthesizer: RegistrySoundSFXSynthesizerConfig,
  Engine: RegistrySoundEngineConfig,
  MasterVolumeControl: RegistrySoundMasterVolumeControlConfig,
  SurroundSound: RegistrySoundSurroundSoundConfig,
  DSP: RegistrySoundDSPConfig,
  BGMDSP: RegistrySoundBGMDSPConfig,
  SFXDSP: RegistrySoundSFXDSPConfig
};

export default SoundRegistry;
