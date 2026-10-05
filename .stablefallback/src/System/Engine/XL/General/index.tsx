/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * XL Specifications.
 */
export interface XLConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_XL_CONFIG: Readonly<XLConfig> = Object.freeze({
  type: "XL",
  version: "1.0.0",
  stability: "STABLE"
});
