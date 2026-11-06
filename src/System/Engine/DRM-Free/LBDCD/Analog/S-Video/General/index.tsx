/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SVideoPortConfig {
  luminanceY: boolean;
  chrominanceC: boolean;
  lines: 480 | 576;
}

export const DEFAULT_SVIDEO_CONFIG: Readonly<SVideoPortConfig> = Object.freeze({
  luminanceY: true,
  chrominanceC: true,
  lines: 480
});
