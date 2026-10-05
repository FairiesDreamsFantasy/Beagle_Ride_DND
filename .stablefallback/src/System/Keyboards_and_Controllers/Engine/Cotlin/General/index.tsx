/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cotlin Specifications.
 */
export interface CotlinConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_COTLIN_CONFIG: Readonly<CotlinConfig> = Object.freeze({
  type: "Cotlin",
  version: "1.0.0",
  stability: "STABLE"
});
