/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { PS2PortConfig, DEFAULT_PS2_CONFIG } from './General/index';

export class PS2OutputController {
  private config: PS2PortConfig = { ...DEFAULT_PS2_CONFIG };

  public getStatus() {
    return { port: 'PS2', active: true, config: this.config };
  }
}

export const ps2OutputController = new PS2OutputController();
