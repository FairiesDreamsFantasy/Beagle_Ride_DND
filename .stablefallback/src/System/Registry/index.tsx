/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterRegistry } from './Character';
import { LandingPageRegistry } from './Landing_Page';
import { EngineRegistry } from './Engine';
import { RegistryGeneral } from './General';
import { WorldRegistry } from './Building_Blocks';
import { ItemsRegistry } from './Items';
import { ComponentsRegistry } from './Components';
import { UIRegistry } from './UI';
import { DOMRegistry } from './DOM';
import { VisualsRegistry } from './Visuals';
import { KeyboardsAndControllersRegistry } from './Keyboards_and_Controllers';
import { SoundRegistry } from './Sound';
import { PluginRegistryManager } from './Plugins';

export * from './General';
export * from './Engine';
export * from './Building_Blocks';
export * from './Items';
export * from './Components';
export * from './UI';
export * from './DOM';
export * from './Visuals';
export * from './Keyboards_and_Controllers';
export * from './Sound';
export * from './Plugins';

/**
 * System Registry Entry Point.
 * Centralizes all mathematical data structures.
 */
export const SystemRegistry = {
  Characters: CharacterRegistry,
  LandingPage: LandingPageRegistry,
  Engine: EngineRegistry,
  General: RegistryGeneral,
  BuildingBlocks: WorldRegistry,
  Items: ItemsRegistry,
  Components: ComponentsRegistry,
  UI: UIRegistry,
  DOM: DOMRegistry,
  Visuals: VisualsRegistry,
  KeyboardsAndControllers: KeyboardsAndControllersRegistry,
  Sound: SoundRegistry,
  Plugins: PluginRegistryManager,
  version: '2.0.0'
};


export default SystemRegistry;
