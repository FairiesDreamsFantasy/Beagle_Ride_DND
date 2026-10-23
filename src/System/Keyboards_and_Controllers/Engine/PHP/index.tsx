/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { PHPConfig, DEFAULT_PHP_CONFIG } from "./General/index";

/**
 * PHP Controller.
 */
export class PHPController {
  private config: PHPConfig = { ...DEFAULT_PHP_CONFIG };
  public getStatus() {
    return { module: "PHP", active: true, config: this.config };
  }
}

export const pHPController = new PHPController();
