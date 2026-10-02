/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { WorksOfflineConfig, DEFAULT_WORKS_OFFLINE_CONFIG } from './General/index';

export class WorksOfflineController {
  private config: WorksOfflineConfig = { ...DEFAULT_WORKS_OFFLINE_CONFIG };

  public verifyOfflineCapability(): boolean {
    return !this.config.requiresInternetHandshake;
  }
}

export const worksOfflineController = new WorksOfflineController();
