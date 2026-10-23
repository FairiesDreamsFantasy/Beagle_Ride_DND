/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { FreeDOSConfig, DEFAULT_FREEDOS_CONFIG } from "./General/index";

/**
 * FreeDOS Controller.
 */
export class FreeDOSController {
  private config: FreeDOSConfig = { ...DEFAULT_FREEDOS_CONFIG };
  public getStatus() {
    return { module: "FreeDOS", active: true, config: this.config };
  }
}

export const freeDOSController = new FreeDOSController();
