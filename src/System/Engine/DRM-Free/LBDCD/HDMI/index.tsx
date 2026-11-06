/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { HDMIPortConfig, DEFAULT_HDMI_CONFIG } from './General/index';

export class HDMIOutputController {
  private config: HDMIPortConfig = { ...DEFAULT_HDMI_CONFIG };

  public getStatus() {
    return { port: 'HDMI', active: true, config: this.config };
  }
}

export const hdmiOutputController = new HDMIOutputController();
