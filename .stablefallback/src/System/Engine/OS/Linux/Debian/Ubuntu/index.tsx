/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { UbuntuConfig, DEFAULT_UBUNTU_CONFIG } from "./General/index";

/**
 * Ubuntu Controller.
 */
export class UbuntuController {
  private config: UbuntuConfig = { ...DEFAULT_UBUNTU_CONFIG };
  public getStatus() {
    return { module: "Ubuntu", active: true, config: this.config };
  }
}

export const ubuntuController = new UbuntuController();
