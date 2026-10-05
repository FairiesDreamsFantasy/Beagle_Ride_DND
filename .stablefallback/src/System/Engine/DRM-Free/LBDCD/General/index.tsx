/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Low-Bandwidth Digital Content Delivery (LBDCD) Core Definitions.
 * An open-source, zero-restriction alternative to proprietary HDCP protocols.
 */
export type LBDCDPortType =
  | 'VGA'
  | '3.5MM'
  | 'AV'
  | 'S-VIDEO'
  | 'HDMI'
  | 'ETHERNET'
  | 'WIRED_GENERIC'
  | 'USB'
  | 'PS2'
  | 'COM'
  | 'ACCESSIBILITY_OUTPUT';

export interface LBDCDPortStatus {
  portType: LBDCDPortType;
  isActive: boolean;
  bandwidthKbps: number;
  captureCardSupported: true;
  screenshotPermitted: true;
}

export const SUPPORTED_LBDCD_PORTS: readonly LBDCDPortType[] = Object.freeze([
  'VGA',
  '3.5MM',
  'AV',
  'S-VIDEO',
  'HDMI',
  'ETHERNET',
  'WIRED_GENERIC',
  'USB',
  'PS2',
  'COM',
  'ACCESSIBILITY_OUTPUT'
]);
