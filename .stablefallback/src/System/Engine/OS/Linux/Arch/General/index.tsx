/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Arch Specifications.
 */
export interface ArchConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_ARCH_CONFIG: Readonly<ArchConfig> = Object.freeze({
  type: "Arch",
  version: "1.0.0",
  stability: "STABLE"
});
