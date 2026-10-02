/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Audio35mmConfig {
  channels: 'STEREO' | 'MONO' | 'TRRS_AUX';
  sampleRateHz: 48000 | 96000 | 192000;
  impedanceOhms: number;
}

export const DEFAULT_35MM_CONFIG: Readonly<Audio35mmConfig> = Object.freeze({
  channels: 'STEREO',
  sampleRateHz: 192000,
  impedanceOhms: 32
});
