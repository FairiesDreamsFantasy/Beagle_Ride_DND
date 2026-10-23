/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { GOConfig, DEFAULT_GO_CONFIG } from "./General/index";

/**
 * GO Controller.
 */
export class GOController {
  private config: GOConfig = { ...DEFAULT_GO_CONFIG };
  public getStatus() {
    return { module: "GO", active: true, config: this.config };
  }
}

export const gOController = new GOController();
