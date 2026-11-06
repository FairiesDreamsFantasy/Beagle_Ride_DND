/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * C Specifications.
 */
export interface CConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_C_CONFIG: Readonly<CConfig> = Object.freeze({
  type: "C",
  version: "1.0.0",
  stability: "STABLE"
});
