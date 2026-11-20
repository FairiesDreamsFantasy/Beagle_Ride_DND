/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/3-D/index.tsx
 * 3-D Architectural Projection, S15.16 Fixed-Point Kinematics & N64 Vertex Lighting for Building Blocks.
 */

import { TrigLUT } from '../../../Engine/Mathematics/LUT/Trig';
import { ReciprocalDyLUT, RECIPROCAL_LUT_SIZE } from '../../../Engine/Mathematics/LUT/Shading';

export interface BlockVertex3D {
  x: number;
  y: number;
  z: number;
}

export interface BlockProjectedQuad {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  depth: number;
  visible: boolean;
}

const FIXED_SHIFT = 16;
const FIXED_ONE = 1 << FIXED_SHIFT;

export const BlockAnimation3D = {
  fixedPointFormat: 'S15.16' as const,

  toFixed16(val: number): number {
    return (val * FIXED_ONE) | 0;
  },

  fromFixed16(fixed: number): number {
    return fixed / FIXED_ONE;
  },

  /**
   * Computes O(1) Mode-7 perspective scanline distance using ReciprocalDyLUT.
   */
  computePerspectiveDistance(dy: number, verticalHeight: number, effectiveFov: number): number {
    const absDy = dy < 0 ? -dy : dy;
    if (absDy === 0) return 0;
    const invDy = absDy < RECIPROCAL_LUT_SIZE ? ReciprocalDyLUT[absDy] : (1.0 / absDy);
    return verticalHeight * effectiveFov * invDy;
  },

  /**
   * Computes Lambertian + ambient architectural face illumination factor in [0.25, 1.0].
   */
  evaluateSurfaceIllumination(
    nx: number,
    ny: number,
    nz: number,
    lx: number = -0.35,
    ly: number = -0.68,
    lz: number = 0.64,
    ambient: number = 0.32
  ): number {
    const dot = nx * lx + ny * ly + nz * lz;
    const diffuse = dot > 0 ? dot : 0;
    const lit = ambient + (1.0 - ambient) * diffuse;
    return lit > 1.0 ? 1.0 : lit;
  },

  /**
   * Projects an axis-aligned 3D architectural pillar/door segment into screen bounds with zero allocations.
   */
  projectVerticalSpanInto(
    out: BlockProjectedQuad,
    wx0: number,
    wy0: number,
    wx1: number,
    wy1: number,
    heightZ: number,
    camX: number,
    camY: number,
    camZ: number,
    yawDeg: number,
    focalPx: number,
    screenW: number,
    screenH: number
  ): BlockProjectedQuad {
    const cosY = TrigLUT.cosInterpolated(yawDeg);
    const sinY = TrigLUT.sinInterpolated(yawDeg);

    const dx0 = wx0 - camX;
    const dy0 = wy0 - camY;
    const rotX0 = dx0 * cosY - dy0 * sinY;
    const rotY0 = dx0 * sinY + dy0 * cosY;

    const dx1 = wx1 - camX;
    const dy1 = wy1 - camY;
    const rotX1 = dx1 * cosY - dy1 * sinY;
    const rotY1 = dx1 * sinY + dy1 * cosY;

    if (rotY0 <= 0.25 || rotY1 <= 0.25) {
      out.x0 = 0;
      out.y0 = 0;
      out.x1 = 0;
      out.y1 = 0;
      out.depth = rotY0 < rotY1 ? rotY0 : rotY1;
      out.visible = false;
      return out;
    }

    const halfW = screenW * 0.5;
    const halfH = screenH * 0.5;
    out.x0 = halfW + (rotX0 * focalPx) / rotY0;
    out.y0 = halfH + (camZ * focalPx) / rotY0;
    out.x1 = halfW + (rotX1 * focalPx) / rotY1;
    out.y1 = halfH - ((heightZ - camZ) * focalPx) / rotY1;
    out.depth = (rotY0 + rotY1) * 0.5;
    out.visible = !(Math.max(out.x0, out.x1) < 0 || Math.min(out.x0, out.x1) > screenW);
    return out;
  }
};

export default BlockAnimation3D;
