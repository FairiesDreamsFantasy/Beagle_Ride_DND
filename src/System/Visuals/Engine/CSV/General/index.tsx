/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CSV Specifications.
 */
export interface CSVConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_CSV_CONFIG: Readonly<CSVConfig> = Object.freeze({
  type: "CSV",
  version: "1.0.0",
  stability: "STABLE"
});
