/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import { EQBand, DEFAULT_EQ_BANDS } from './General/index';

/**
 * Parametric Equalizer Controller.
 */
export class EqualizerController {
  private bands: EQBand[] = [...DEFAULT_EQ_BANDS];

  public getBands(): EQBand[] {
    return this.bands;
  }
}

export const equalizerController = new EqualizerController();
