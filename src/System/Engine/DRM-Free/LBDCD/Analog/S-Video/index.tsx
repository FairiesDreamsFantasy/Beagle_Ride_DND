/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { SVideoPortConfig, DEFAULT_SVIDEO_CONFIG } from './General/index';

export class SVideoOutputController {
  private config: SVideoPortConfig = { ...DEFAULT_SVIDEO_CONFIG };

  public getStatus() {
    return { port: 'S-VIDEO', active: true, config: this.config };
  }
}

export const sVideoOutputController = new SVideoOutputController();
