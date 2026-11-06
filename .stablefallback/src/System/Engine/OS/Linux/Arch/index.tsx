/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { ArchConfig, DEFAULT_ARCH_CONFIG } from "./General/index";

/**
 * Arch Controller.
 */
export class ArchController {
  private config: ArchConfig = { ...DEFAULT_ARCH_CONFIG };
  public getStatus() {
    return { module: "Arch", active: true, config: this.config };
  }
}

export const archController = new ArchController();
