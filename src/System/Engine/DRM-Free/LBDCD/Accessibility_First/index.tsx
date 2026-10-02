/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { AccessibilityOutputConfig, DEFAULT_ACCESSIBILITY_OUTPUT } from './General/index';

export class AccessibilityFirstOutputController {
  private config: AccessibilityOutputConfig = { ...DEFAULT_ACCESSIBILITY_OUTPUT };

  public getConfig(): AccessibilityOutputConfig {
    return this.config;
  }
}

export const accessibilityFirstOutputController = new AccessibilityFirstOutputController();
