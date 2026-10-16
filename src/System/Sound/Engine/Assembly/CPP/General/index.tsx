/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CPP Specifications.
 */
export interface CPPConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_CPP_CONFIG: Readonly<CPPConfig> = Object.freeze({
  type: "CPP",
  version: "1.0.0",
  stability: "STABLE"
});
