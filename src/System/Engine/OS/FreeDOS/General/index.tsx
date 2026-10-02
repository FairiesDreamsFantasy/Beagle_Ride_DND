/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * FreeDOS Specifications.
 */
export interface FreeDOSConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_FREEDOS_CONFIG: Readonly<FreeDOSConfig> = Object.freeze({
  type: "FreeDOS",
  version: "1.0.0",
  stability: "STABLE"
});
