/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * NumPy Specifications.
 */
export interface NumPyConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_NUMPY_CONFIG: Readonly<NumPyConfig> = Object.freeze({
  type: "NumPy",
  version: "1.0.0",
  stability: "STABLE"
});
