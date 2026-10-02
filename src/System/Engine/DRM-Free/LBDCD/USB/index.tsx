/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { USBPortConfig, DEFAULT_USB_CONFIG } from './General/index';

export class USBOutputController {
  private config: USBPortConfig = { ...DEFAULT_USB_CONFIG };

  public getStatus() {
    return { port: 'USB', active: true, config: this.config };
  }
}

export const usbOutputController = new USBOutputController();
