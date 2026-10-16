/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { MySQLConfig, DEFAULT_MYSQL_CONFIG } from "./General/index";

/**
 * MySQL Controller.
 */
export class MySQLController {
  private config: MySQLConfig = { ...DEFAULT_MYSQL_CONFIG };
  public getStatus() {
    return { module: "MySQL", active: true, config: this.config };
  }
}

export const mySQLController = new MySQLController();
