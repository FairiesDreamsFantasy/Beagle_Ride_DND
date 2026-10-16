/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { KeyboardFirstConfig, DEFAULT_KEYBOARD_FIRST_CONFIG } from './General/index';

export class KeyboardFirstController {
  private config: KeyboardFirstConfig = { ...DEFAULT_KEYBOARD_FIRST_CONFIG };

  public getStatus() {
    return { module: 'Keyboard_First', config: this.config };
  }
}

export const keyboardFirstController = new KeyboardFirstController();
