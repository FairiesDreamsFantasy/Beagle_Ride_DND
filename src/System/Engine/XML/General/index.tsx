/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * XML Specifications.
 */
export interface XMLConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_XML_CONFIG: Readonly<XMLConfig> = Object.freeze({
  type: "XML",
  version: "1.0.0",
  stability: "STABLE"
});
