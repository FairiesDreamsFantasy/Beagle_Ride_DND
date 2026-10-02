/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { Audio35mmConfig, DEFAULT_35MM_CONFIG } from './General/index';

export class Audio35mmOutputController {
  private config: Audio35mmConfig = { ...DEFAULT_35MM_CONFIG };

  public getStatus() {
    return { port: '3.5MM', active: true, config: this.config };
  }
}

export const audio35mmOutputController = new Audio35mmOutputController();
