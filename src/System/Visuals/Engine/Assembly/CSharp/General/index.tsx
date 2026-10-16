/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CSharp Specifications.
 */
export interface CSharpConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_CSHARP_CONFIG: Readonly<CSharpConfig> = Object.freeze({
  type: "CSharp",
  version: "1.0.0",
  stability: "STABLE"
});
