/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Basic Specifications.
 */
export interface BasicConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_BASIC_CONFIG: Readonly<BasicConfig> = Object.freeze({
  type: "Basic",
  version: "1.0.0",
  stability: "STABLE"
});
