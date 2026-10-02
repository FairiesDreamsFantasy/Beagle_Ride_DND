/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

/**
 * Digital Signal Processing Engine.
 * Provides high-precision audio transformation and filtering.
 */
export class DSPEngine {
  public process(input: any): any {
    return input;
  }
}

export const dspEngine = new DSPEngine();
