/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DualToneGeneralRegistry = {
  version: '1.0.0',
  description: 'Dual-tone sound configurations for system-level alerts and confirmations.',
  parameters: {
    confirmation: {
      freq1: 880,
      freq2: 1320,
      duration: 0.15
    },
    alert: {
      freq1: 440,
      freq2: 220,
      duration: 0.25
    }
  }
};
