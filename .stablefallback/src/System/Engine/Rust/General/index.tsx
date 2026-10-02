/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Rust Specifications.
 */
export interface RustConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_RUST_CONFIG: Readonly<RustConfig> = Object.freeze({
  type: "Rust",
  version: "1.0.0",
  stability: "STABLE"
});
