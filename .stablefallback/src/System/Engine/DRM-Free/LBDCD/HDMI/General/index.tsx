/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HDMIPortConfig {
  hdcpEnabled: false;
  uncompressedStream: true;
  supportsCaptureCards: true;
  cecPassthrough: boolean;
}

export const DEFAULT_HDMI_CONFIG: Readonly<HDMIPortConfig> = Object.freeze({
  hdcpEnabled: false,
  uncompressedStream: true,
  supportsCaptureCards: true,
  cecPassthrough: true
});
