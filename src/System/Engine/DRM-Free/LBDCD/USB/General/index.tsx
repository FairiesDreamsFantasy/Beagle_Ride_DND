/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface USBPortConfig {
  uvcVideoClass: true;
  uacAudioClass: true;
  isDirectCaptureSupported: true;
  protocolVersion: 'USB_2.0' | 'USB_3.2' | 'USB_4';
}

export const DEFAULT_USB_CONFIG: Readonly<USBPortConfig> = Object.freeze({
  uvcVideoClass: true,
  uacAudioClass: true,
  isDirectCaptureSupported: true,
  protocolVersion: 'USB_3.2'
});
