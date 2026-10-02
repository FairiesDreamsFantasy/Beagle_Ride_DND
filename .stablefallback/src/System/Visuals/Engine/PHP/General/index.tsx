/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PHP Specifications.
 */
export interface PHPConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_PHP_CONFIG: Readonly<PHPConfig> = Object.freeze({
  type: "PHP",
  version: "1.0.0",
  stability: "STABLE"
});
