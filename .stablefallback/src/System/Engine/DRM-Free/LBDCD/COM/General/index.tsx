/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface COMPortConfig {
  baudRate: 9600 | 115200;
  dataBits: 8;
  parity: 'NONE';
  stopBits: 1;
}

export const DEFAULT_COM_CONFIG: Readonly<COMPortConfig> = Object.freeze({
  baudRate: 115200,
  dataBits: 8,
  parity: 'NONE',
  stopBits: 1
});
