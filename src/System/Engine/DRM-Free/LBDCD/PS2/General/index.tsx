/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PS2PortConfig {
  keyboardClockHz: number;
  mouseDataProtocol: string;
  legacyHardwareSync: true;
}

export const DEFAULT_PS2_CONFIG: Readonly<PS2PortConfig> = Object.freeze({
  keyboardClockHz: 16000,
  mouseDataProtocol: 'STREAM_PACKET',
  legacyHardwareSync: true
});
