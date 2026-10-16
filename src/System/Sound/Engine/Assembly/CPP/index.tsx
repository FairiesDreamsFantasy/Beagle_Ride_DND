/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CPPConfig, DEFAULT_CPP_CONFIG } from "./General/index";

/**
 * CPP Controller.
 */
export class CPPController {
  private config: CPPConfig = { ...DEFAULT_CPP_CONFIG };
  public getStatus() {
    return { module: "CPP", active: true, config: this.config };
  }
}

export const cPPController = new CPPController();
