/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * MySQL Specifications.
 */
export interface MySQLConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_MYSQL_CONFIG: Readonly<MySQLConfig> = Object.freeze({
  type: "MySQL",
  version: "1.0.0",
  stability: "STABLE"
});
