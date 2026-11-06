/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { BasicConfig, DEFAULT_BASIC_CONFIG } from "./General/index";

/**
 * Basic Controller.
 */
export class BasicController {
  private config: BasicConfig = { ...DEFAULT_BASIC_CONFIG };
  public getStatus() {
    return { module: "Basic", active: true, config: this.config };
  }
}

export const basicController = new BasicController();
