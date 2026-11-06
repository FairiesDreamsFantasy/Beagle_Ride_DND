/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lubuntu Specifications.
 */
export interface LubuntuConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_LUBUNTU_CONFIG: Readonly<LubuntuConfig> = Object.freeze({
  type: "Lubuntu",
  version: "1.0.0",
  stability: "STABLE"
});
