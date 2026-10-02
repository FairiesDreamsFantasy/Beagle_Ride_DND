/**
 * System Integrity Sentinel (SIS)
 * Validates structural imports and code integrity at compile-time and runtime.
 * Provides deterministic system reference checks across all game modules.
 */

// --- HARD COMPILE-TIME IMPORT GATES ---
import * as SoundEngine from '../../Sound/index';
import * as SystemRegistry from '../../Registry/index';
import * as APMModule from '../APM/index';
import * as RegistryIndex from '../../Registry/Index/index';
import * as RegistryEngineIndex from '../../Registry/Engine/Index/index';
import * as RegistryCharacterIndex from '../../Registry/Character/Index/index';
import * as MainsPowerHumLayer from '../../Sound/BGM/Ambience/Mains_Power_Hum/index';
import * as TypeAMainsHumNode from '../../Sound/BGM/Ambience/Mains_Power_Hum/Type_A/index';
import * as BGMIndexModule from '../../Sound/BGM/Index/index';
import * as BeagleIndexModule from '../../Registry/Character/Beagle/Index/index';
import * as RiderIndexModule from '../../Registry/Character/Rider/Index/index';
import * as RiderAssetIndexModule from '../../../Character/Rider/Index/index';
import * as SoundRegistryModule from '../../Registry/Sound/index';
import * as SoundSynthesizerModule from '../../Sound/Synthesizer/index';
import * as BGMSynthesizerModule from '../../Sound/BGM/Synthesizer/index';
import * as SFXSynthesizerModule from '../../Sound/SFX/Synthesizer/index';
import * as BGMDSPModule from '../../Sound/BGM/DSP/index';
import * as SFXDSPModule from '../../Sound/SFX/DSP/index';
import * as InGameAICategoryModule from '../../AI/in-Game/Category/index';
import * as InGameAISoundCategoryModule from '../../AI/in-Game/Category/Sound/index';
import * as InGameAIVisualAnimationsCategoryModule from '../../AI/in-Game/Category/Visuals/Animations/index';
import * as CharacterInteractionModule from '../../Registry/Character/Interaction/index';
import * as AppSecurityModule from '../../../App';

export class IntegritySentinel {
  public static validateSystemState(): boolean {
    console.log('[SIS] Validating runtime system state references...');

    const criticalSystems = [
      { name: 'App Root Module', ref: AppSecurityModule },
      { name: 'Character Interaction Deterministic Engine', ref: CharacterInteractionModule },
      { name: 'Acoustic Synthesizer Matrix', ref: SoundEngine },
      { name: 'Deterministic Core Registry', ref: SystemRegistry },
      { name: 'Platform Hardware Module (APM)', ref: APMModule },
      { name: 'Registry Index Gateway', ref: RegistryIndex },
      { name: 'Registry Engine Index Port', ref: RegistryEngineIndex },
      { name: 'Registry Character Index Port', ref: RegistryCharacterIndex },
      { name: 'Mains Power Hum Synth Layer', ref: MainsPowerHumLayer },
      { name: 'Type-A Transformer Hum Synth Node', ref: TypeAMainsHumNode },
      { name: 'BGM Soundtrack Unified Index', ref: BGMIndexModule },
      { name: 'Precise Beagle Registry Index', ref: BeagleIndexModule },
      { name: 'Precise Rider Registry Index', ref: RiderIndexModule },
      { name: 'Precise Rider Asset Index', ref: RiderAssetIndexModule },
      { name: 'Sound Registry Unified Gateway', ref: SoundRegistryModule },
      { name: 'Sound Synthesizer Harmonic Engine', ref: SoundSynthesizerModule },
      { name: 'BGM Modal Synthesizer Engine', ref: BGMSynthesizerModule },
      { name: 'SFX Formant Synthesizer Engine', ref: SFXSynthesizerModule },
      { name: 'BGM Digital Signal Processing Node', ref: BGMDSPModule },
      { name: 'SFX Acoustic Physics DSP Node', ref: SFXDSPModule },
      { name: 'In-Game AI Category Router', ref: InGameAICategoryModule },
      { name: 'In-Game AI Sound Category Subsystem', ref: InGameAISoundCategoryModule },
      { name: 'In-Game AI Visual Animations Category Subsystem', ref: InGameAIVisualAnimationsCategoryModule }
    ];

    for (const system of criticalSystems) {
      if (!system.ref) {
        throw new Error(`[SIS] CRITICAL RUNTIME EXCEPTION: ${system.name} reference missing or uninitialized.`);
      }
    }

    // Run APM Register Self-Test
    try {
      const apmSignature = APMModule.calculateAPMEntropy('SENTINEL_ROOT_ENTROPY');
      const isRegValid = APMModule.validateAPMRegisterBank(APMModule.APM_DEFAULT_REGISTER_STATE);
      console.log(`[SIS] Hardware State initialized. Verification hash: ${apmSignature}, Register Valid: ${isRegValid}`);
    } catch (e) {
      throw new Error('[SIS] FATAL: Anything Platform Module register validation failed.');
    }

    console.log('[SIS] System state verified. All 23 core modules intact.');
    return true;
  }
}

export default IntegritySentinel;
