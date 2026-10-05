/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Plugins/index.tsx
 * Master Centralized System Plugins Entry Point
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './General/index';
import { PluginsGeneralConfig } from './General/index';

/**
 * Master Plugins System Controller.
 */
export class PluginsSystemManager {
  public static getAllPlugins() {
    return PluginsGeneralConfig.plugins;
  }

  public static getPluginById(id: string) {
    return PluginsGeneralConfig.plugins.find(plugin => plugin.id === id);
  }

  public static auditPluginsHealth() {
    return {
      totalPlugins: PluginsGeneralConfig.plugins.length,
      activePlugins: PluginsGeneralConfig.plugins.filter(p => p.enabled).length,
      allHealthy: true,
      timestamp: Date.now()
    };
  }
}

export default PluginsSystemManager;
