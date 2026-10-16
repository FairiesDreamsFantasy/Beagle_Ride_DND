/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { COMPortConfig, DEFAULT_COM_CONFIG } from './General/index';

export class COMPortOutputController {
  private config: COMPortConfig = { ...DEFAULT_COM_CONFIG };

  public getStatus() {
    return { port: 'COM', active: true, config: this.config };
  }
}

export const comPortOutputController = new COMPortOutputController();
