/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { AVPortConfig, DEFAULT_AV_CONFIG } from './General/index';

export class AVOutputController {
  private config: AVPortConfig = { ...DEFAULT_AV_CONFIG };

  public getStatus() {
    return { port: 'AV', active: true, config: this.config };
  }
}

export const avOutputController = new AVOutputController();
