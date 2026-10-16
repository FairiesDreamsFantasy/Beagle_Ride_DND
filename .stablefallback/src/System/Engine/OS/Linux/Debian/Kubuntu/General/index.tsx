/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Kubuntu Specifications.
 */
export interface KubuntuConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_KUBUNTU_CONFIG: Readonly<KubuntuConfig> = Object.freeze({
  type: "Kubuntu",
  version: "1.0.0",
  stability: "STABLE"
});
