/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Ubuntu Specifications.
 */
export interface UbuntuConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_UBUNTU_CONFIG: Readonly<UbuntuConfig> = Object.freeze({
  type: "Ubuntu",
  version: "1.0.0",
  stability: "STABLE"
});
