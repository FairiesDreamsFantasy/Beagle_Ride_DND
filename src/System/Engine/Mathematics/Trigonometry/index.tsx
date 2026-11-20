/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrigLUT } from '../LUT/Trig';

export const TrigonometryModule = {
  sin: (rad: number): number => TrigLUT.sin((rad * 180) / Math.PI),
  cos: (rad: number): number => TrigLUT.cos((rad * 180) / Math.PI),
  sinDeg: (deg: number): number => TrigLUT.sin(deg),
  cosDeg: (deg: number): number => TrigLUT.cos(deg),
  normalizeAngleDeg: (deg: number): number => ((deg % 360) + 360) % 360,
  shortestAngleDeltaDeg: (fromDeg: number, toDeg: number): number => {
    let diff = toDeg - fromDeg;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    return diff;
  }
};
