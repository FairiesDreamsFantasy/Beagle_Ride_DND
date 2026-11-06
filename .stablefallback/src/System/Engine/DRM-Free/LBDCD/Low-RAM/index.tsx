/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { LowRAMConfig, DEFAULT_LOW_RAM_CONFIG } from './General/index';

export class LowRAMBufferManager {
  private config: LowRAMConfig = { ...DEFAULT_LOW_RAM_CONFIG };

  public getMemoryStrategy() {
    return this.config;
  }
}

export const lowRAMBufferManager = new LowRAMBufferManager();
