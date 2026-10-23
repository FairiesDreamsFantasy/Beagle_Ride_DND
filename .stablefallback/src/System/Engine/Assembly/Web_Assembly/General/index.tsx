/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * WebAssembly Specifications.
 */
export interface WebAssemblyConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_WEBASSEMBLY_CONFIG: Readonly<WebAssemblyConfig> = Object.freeze({
  type: "WebAssembly",
  version: "1.0.0",
  stability: "STABLE"
});
