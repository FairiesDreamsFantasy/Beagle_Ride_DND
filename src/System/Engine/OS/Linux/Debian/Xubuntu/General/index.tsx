/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Xubuntu Specifications.
 */
export interface XubuntuConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_XUBUNTU_CONFIG: Readonly<XubuntuConfig> = Object.freeze({
  type: "Xubuntu",
  version: "1.0.0",
  stability: "STABLE"
});
