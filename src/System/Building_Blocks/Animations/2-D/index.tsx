/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/2-D/index.tsx
 * Planar 2-D Animation Kinematics for Building Blocks (foliage sway, lanterns, banners, doors).
 * Grounded in precomputed TrigLUT harmonics and zero-allocation *Into transforms.
 */

import { TrigLUT } from '../../../Engine/Mathematics/LUT/Trig';

export interface BlockTransform2D {
  x: number;
  y: number;
  rotationDeg: number;
  scaleX: number;
  scaleY: number;
}

export const BlockAnimation2D = {
  pipeline: 'PLANAR_RIGID_2D' as const,

  /**
   * Computes deterministic botanical wind sway displacement along X/Y using O(1) TrigLUT.
   */
  evaluateFoliageSway(timeSec: number, worldX: number, worldY: number, amplitude: number = 0.35): number {
    const phaseDeg = (timeSec * 108 + worldX * 3.7 + worldY * 2.3) % 360;
    return TrigLUT.sinInterpolated(phaseDeg) * amplitude;
  },

  /**
   * Computes hinged door swing angle (0..openDeg) using smoothstep ease over normalized t in [0, 1].
   */
  evaluateDoorSwingDeg(t: number, maxOpenDeg: number = 90): number {
    const clamped = t < 0 ? 0 : (t > 1 ? 1 : t);
    const smooth = clamped * clamped * (3 - 2 * clamped);
    return smooth * maxOpenDeg;
  },

  /**
   * Zero-allocation planar rigid 2D transform evaluation into a caller-owned buffer.
   */
  evaluateRigidTransformInto(
    out: BlockTransform2D,
    baseX: number,
    baseY: number,
    pivotX: number,
    pivotY: number,
    angleDeg: number,
    scaleX: number = 1.0,
    scaleY: number = 1.0
  ): BlockTransform2D {
    const cos = TrigLUT.cosInterpolated(angleDeg);
    const sin = TrigLUT.sinInterpolated(angleDeg);
    const dx = (baseX - pivotX) * scaleX;
    const dy = (baseY - pivotY) * scaleY;
    out.x = pivotX + dx * cos - dy * sin;
    out.y = pivotY + dx * sin + dy * cos;
    out.rotationDeg = ((angleDeg % 360) + 360) % 360;
    out.scaleX = scaleX;
    out.scaleY = scaleY;
    return out;
  },

  /**
   * Computes harmonic lantern / banner oscillation factor in [-1, 1].
   */
  evaluateHarmonicPhase(frame: number, freqHz: number, phaseOffsetDeg: number = 0): number {
    const deg = (frame * freqHz * 6.0 + phaseOffsetDeg) % 360;
    return TrigLUT.sinInterpolated(deg);
  }
};

export default BlockAnimation2D;
