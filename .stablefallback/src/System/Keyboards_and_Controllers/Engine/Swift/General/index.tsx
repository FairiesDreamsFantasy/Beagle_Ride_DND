/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Swift Specifications.
 */
export interface SwiftConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_SWIFT_CONFIG: Readonly<SwiftConfig> = Object.freeze({
  type: "Swift",
  version: "1.0.0",
  stability: "STABLE"
});
