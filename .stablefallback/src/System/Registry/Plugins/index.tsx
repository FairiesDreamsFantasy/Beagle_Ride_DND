/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Registry/Plugins/index.tsx
 * Master Plugins Registry Entry Point
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './General/index';
import { RegistryPluginsGeneralManager, RegistryPluginsGeneralConfig } from './General/index';

/**
 * Master Plugin Registry Gateway.
 */
export const PluginRegistryManager = {
  Manager: RegistryPluginsGeneralManager,
  Config: RegistryPluginsGeneralConfig,

  lookupPluginIndex(pluginId: string): number {
    return RegistryPluginsGeneralManager.getPluginIndex(pluginId);
  },

  lookupPluginByRegistryIndex(index: number) {
    return RegistryPluginsGeneralManager.getPluginByRegistryIndex(index);
  }
};

export default PluginRegistryManager;
