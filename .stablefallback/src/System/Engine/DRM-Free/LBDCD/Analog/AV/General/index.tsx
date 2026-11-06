/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AVPortConfig {
  videoStandard: 'NTSC' | 'PAL';
  compositeVideo: true;
  stereoAudioRCA: true;
}

export const DEFAULT_AV_CONFIG: Readonly<AVPortConfig> = Object.freeze({
  videoStandard: 'NTSC',
  compositeVideo: true,
  stereoAudioRCA: true
});
