/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { SwiftConfig, DEFAULT_SWIFT_CONFIG } from "./General/index";

/**
 * Swift Controller.
 */
export class SwiftController {
  private config: SwiftConfig = { ...DEFAULT_SWIFT_CONFIG };
  public getStatus() {
    return { module: "Swift", active: true, config: this.config };
  }
}

export const swiftController = new SwiftController();
