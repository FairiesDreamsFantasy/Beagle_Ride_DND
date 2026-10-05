/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { VGAPortConfig, DEFAULT_VGA_CONFIG } from './General/index';

export class VGAOutputController {
  private config: VGAPortConfig = { ...DEFAULT_VGA_CONFIG };

  public getStatus() {
    return { port: 'VGA', active: true, config: this.config };
  }
}

export const vgaOutputController = new VGAOutputController();
