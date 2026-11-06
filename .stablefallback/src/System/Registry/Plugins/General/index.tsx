/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Registry/Plugins/General/index.tsx
 * Deterministic O(1) Plugins Registry Map & Index Suite
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

import { PluginsGeneralConfig } from '../../../Plugins/General/index';

/**
 * Deterministic O(1) Key-Value Plugin Index Register Map.
 */
export const REGISTRY_PLUGINS_INDEX_MAP: ReadonlyMap<string, number> = new Map([
  ['PLUGIN_VITE_REACT', 0],
  ['PLUGIN_TAILWIND_VITE', 1],
  ['PLUGIN_SECURITY_SENTINEL', 2],
  ['PLUGIN_AUDIO_DSP', 3],
  ['PLUGIN_PHYSICS_COLLISION', 4],
  ['PLUGIN_ACCESSIBILITY_SPEECH', 5],
  ['PLUGIN_MEMORY_SAFETY', 6]
]);

export class RegistryPluginsGeneralManager {
  public static getPluginIndex(pluginId: string): number {
    return REGISTRY_PLUGINS_INDEX_MAP.get(pluginId) ?? -1;
  }

  public static getPluginByRegistryIndex(index: number) {
    return PluginsGeneralConfig.plugins[index] ?? null;
  }

  public static isPluginRegistered(pluginId: string): boolean {
    return REGISTRY_PLUGINS_INDEX_MAP.has(pluginId);
  }
}

export const RegistryPluginsGeneralConfig = {
  registryName: 'RegistryPluginsGeneral',
  totalRegisteredPlugins: REGISTRY_PLUGINS_INDEX_MAP.size,
  precision: 'O(1)_DETERMINISTIC_MEMORY_MAP'
};

export default RegistryPluginsGeneralManager;
