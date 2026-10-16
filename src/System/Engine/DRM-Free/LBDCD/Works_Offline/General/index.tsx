/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WorksOfflineConfig {
  requiresInternetHandshake: false;
  localKeyValidation: false;
  offlineAssetStreaming: true;
}

export const DEFAULT_WORKS_OFFLINE_CONFIG: Readonly<WorksOfflineConfig> = Object.freeze({
  requiresInternetHandshake: false,
  localKeyValidation: false,
  offlineAssetStreaming: true
});
