/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AnalogAggregateConfig {
  allowAnalogCapture: true;
  zeroCopyBuffer: true;
}

export const DEFAULT_ANALOG_AGGREGATE: Readonly<AnalogAggregateConfig> = Object.freeze({
  allowAnalogCapture: true,
  zeroCopyBuffer: true
});
