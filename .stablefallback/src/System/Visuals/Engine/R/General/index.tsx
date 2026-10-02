/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * R Specifications.
 */
export interface RConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_R_CONFIG: Readonly<RConfig> = Object.freeze({
  type: "R",
  version: "1.0.0",
  stability: "STABLE"
});
