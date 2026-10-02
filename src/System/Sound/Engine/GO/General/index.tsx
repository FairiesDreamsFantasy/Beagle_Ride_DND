/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * GO Specifications.
 */
export interface GOConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_GO_CONFIG: Readonly<GOConfig> = Object.freeze({
  type: "GO",
  version: "1.0.0",
  stability: "STABLE"
});
