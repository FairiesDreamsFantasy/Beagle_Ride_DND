/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Panner General Types and Constants.
 */
export type PanningModel = 'equalpower' | 'HRTF';
export type DistanceModel = 'linear' | 'inverse' | 'exponential';

export interface PannerConfiguration {
  panningModel: PanningModel;
  distanceModel: DistanceModel;
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
}

export const DEFAULT_PANNER_CONFIG: Readonly<PannerConfiguration> = Object.freeze({
  panningModel: 'equalpower',
  distanceModel: 'inverse',
  refDistance: 1,
  maxDistance: 10000,
  rolloffFactor: 1,
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 0
});
