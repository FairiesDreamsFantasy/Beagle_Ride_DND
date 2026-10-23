/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KeyboardFirstConfig {
  hotkeyScreenshotEnabled: true;
  hotkeyVideoCaptureToggle: true;
  unrestrictedKeyBinding: true;
}

export const DEFAULT_KEYBOARD_FIRST_CONFIG: Readonly<KeyboardFirstConfig> = Object.freeze({
  hotkeyScreenshotEnabled: true,
  hotkeyVideoCaptureToggle: true,
  unrestrictedKeyBinding: true
});
