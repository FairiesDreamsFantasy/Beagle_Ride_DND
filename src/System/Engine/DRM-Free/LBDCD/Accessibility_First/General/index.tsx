/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AccessibilityOutputConfig {
  highContrastVideoMirror: boolean;
  audioDescriptionBus: boolean;
  screenReaderPassthrough: boolean;
}

export const DEFAULT_ACCESSIBILITY_OUTPUT: Readonly<AccessibilityOutputConfig> = Object.freeze({
  highContrastVideoMirror: true,
  audioDescriptionBus: true,
  screenReaderPassthrough: true
});
