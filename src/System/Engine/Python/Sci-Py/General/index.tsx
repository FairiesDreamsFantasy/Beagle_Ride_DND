/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SciPy Specifications.
 */
export interface SciPyConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_SCIPY_CONFIG: Readonly<SciPyConfig> = Object.freeze({
  type: "SciPy",
  version: "1.0.0",
  stability: "STABLE"
});
