/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { KubuntuConfig, DEFAULT_KUBUNTU_CONFIG } from "./General/index";

/**
 * Kubuntu Controller.
 */
export class KubuntuController {
  private config: KubuntuConfig = { ...DEFAULT_KUBUNTU_CONFIG };
  public getStatus() {
    return { module: "Kubuntu", active: true, config: this.config };
  }
}

export const kubuntuController = new KubuntuController();
